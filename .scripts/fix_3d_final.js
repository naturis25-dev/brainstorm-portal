const fs = require('fs');
let p = 'frontend/js/app.js';
let content = fs.readFileSync(p, 'utf8');

// Inject attributes
content = content.replace("mv.setAttribute('alt', 'Interactive 3D Structural Model');", `mv.setAttribute('alt', 'Interactive 3D Structural Model');
            mv.setAttribute('min-camera-orbit', 'auto auto 0m');
            mv.setAttribute('min-field-of-view', '1deg');
            mv.setAttribute('max-field-of-view', '100deg');`);

// Change container background
content = content.replace("background: #0f0f11;", "background-color: #0d1117; background-image: radial-gradient(circle at 50% 50%, rgba(37,99,235,0.15) 0%, transparent 70%), linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px); background-size: 100% 100%, 30px 30px, 30px 30px; background-position: center;");
content = content.replace("background: radial-gradient(circle at center, #1a1a20 0%, #000 100%);", "background: radial-gradient(circle at center, #161b22 0%, #0d1117 100%);");

// Add zoom buttons
const uiInjection = `
              mv.style.position = 'absolute';
              mv.style.inset = '0';
              mv.style.width = '100%';
              mv.style.height = '100%';
              mv.style.zIndex = '1';

              const controls = document.createElement('div');
              controls.style.position = 'absolute';
              controls.style.right = '16px';
              controls.style.bottom = '16px';
              controls.style.zIndex = '15';
              controls.style.display = 'flex';
              controls.style.gap = '8px';
              controls.innerHTML = \`
                <button id="mv-zoom-in-\${p.id}" title="Zoom In" style="background:rgba(0,0,0,0.6); color:#fff; border:1px solid rgba(255,255,255,0.2); border-radius:6px; width:36px; height:36px; cursor:pointer; font-size:18px; font-weight:bold; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(4px); transition: background 0.2s;">+</button>
                <button id="mv-zoom-out-\${p.id}" title="Zoom Out" style="background:rgba(0,0,0,0.6); color:#fff; border:1px solid rgba(255,255,255,0.2); border-radius:6px; width:36px; height:36px; cursor:pointer; font-size:18px; font-weight:bold; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(4px); transition: background 0.2s;">-</button>
                <button id="mv-fullscreen-\${p.id}" title="Full Screen" style="background:rgba(0,0,0,0.6); color:#fff; border:1px solid rgba(255,255,255,0.2); border-radius:6px; padding:0 12px; height:36px; cursor:pointer; font-size:13px; font-weight:600; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(4px); transition: background 0.2s;">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:6px;"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg> Fullscreen
                </button>
              \`;
              container.appendChild(controls);

              setTimeout(() => {
                const fsBtn = document.getElementById(\`mv-fullscreen-\${p.id}\`);
                if (fsBtn) {
                  fsBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (!document.fullscreenElement) {
                      container.requestFullscreen().catch(err => {
                        console.error('Fullscreen err:', err);
                      });
                    } else {
                      document.exitFullscreen();
                    }
                  });
                }
                const zoomInBtn = document.getElementById(\`mv-zoom-in-\${p.id}\`);
                if (zoomInBtn) {
                  zoomInBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const orbit = mv.getCameraOrbit();
                    orbit.radius *= 0.8;
                    mv.cameraOrbit = \`\${orbit.theta}rad \${orbit.phi}rad \${orbit.radius}m\`;
                  });
                }
                const zoomOutBtn = document.getElementById(\`mv-zoom-out-\${p.id}\`);
                if (zoomOutBtn) {
                  zoomOutBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const orbit = mv.getCameraOrbit();
                    orbit.radius *= 1.25;
                    mv.cameraOrbit = \`\${orbit.theta}rad \${orbit.phi}rad \${orbit.radius}m\`;
                  });
                }
              }, 100);
`;

content = content.replace(/mv\.style\.position = 'absolute';\s*mv\.style\.inset = '0';\s*mv\.style\.width = '100%';\s*mv\.style\.height = '100%';\s*mv\.style\.zIndex = '1';/, uiInjection);

fs.writeFileSync(p, content);
console.log("Injected 3D features!");
