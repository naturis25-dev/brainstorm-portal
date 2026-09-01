const fs = require('fs');
const p = 'backend/routes/auth.js';
let content = fs.readFileSync(p, 'utf8');

// Fix SUPER_ADMIN login return
content = content.replace(
  "return res.json({ token, username, role: 'SUPER_ADMIN' });",
  "return res.json({ success: true, token, user: { username, isSuperAdmin: true, role: 'admin' } });"
);

// Fix secondary admin login return
content = content.replace(
  "return res.json({ token, username, role: 'ADMIN' });",
  "return res.json({ success: true, token, user: { username, isSuperAdmin: false, role: 'admin' } });"
);

// Fix verify return
content = content.replace(
  "return res.json({ authenticated: true, admin: session.admin });",
  "return res.json({ authenticated: true, user: session.admin.username, isSuperAdmin: session.admin.role === 'SUPER_ADMIN' });"
);

// Fix GET admins return
content = content.replace(
  "res.json(admins);",
  "res.json({ success: true, admins });"
);

// Let's also check if POST /admins return was "res.status(201).json({ message: 'Created' });"
content = content.replace(
  "res.status(201).json({ message: 'Created' });",
  "res.json({ success: true, message: 'Admin created successfully.' });"
);

// Check if DELETE /admins was "res.json({ message: 'Deleted' });"
content = content.replace(
  "res.json({ message: 'Deleted' });",
  "res.json({ success: true, message: 'Admin deleted successfully.' });"
);

fs.writeFileSync(p, content);
console.log("Restored auth.js payloads!");
