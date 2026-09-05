const fs = require('fs');
let p = 'frontend/js/app.js';
let content = fs.readFileSync(p, 'utf8');

// Fix vertical centering
content = content.replace("popup.style.top = '120px';", "popup.style.top = '50%';");
content = content.replace("popup.style.transform = 'translateX(-50%)';", "popup.style.transform = 'translate(-50%, -50%)';");

// Fix image URL mapping
content = content.replace(
  "let imgUrl = (p.images && p.images.length > 0) ? `/uploads/${p.images[0]}` : 'assets/logo.png';",
  "let imgUrl = (p.images && p.images.length > 0) ? (p.images[0].startsWith('http') ? p.images[0] : `/uploads/${p.images[0]}`) : 'assets/logo.png';"
);

fs.writeFileSync(p, content);
console.log("Fixed popup position and image URL!");
