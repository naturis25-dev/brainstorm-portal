const fs = require('fs');
let p = 'frontend/js/app.js';
let content = fs.readFileSync(p, 'utf8');

// The instruction text currently is:
// ??? Drag to orbit &nbsp;|&nbsp; ?? Scroll to zoom
// Let's add &nbsp;|&nbsp; ??? Right-click to pan
content = content.replace(
  "??? Drag to orbit &nbsp;|&nbsp; ?? Scroll to zoom",
  "??? Drag to orbit &nbsp;|&nbsp; ??? Right-click to pan &nbsp;|&nbsp; ?? Scroll to zoom"
);

fs.writeFileSync(p, content);
console.log("Added right click instructions");
