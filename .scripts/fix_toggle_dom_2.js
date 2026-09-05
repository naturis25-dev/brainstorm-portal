const fs = require('fs');
let p = 'frontend/js/app.js';
let content = fs.readFileSync(p, 'utf8');

content = content.replace("document.querySelector('.nav-pills').appendChild(btn);", "document.querySelector('.top-actions').appendChild(btn);");
fs.writeFileSync(p, content);
console.log("Fixed desktop re-attach target");
