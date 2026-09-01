const fs = require('fs');
let p = 'frontend/js/app.js';
let content = fs.readFileSync(p, 'utf8');

content = content.replace(/mv\.setAttribute\('min-field-of-view', '5deg'\);/g, "");
fs.writeFileSync(p, content);
console.log("Removed duplicate min-field-of-view");
