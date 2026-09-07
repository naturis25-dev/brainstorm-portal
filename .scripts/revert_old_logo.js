const fs = require('fs');
let p = 'frontend/index.html';
let content = fs.readFileSync(p, 'utf8');

// 1. Revert the logo src globally
content = content.replace(/assets\/logo_16\.png/g, "assets/logo.png");

// 2. Remove the floating animation from the loader JS
const floatJsTarget = `          ).onfinish = () => {
            logo.classList.add("floating-logo");
          }`;
const floatJsReplacement = `          ).onfinish = () => {
          }`;
content = content.replace(floatJsTarget, floatJsReplacement);

// 3. Remove the CSS class definition just to be clean
content = content.replace(/  \.floating-logo {[\s\S]*?100% { transform: scale\(1\) translateY\(0\); filter: drop-shadow\(0 4px 6px rgba\(0,0,0,0\.1\)\); }\n  }/, "");

content = content.replace(/v=\d+/g, "v=" + Date.now());
fs.writeFileSync(p, content);
console.log("Reverted to old logo and removed float animation");
