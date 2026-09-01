const fs = require('fs');
let p = 'frontend/css/style.css';
let content = fs.readFileSync(p, 'utf8');

content += `\n
/* Hide model-viewer default prompts */
model-viewer::part(interaction-prompt) {
  display: none !important;
}
model-viewer {
  --interaction-prompt-display: none !important;
}
`;

fs.writeFileSync(p, content);
console.log("Added CSS to hide interaction prompt");
