const fs = require('fs');
let p = 'frontend/index.html';
let content = fs.readFileSync(p, 'utf8');
content = content.replace(/v=\d+/g, "v=" + Date.now());
fs.writeFileSync(p, content);
