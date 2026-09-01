const fs = require('fs');
let p = 'frontend/js/app.js';
let content = fs.readFileSync(p, 'utf8');

content = content.replace("Parsing 3D geometry... (Browser will pause for a moment)", "Finalizing 3D Model...");

fs.writeFileSync(p, content);
console.log("Updated 3D model parsing text");
