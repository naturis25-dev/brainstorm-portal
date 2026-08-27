const express = require('express');
const crypto = require('crypto');
const db = require('../db.js');

const router = express.Router();

const sessions = new Map();
const generateToken = () => crypto.randomBytes(32).toString('hex');

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

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
    const token = generateToken();
    sessions.set(token, { admin: { username, role: 'SUPER_ADMIN' }, expiresAt: Date.now() + 86400000 });
    return res.json({ success: true, token, user: { username, isSuperAdmin: true, role: 'admin' } });
  }
  try {
    const admin = await db.getSecondaryAdmin(username);
    if (admin) {
      const hash = crypto.pbkdf2Sync(password, admin.salt, 1000, 64, 'sha512').toString('hex');
      if (hash === admin.passwordHash) {
        const token = generateToken();
        sessions.set(token, { admin: { username, role: admin.role || 'MANAGER' }, expiresAt: Date.now() + 86400000 });
        return res.json({ success: true, token, user: { username, isSuperAdmin: false, role: 'admin' } });
      }
    }
  } catch(e) { console.error(e); }
  res.status(401).json({ message: 'Invalid credentials' });
});

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

router.post('/admins', requireSuperAdmin, async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: 'Required fields missing' });
  try {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    await db.insertSecondaryAdmin(username, hash, salt, 'MANAGER');
    res.status(201).json({ success: true });
  } catch (e) { res.status(500).json({ message: 'Error' }); }
});

router.get('/admins', requireSuperAdmin, async (req, res) => {
  try { res.json(await db.getAllSecondaryAdmins()); }
  catch (e) { res.status(500).json({ message: 'Error' }); }
});

router.delete('/admins/:username', requireSuperAdmin, async (req, res) => {
  try {
    const success = await db.deleteSecondaryAdmin(req.params.username);
    if (success) res.json({ success: true });
    else res.status(404).json({ message: 'Not found' });
  } catch (e) { res.status(500).json({ message: 'Error' }); }
});

module.exports = { router, requireAuth, requireSuperAdmin };
