const fs = require('fs');
let p = 'frontend/js/map.js';
let content = fs.readFileSync(p, 'utf8');

content = content.replace("var delay = i * 0.15;", "var delay = i * 0.05;");
content = content.replace("}, 1400);", "}, 650);");
fs.writeFileSync(p, content);

p = 'frontend/css/style.css';
content = fs.readFileSync(p, 'utf8');
content = content.replace("animation: thumbPop 0.8s cubic-bezier", "animation: thumbPop 0.4s cubic-bezier");
fs.writeFileSync(p, content);

console.log("Reduced cinematic animation time");
