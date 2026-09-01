const fs = require('fs');
let p = 'frontend/index.html';
let content = fs.readFileSync(p, 'utf8');

content = content.replace(/assets\/logo\.png/g, "assets/logo_16.png");
content = content.replace(/v=\d+/g, "v=" + Date.now()); // bump version

fs.writeFileSync(p, content);
console.log("Updated logo references");
