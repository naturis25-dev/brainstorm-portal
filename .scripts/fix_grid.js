const fs = require('fs');
let p = 'frontend/css/style.css';
let content = fs.readFileSync(p, 'utf8');

// Replace light mode grid
content = content.replace(/background-image:\s*linear-gradient[^!]+!important;/g, "");
content = content.replace(/background-size:\s*40px\s+40px\s*!important;/g, "");

fs.writeFileSync(p, content);
console.log("Removed map grid");
