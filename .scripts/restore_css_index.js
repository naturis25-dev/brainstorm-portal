const fs = require('fs');
let p = 'frontend/index.html';
let content = fs.readFileSync(p, 'utf8');

const targetRegex = /\.ldr-line\s*\{\s*stroke:\s*#6D5DF6;\s*stroke-width:\s*1\.4;\s*fill:\s*none;\s*stroke-dasharray:\s*600;\s*stroke-dashoffset:\s*600;\s*\}/;

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

content = content.replace(targetRegex, restored);
content = content.replace(/v=\d+/g, "v=" + Date.now());
fs.writeFileSync(p, content);
console.log("Forcibly restored drawLine CSS in index.html");
