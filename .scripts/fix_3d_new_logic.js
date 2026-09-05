const fs = require('fs');
let p = 'frontend/js/app.js';
let content = fs.readFileSync(p, 'utf8');

const target = `const fsBtn = document.getElementById(\`mv-fullscreen-\${p.id}\`);`;

const injection = `
                const rotateBtn = document.getElementById(\`mv-rotate-\${p.id}\`);
                if (rotateBtn) {
                  rotateBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (mv.hasAttribute('auto-rotate')) {
                      mv.removeAttribute('auto-rotate');
                      rotateBtn.innerHTML = \`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:6px;"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg> Auto Rotate\`;
                    } else {
                      mv.setAttribute('auto-rotate', '');
                      rotateBtn.innerHTML = \`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:6px;"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg> Pause\`;
                    }
                  });
                }
                const fsBtn = document.getElementById(\`mv-fullscreen-\${p.id}\`);`;

content = content.replace(target, injection);
fs.writeFileSync(p, content);
console.log("Injected rotate button logic");
