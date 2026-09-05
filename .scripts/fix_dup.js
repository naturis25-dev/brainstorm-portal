const fs = require('fs');
let p = 'frontend/js/app.js';
let content = fs.readFileSync(p, 'utf8');

// The block to remove is everything from `// Add custom UI controls` to `}, 100);` right before the end of the load event listener.

content = content.replace(/\s*\/\/ Add custom UI controls[\s\S]*?\}, 100\);\s*/, "");

fs.writeFileSync(p, content);
console.log("Removed duplicate controls block");
