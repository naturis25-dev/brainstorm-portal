const fs = require('fs');
let p = 'frontend/css/style.css';
let content = fs.readFileSync(p, 'utf8');

content += `\n
@keyframes popupFadeScale {
  0% { opacity: 0; transform: translate(-50%, -45%) scale(0.95); filter: blur(10px); }
  100% { opacity: 1; transform: translate(-50%, -50%) scale(1); filter: blur(0px); }
}
`;

fs.writeFileSync(p, content);
console.log("Added popup animation CSS");
