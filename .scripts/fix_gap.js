const fs = require('fs');
let p = 'frontend/css/style.css';
let content = fs.readFileSync(p, 'utf8');

content = content.replace("padding: 0 12px 65px 12px !important; /* Keep bottom padding for floating bar */", "padding: 0 12px 12px 12px !important;");
content = content.replace("padding-bottom: 70px !important; /* Leave proper space for fixed footer items to not overlap map on scroll */", "padding-bottom: 12px !important;");
fs.writeFileSync(p, content);
console.log("Reduced gap between chips and map");
