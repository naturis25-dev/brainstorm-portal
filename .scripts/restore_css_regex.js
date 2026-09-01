const fs = require('fs');
let p = 'frontend/css/style.css';
let content = fs.readFileSync(p, 'utf8');

const regex = /\.ldr-line\s*\{\s*stroke:\s*#[0-9A-Fa-f]{6};\s*stroke-width:\s*[\d\.]+;\s*fill:\s*none;\s*stroke-dasharray:\s*\d+;\s*stroke-dashoffset:\s*\d+;\s*\}/;

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

if (regex.test(content)) {
  content = content.replace(regex, restored);
  fs.writeFileSync(p, content);
  console.log("Successfully restored drawLine");
} else {
  // If .ldr-line exists but didn't match, let's just append it
  if (content.includes(".ldr-line")) {
    content = content.replace(".ldr-line {", "@keyframes drawLine { to { stroke-dashoffset: 0; } }\n.ldr-line {\n  animation: drawLine 2s cubic-bezier(0.4, 0, 0.2, 1) forwards;");
    fs.writeFileSync(p, content);
    console.log("Appended animation to existing ldr-line");
  } else {
    console.log("ldr-line class not found");
  }
}
