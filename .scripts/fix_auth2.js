const fs = require('fs');
const p = 'backend/routes/auth.js';
let content = fs.readFileSync(p, 'utf8');

content = content.replace(
  "return res.json({ token, username, role: admin.role || 'MANAGER' });",
  "return res.json({ success: true, token, user: { username, isSuperAdmin: false, role: 'admin' } });"
);

fs.writeFileSync(p, content);
console.log("Restored secondary admin payload!");
