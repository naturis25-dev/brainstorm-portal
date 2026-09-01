const fs = require('fs');
let p = 'frontend/css/style.css';
let content = fs.readFileSync(p, 'utf8');

const bgLight = "background-color: #0d1117; background-image: radial-gradient(circle at 50% 50%, rgba(37,99,235,0.15) 0%, transparent 70%), linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px); background-size: 100% 100%, 30px 30px, 30px 30px; background-position: center;";

content = content.replace(
  "background: radial-gradient(circle at center, #2a2a2f 0%, #1a1a1d 100%);",
  bgLight
);

content = content.replace(
  "background: radial-gradient(circle at center, #1a1a1d 0%, #0d0d0f 100%);",
  bgLight
);

fs.writeFileSync(p, content);
console.log("Replaced CSS backgrounds");
