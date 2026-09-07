const fs = require('fs');
let p = 'frontend/js/app.js';
let content = fs.readFileSync(p, 'utf8');

const target = "function initThemeToggle() {\n    const btn = document.getElementById('dntToggle');\n    if (!btn) return;";
const replacement = "function initThemeToggle() {\n    const btn = document.getElementById('dntToggle');\n    if (!btn) return;\n    \n    // Detach from topbar on mobile to avoid backdrop-filter containing block bug\n    if (window.innerWidth <= 768) {\n      document.body.appendChild(btn);\n    }\n    \n    // Handle resize dynamically\n    window.addEventListener('resize', () => {\n      if (window.innerWidth <= 768 && btn.parentElement !== document.body) {\n        document.body.appendChild(btn);\n      } else if (window.innerWidth > 768 && btn.parentElement === document.body) {\n        document.querySelector('.nav-pills').appendChild(btn);\n      }\n    });";

content = content.replace(target, replacement);
fs.writeFileSync(p, content);
console.log("Moved toggle out of topbar on mobile");
