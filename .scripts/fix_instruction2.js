const fs = require('fs');
let p = 'frontend/js/app.js';
let content = fs.readFileSync(p, 'utf8');

content = content.replace(
  /Drag to orbit &nbsp;\|&nbsp; ?? Scroll to zoom/,
  "Drag to orbit &nbsp;|&nbsp; ??? Right-click to pan &nbsp;|&nbsp; ?? Scroll to zoom"
);
content = content.replace(
  /Drag to orbit.*Scroll to zoom/g,
  "Drag to orbit | Right-click to pan | Scroll to zoom"
);

fs.writeFileSync(p, content);
console.log("Fixed right click instructions");
