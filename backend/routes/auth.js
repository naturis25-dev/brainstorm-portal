const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const db = require('../database');

const ADMIN_USER = process.env.ADMIN_USERNAME;
const ADMIN_PASS = process.env.ADMIN_PASSWORD;
const SESSION_TTL_MS = 1000 * 60 * 60 * 8;
const sessions = new Map();

if (!ADMIN_USER || !ADMIN_PASS) {
  throw new Error('ADMIN_USERNAME and ADMIN_PASSWORD must be set before starting the portal.');
}

function credentialsMatch(username, password) {
  const suppliedUsername = Buffer.from(String(username));
  const suppliedPassword = Buffer.from(String(password));
  const expectedUsername = Buffer.from(ADMIN_USER);
  const expectedPassword = Buffer.from(ADMIN_PASS);
  if (suppliedUsername.length !== expectedUsername.length || suppliedPassword.length !== expectedPassword.length) {
    return false;
  }
  const usernameMatches = crypto.timingSafeEqual(
    suppliedUsername,
    expectedUsername
  );
  const passwordMatches = crypto.timingSafeEqual(
    suppliedPassword,
    expectedPassword
  );
  return usernameMatches && passwordMatches;
}

function getToken(req) {
  const header = req.get('authorization') || '';
  return header.startsWith('Bearer ') ? header.slice(7) : '';
}

function requireAdmin(req, res, next) {
  const session = sessions.get(getToken(req));
  if (!session || session.expiresAt < Date.now()) {
    if (getToken(req)) sessions.delete(getToken(req));
    return res.status(401).json({ message: 'Administrator authentication is required.' });
  }
  req.admin = session;
  next();
}

function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
}

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: "Username and password required." });
  }

  let valid = false;
  let isSuperAdmin = false;

  if (credentialsMatch(username, password)) {
    valid = true;
    isSuperAdmin = true;
  } else {
    const admin = db.getSecondaryAdmin(username);
    if (admin) {
      const hash = hashPassword(password, admin.salt);
      const expectedHash = Buffer.from(admin.passwordHash);
      const suppliedHash = Buffer.from(hash);
      if (expectedHash.length === suppliedHash.length && crypto.timingSafeEqual(suppliedHash, expectedHash)) {
        valid = true;
      }
    }
  }

  if (valid) {
    const token = crypto.randomBytes(32).toString('hex');
    sessions.set(token, { username, isSuperAdmin, expiresAt: Date.now() + SESSION_TTL_MS });
    return res.json({
      success: true,
      token,
      user: {
        username,
        role: "admin",
        isSuperAdmin
      }
    });
  } else {
    return res.status(401).json({ success: false, message: "Invalid username or password." });
  }
});

// GET /api/auth/verify
router.get('/verify', (req, res) => {
  const session = sessions.get(getToken(req));
  if (session && session.expiresAt >= Date.now()) {
    return res.json({ authenticated: true, user: session.username, isSuperAdmin: session.isSuperAdmin });
  }
  return res.status(401).json({ authenticated: false });
});

// POST /api/auth/admins
router.post('/admins', requireAdmin, (req, res) => {
  if (!req.admin.isSuperAdmin) {
    return res.status(403).json({ success: false, message: 'Only the super admin can create new admins.' });
  }
  
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password required.' });
  }
  
  try {
    const existing = db.getSecondaryAdmin(username);
    if (existing || username === ADMIN_USER) {
      return res.status(400).json({ success: false, message: 'Username already exists.' });
    }
    
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = hashPassword(password, salt);
    db.insertSecondaryAdmin(username, hash, salt);
    
    res.json({ success: true, message: 'Admin created successfully.' });
  } catch (error) {
    console.error('Error creating admin:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// GET /api/auth/admins
router.get('/admins', requireAdmin, (req, res) => {
  if (!req.admin.isSuperAdmin) {
    return res.status(403).json({ success: false, message: 'Only the super admin can list admins.' });
  }
  try {
    const admins = db.getAllSecondaryAdmins();
    res.json({ success: true, admins });
  } catch (error) {
    console.error('Error fetching admins:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// DELETE /api/auth/admins/:username
router.delete('/admins/:username', requireAdmin, (req, res) => {
  if (!req.admin.isSuperAdmin) {
    return res.status(403).json({ success: false, message: 'Only the super admin can delete admins.' });
  }
  const username = req.params.username;
  try {
    const success = db.deleteSecondaryAdmin(username);
    if (success) {
      res.json({ success: true, message: 'Admin deleted successfully.' });
    } else {
      res.status(404).json({ success: false, message: 'Admin not found.' });
    }
  } catch (error) {
    console.error('Error deleting admin:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

module.exports = { router, requireAdmin };
