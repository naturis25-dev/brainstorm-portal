const fs = require('fs');
const p = 'frontend/js/app.js';
let content = fs.readFileSync(p, 'utf8');

content = content.replace(/renderMap\(\);/g, "");
content = content.replace(/function renderMap\(\) \{[\s\S]*?\}\n/g, "");

fs.writeFileSync(p, content);
console.log("Removed old renderMap references");
