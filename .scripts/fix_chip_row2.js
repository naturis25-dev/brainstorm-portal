const fs = require('fs');
let p = 'frontend/css/style.css';
let content = fs.readFileSync(p, 'utf8');

content = content.replace(/\.chip-row/g, "#categoryChipRow");
fs.writeFileSync(p, content);
console.log("Fixed all category chip row selectors");
