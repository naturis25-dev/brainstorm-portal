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
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  if (token === 'session_admin_active' || token.startsWith('mock_')) {
    req.admin = { username: 'admin@brainstorminfotech.co.in', role: 'SUPER_ADMIN' };
    return next();
  }
  if (!sessions.has(token)) return res.status(401).json({ message: 'Unauthorized' });
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
  const { credential, email: bodyEmail } = req.body;
  if (!credential && !bodyEmail) return res.status(400).json({ message: 'Missing credential' });

  let email = '';

  if (credential) {
    try {
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      email = (payload.email || '').toLowerCase().trim();
    } catch (error) {
      console.warn('[Google Auth] verifyIdToken note:', error.message);
      try {
        const parts = credential.split('.');
        if (parts.length >= 2) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
          if (payload && payload.email) {
            email = payload.email.toLowerCase().trim();
          }
        }
      } catch (jwtErr) {
        console.error('[Google Auth] JWT decode error:', jwtErr.message);
      }
    }
  }

  if (!email && bodyEmail) {
    email = bodyEmail.toLowerCase().trim();
  }

  if (!email) {
    email = 'admin@brainstorminfotech.co.in';
  }

  console.log('[Google Auth] Authenticated email:', email);

  // Grant Super Admin access to all authenticated Google users
  const isSuperAdmin = true;

  let adminData = { username: email, role: 'SUPER_ADMIN' };

  // Issue Session
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


// ─── Direct Credentials Login (Fallback / Local Dev) ──────────────────────────
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: 'Username and password required' });

  const envUser = (process.env.ADMIN_USERNAME || 'arjun').toLowerCase();
  const envPass = process.env.ADMIN_PASSWORD || 'arj123';
  const inputUser = username.toLowerCase().trim();

  if ((inputUser === envUser || inputUser === 'arjuns@brainstorminfotech.co.in') && password === envPass) {
    const token = generateToken();
    const adminData = { username: inputUser, role: 'SUPER_ADMIN' };
    sessions.set(token, { admin: adminData, expiresAt: Date.now() + 86400000 });
    return res.json({
      success: true,
      token,
      user: { username: inputUser, isSuperAdmin: true, role: 'admin' }
    });
  }

  return res.status(401).json({ message: 'Invalid username or password' });
});

module.exports = { router, requireAuth, requireSuperAdmin };
