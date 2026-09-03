const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const db = require('../db.js');
const crypto = require('crypto');

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const sessions = new Map();

const generateToken = () => crypto.randomBytes(32).toString('hex');

// ─── Middleware ───────────────────────────────────────────────────────────────
const requireAuth = (req, res, next) => {
  const token = getToken(req);
  if (!token || !sessions.has(token)) return res.status(401).json({ message: 'Unauthorized' });
  const session = sessions.get(token);
  if (session.expiresAt < Date.now()) {
    sessions.delete(token);
    return res.status(401).json({ message: 'Session expired' });
  }
  session.expiresAt = Date.now() + 24 * 60 * 60 * 1000;
  req.admin = session.admin;
  next();
};

const requireSuperAdmin = (req, res, next) => {
  requireAuth(req, res, () => {
    if (req.admin.role !== 'SUPER_ADMIN') return res.status(403).json({ message: 'Forbidden' });
    next();
  });
};

const getToken = (req) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) return authHeader.split(' ')[1];
  return null;
};

// ─── Google Sign-In Endpoint ──────────────────────────────────────────────────
router.post('/google', async (req, res) => {
  const { credential } = req.body;
  if (!credential) return res.status(400).json({ message: 'Missing credential' });

  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const email = payload.email.toLowerCase();

    // 1. Strict Domain Check
    if (!email.endsWith('@brainstorminfotech.co.in')) {
      return res.status(403).json({ message: 'Access denied: Only @brainstorminfotech.co.in emails are allowed.' });
    }

    let adminData = null;
    let isSuperAdmin = false;

    // 2. Database / Allowlist Check
    // First check if it is the primary Super Admin (from .env)
    const masterEmail = (process.env.ADMIN_EMAIL || process.env.ADMIN_USERNAME || '').toLowerCase();
    
    if (email === masterEmail) {
      adminData = { username: email, role: 'SUPER_ADMIN' };
      isSuperAdmin = true;
    } else {
      // Check if they were added as a Secondary Admin in the DB
      try {
        const admin = await db.getSecondaryAdmin(email);
        if (admin) {
          adminData = { username: email, role: admin.role || 'MANAGER' };
        }
      } catch (e) {
        console.error('[Google Auth] DB error:', e);
      }
    }

    if (!adminData) {
      return res.status(403).json({ message: 'Access denied: Your email is not registered as an admin.' });
    }

    // 3. Issue Session
    const token = generateToken();
    sessions.set(token, {
      admin: adminData,
      expiresAt: Date.now() + 86400000,
    });

    return res.json({
      success: true,
      token,
      user: {
        username: email,
        isSuperAdmin,
        role: 'admin',
      },
    });

  } catch (error) {
    console.error('[Google Auth] Error verifying token:', error.message);
    return res.status(401).json({ message: 'Invalid Google token. Please try again.' });
  }
});

// ─── Session Management ───────────────────────────────────────────────────────
router.post('/logout', (req, res) => {
  const token = getToken(req);
  if (token) sessions.delete(token);
  res.json({ success: true });
});

router.get('/verify', (req, res) => {
  const session = sessions.get(getToken(req));
  if (session && session.expiresAt >= Date.now()) res.json({ valid: true, admin: session.admin });
  else res.status(401).json({ valid: false });
});

// ─── Admin Management (Updated for Google Sign-In) ────────────────────────────
// Passwords are no longer needed, we just store the email in the DB
router.post('/admins', requireSuperAdmin, async (req, res) => {
  let { username } = req.body;
  if (!username) return res.status(400).json({ message: 'Email is required' });
  
  username = username.toLowerCase().trim();
  
  // Enforce domain on creation too
  if (!username.endsWith('@brainstorminfotech.co.in')) {
    return res.status(400).json({ message: 'Admin must have a @brainstorminfotech.co.in email.' });
  }

  try {
    // Insert with dummy hash/salt since we rely entirely on Google for auth
    await db.insertSecondaryAdmin(username, 'google_auth', 'google_auth', 'MANAGER');
    res.status(201).json({ success: true });
  } catch (e) { res.status(500).json({ message: 'Error adding admin' }); }
});

router.get('/admins', requireSuperAdmin, async (req, res) => {
  try { res.json(await db.getAllSecondaryAdmins()); }
  catch (e) { res.status(500).json({ message: 'Error' }); }
});

router.delete('/admins/:username', requireSuperAdmin, async (req, res) => {
  try {
    const success = await db.deleteSecondaryAdmin(req.params.username.toLowerCase());
    if (success) res.json({ success: true });
    else res.status(404).json({ message: 'Not found' });
  } catch (e) { res.status(500).json({ message: 'Error' }); }
});


router.get('/audit-logs', requireSuperAdmin, async (req, res) => {
  try {
    const logs = await db.getAuditLogs(100);
    res.json(logs);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Error fetching audit logs' });
  }
});

module.exports = { router, requireAuth, requireSuperAdmin };
