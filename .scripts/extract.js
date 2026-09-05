const fs = require('fs');
let content = fs.readFileSync('frontend/index.html', 'utf8');
let match = content.match(/<script>\s*\/\* ================= LOADER ANIMATION ================= \*\/([\s\S]*?)<\/script>/);
if (match) {
  fs.writeFileSync('temp_loader.js', match[1]);
  console.log("Extracted loader script");
} else {
  console.log("Could not find loader script");
}
