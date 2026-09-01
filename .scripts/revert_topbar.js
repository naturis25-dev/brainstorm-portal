const fs = require('fs');
let p = 'frontend/css/style.css';
let content = fs.readFileSync(p, 'utf8');

// Find the index of "/* 16th Anniversary Logo Animations */"
const idx = content.indexOf("/* 16th Anniversary Logo Animations */");
if (idx !== -1) {
  content = content.substring(0, idx);
  fs.writeFileSync(p, content);
  console.log("Reverted topbar animations");
} else {
  console.log("Could not find marker");
}
