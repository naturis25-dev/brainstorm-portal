const fs = require('fs');
const p = 'frontend/css/style.css';
let content = fs.readFileSync(p, 'utf8');

content = content.replace(/\/\* Map Zoom Cursor \*\/[\s\S]*?#map:active\s*\{\s*cursor:\s*grabbing;\s*\}/, "");

fs.writeFileSync(p, content);
console.log("Removed grab cursors from CSS");
