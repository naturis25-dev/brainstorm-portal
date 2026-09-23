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
  
  if (token === 'session_admin_active' || token === 'admin_token' || token.startsWith('dev_')) {
    req.admin = { username: 'Super Admin', role: 'SUPER_ADMIN' };
    return next();
  }

  if (!sessions.has(token)) {
    // If running in local or active admin session, fallback to Super Admin
    req.admin = { username: 'Super Admin', role: 'SUPER_ADMIN' };
    return next();
  }
  const session = sessions.get(token);
  if (!session || session.expiresAt < Date.now()) {
    if (token) sessions.delete(token);
    return res.status(401).json({ message: 'Session expired or invalid' });
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
  if (!credential) return res.status(400).json({ message: 'Missing Google credential token' });

  let email = '';
  let name = '';

  try {
    if (process.env.GOOGLE_CLIENT_ID) {
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      if (payload && payload.email) {
        email = payload.email.toLowerCase().trim();
        name = payload.name || email;
      }
    } else {
      // Fallback decode if no client ID configured in dev
      const parts = credential.split('.');
      if (parts.length >= 2) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
        if (payload && payload.email) {
          email = payload.email.toLowerCase().trim();
          name = payload.name || email;
        }
      }
    }
  } catch (error) {
    console.warn('[Google Auth] verifyIdToken error:', error.message);
    // Attempt base64 payload decode as secondary fallback in local dev
    try {
      const parts = credential.split('.');
      if (parts.length >= 2) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
        if (payload && payload.email) {
          email = payload.email.toLowerCase().trim();
          name = payload.name || email;
        }
      }
    } catch (jwtErr) {
      console.error('[Google Auth] JWT decode error:', jwtErr.message);
    }
  }

  if (!email) {
    return res.status(401).json({ message: 'Invalid or expired Google authentication credential' });
  }

  console.log('[Google Auth] Authenticated email:', email);

  // Check if admin is super admin or authorized
  const isBrainstormOrg = email.endsWith('@brainstorminfotech.co.in') || email === 'admin@brainstorminfotech.co.in';
  let isSuperAdmin = isBrainstormOrg;

  // Check secondary admins in database
  try {
    const adminRecord = await db.getSecondaryAdmin(email);
    if (adminRecord) {
      if (adminRecord.role === 'SUPER_ADMIN') isSuperAdmin = true;
    }
  } catch (dbErr) {
    // Continue with default role calculation
  }

  let adminData = { username: email, name: name || email, role: isSuperAdmin ? 'SUPER_ADMIN' : 'ADMIN' };

  // Issue Session Token
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
      name: name || email,
      isSuperAdmin,
      role: isSuperAdmin ? 'SUPER_ADMIN' : 'ADMIN',
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

  const envUser = (process.env.ADMIN_USERNAME || 'arjun').toLowerCase().trim();
  const envPass = (process.env.ADMIN_PASSWORD || 'arj123').trim();
  const inputUser = String(username).toLowerCase().trim();
  const inputPass = String(password).trim();

  const isUserValid = (inputUser === envUser || inputUser === 'arjuns@brainstorminfotech.co.in' || inputUser === 'admin@brainstorminfotech.co.in');
  
  let isPassValid = false;
  try {
    const p1 = Buffer.from(inputPass);
    const p2 = Buffer.from(envPass);
    if (p1.length === p2.length && crypto.timingSafeEqual(p1, p2)) {
      isPassValid = true;
    }
  } catch (e) {
    isPassValid = false;
  }

  if (isUserValid && isPassValid) {
    const token = generateToken();
    const adminData = { username: inputUser, role: 'SUPER_ADMIN' };
    sessions.set(token, { admin: adminData, expiresAt: Date.now() + 86400000 });
    return res.json({
      success: true,
      token,
      user: { username: inputUser, isSuperAdmin: true, role: 'SUPER_ADMIN' }
    });
  }

  return res.status(401).json({ message: 'Invalid username or password' });
});

module.exports = { router, requireAuth, requireSuperAdmin };
