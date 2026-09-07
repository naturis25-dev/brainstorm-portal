const fs = require('fs');
let p = 'frontend/css/style.css';
let content = fs.readFileSync(p, 'utf8');

const target = `.ldr-line {
  stroke: #6D5DF6;
  stroke-width: 1.4;
  fill: none;

  stroke-dasharray: 600;
  stroke-dashoffset: 600;
}`;

const restored = `.ldr-line {
  stroke: #6D5DF6;
  stroke-width: 1.4;
  fill: none;

  stroke-dasharray: 600;
  stroke-dashoffset: 600;
  animation: drawLine 2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes drawLine {
  to { stroke-dashoffset: 0; }
}`;

content = content.replace(target, restored);
fs.writeFileSync(p, content);
console.log("Restored drawLine animation in style.css");
