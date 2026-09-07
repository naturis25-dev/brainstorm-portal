const fs = require('fs');
let p = 'frontend/js/app.js';
let content = fs.readFileSync(p, 'utf8');

content = content.replace("const bar = document.getElementById(`mv-bar-${p.id}`);", "const bar = document.getElementById(`mv-bar-${p.id}`);\n          if (bar) bar.style.display = 'flex';\n          if (text) text.textContent = 'Downloading massive 3D Data...';");

fs.writeFileSync(p, content);
console.log("Restored missing lines");
