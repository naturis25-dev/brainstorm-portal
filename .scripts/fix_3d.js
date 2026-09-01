const fs = require('fs');
let p = 'frontend/js/app.js';
let content = fs.readFileSync(p, 'utf8');

// Update background of model-container
content = content.replace(
  /background: #0f0f11;/g,
  "background-color: #0d1117; background-image: radial-gradient(circle at 50% 50%, rgba(37,99,235,0.15) 0%, transparent 70%), linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px); background-size: 100% 100%, 30px 30px, 30px 30px; background-position: center;"
);

// Update min-camera-orbit and add field of view limits
content = content.replace(
  /mv\.setAttribute\('min-camera-orbit', 'auto auto 0\.1m'\);/g,
  "mv.setAttribute('min-camera-orbit', 'auto auto 0m');\n            mv.setAttribute('min-field-of-view', '1deg');\n            mv.setAttribute('max-field-of-view', '100deg');"
);

// We can also change the manual trigger background so it matches
content = content.replace(
  /background: radial-gradient\(circle at center, #1a1a20 0%, #000 100%\);/g,
  "background: radial-gradient(circle at center, #161b22 0%, #0d1117 100%);"
);

fs.writeFileSync(p, content);
console.log("Updated 3D viewer background and zoom");
