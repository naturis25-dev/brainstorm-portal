const fs = require('fs');
let p = 'frontend/js/app.js';
let content = fs.readFileSync(p, 'utf8');

content = content.replace(
  "mv.setAttribute('max-field-of-view', '100deg');",
  "mv.setAttribute('max-field-of-view', '100deg');\n            mv.setAttribute('interaction-prompt', 'none');"
);

fs.writeFileSync(p, content);
console.log("Added interaction-prompt='none' to model-viewer");
