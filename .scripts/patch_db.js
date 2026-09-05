const fs = require('fs');
const p = 'backend/database.js';
let content = fs.readFileSync(p, 'utf8');
content = content.replace(
  'stmt.run(\n      project.id || Date.now().toString(),',
  'project.id = project.id || Date.now().toString();\n    stmt.run(\n      project.id,'
);
fs.writeFileSync(p, content);
console.log("database.js patched.");
