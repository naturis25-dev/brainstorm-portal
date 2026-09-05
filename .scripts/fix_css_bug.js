const fs = require('fs');
let p = 'frontend/css/style.css';
let content = fs.readFileSync(p, 'utf8');

// Remove `model-viewer,`
content = content.replace("model-viewer,\nmodel-viewer::part", "model-viewer::part");

fs.writeFileSync(p, content);
console.log("Fixed CSS display none bug");
