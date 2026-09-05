const fs = require('fs');
let p = 'frontend/css/style.css';
let content = fs.readFileSync(p, 'utf8');

content += `\n
model-viewer,
model-viewer::part(interaction-prompt),
.nav-prompt,
.prompt,
[slot="interaction-prompt"] {
  display: none !important;
  opacity: 0 !important;
  visibility: hidden !important;
}
`;

fs.writeFileSync(p, content);
console.log("Added aggressive CSS to hide interaction prompt");
