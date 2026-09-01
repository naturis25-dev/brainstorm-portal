const fs = require('fs');
let p = 'frontend/js/app.js';
let content = fs.readFileSync(p, 'utf8');

const target = "mv.setAttribute('interaction-prompt', 'none');";
const replacement = "mv.setAttribute('interaction-prompt', 'none');\n            mv.innerHTML = '<div slot=\"interaction-prompt\" style=\"display:none;\"></div>';";

content = content.replace(target, replacement);

fs.writeFileSync(p, content);
console.log("Injected empty slot");
