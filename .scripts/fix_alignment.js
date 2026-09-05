const fs = require('fs');
const p = 'frontend/index.html';
let content = fs.readFileSync(p, 'utf8');

// We also need to bump the CSS/JS versions again just to be 100% sure the browser doesn't cache the broken js
content = content.replace(/v=\d+/g, "v=" + Date.now());

fs.writeFileSync(p, content);
console.log("Bumped versions");
