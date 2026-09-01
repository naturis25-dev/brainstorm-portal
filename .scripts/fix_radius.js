const fs = require('fs');
let p = 'frontend/js/map.js';
let content = fs.readFileSync(p, 'utf8');

content = content.replace("var radius = 90;", "var radius = window.innerWidth <= 768 ? 60 : 90;");
fs.writeFileSync(p, content);
