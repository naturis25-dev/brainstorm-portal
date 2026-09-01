const fs = require('fs');
let p = 'frontend/js/app.js';
let content = fs.readFileSync(p, 'utf8');

const regex = /const btnFull = document\.getElementById\(`mv-full-\$\{p\.id\}`\);[\s\S]*?\}\);\s*\}/;

const replacement = `const btnFull = document.getElementById(\`mv-full-\${p.id}\`);
            if (btnFull) {
              btnFull.addEventListener('click', (e) => {
                e.stopPropagation();
                if (!document.fullscreenElement && !document.webkitFullscreenElement) {
                  if (container.requestFullscreen) {
                    container.requestFullscreen();
                  } else if (container.webkitRequestFullscreen) {
                    container.webkitRequestFullscreen();
                  }
                } else {
                  if (document.exitFullscreen) {
                    document.exitFullscreen();
                  } else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                  }
                }
              });

              // Listen to fullscreen changes to update the button text
              const handleFullscreenChange = () => {
                if (document.fullscreenElement === container || document.webkitFullscreenElement === container) {
                  btnFull.textContent = 'Exit Fullscreen';
                  btnFull.style.background = '#dc2626';
                  btnFull.style.boxShadow = '0 4px 12px rgba(220, 38, 38, 0.3)';
                } else {
                  btnFull.textContent = 'Fullscreen';
                  btnFull.style.background = 'var(--accent)';
                  btnFull.style.boxShadow = '0 4px 12px rgba(37,99,235,0.3)';
                }
              };

              document.addEventListener('fullscreenchange', handleFullscreenChange);
              document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
            }`;

content = content.replace(regex, replacement);
fs.writeFileSync(p, content);
console.log("Updated fullscreen toggle logic");
