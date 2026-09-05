const fs = require('fs');
let p = 'frontend/js/app.js';
let content = fs.readFileSync(p, 'utf8');

const oldBlock = `              const controls = document.createElement('div');
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
              container.appendChild(controls);`;

const newBlock = `              const controls = document.createElement('div');
              controls.style.position = 'absolute';
              controls.style.right = '16px';
              controls.style.bottom = '16px';
              controls.style.zIndex = '15';
              controls.style.display = 'flex';
              controls.style.gap = '8px';
              controls.style.alignItems = 'flex-end';
              controls.innerHTML = \`
                <div style="background:rgba(0,0,0,0.6); color:#fff; border:1px solid rgba(255,255,255,0.2); border-radius:6px; padding:6px 12px; font-size:11px; line-height:1.4; backdrop-filter:blur(4px); pointer-events:none; text-align:left; white-space:nowrap;">
                  <b>Controls:</b><br/>
                  • Left Click + Drag: Orbit<br/>
                  • Right Click + Drag: Pan<br/>
                  • Scroll Wheel: Zoom
                </div>
                <div style="display:flex; flex-direction:column; gap:8px;">
                  <button id="mv-rotate-\${p.id}" title="Pause Auto Rotate" style="background:rgba(0,0,0,0.6); color:#fff; border:1px solid rgba(255,255,255,0.2); border-radius:6px; padding:0 12px; height:36px; cursor:pointer; font-size:13px; font-weight:600; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(4px); transition: background 0.2s;">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:6px;"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg> Pause
                  </button>
                  <div style="display:flex; gap:8px;">
                    <button id="mv-zoom-in-\${p.id}" title="Zoom In" style="background:rgba(0,0,0,0.6); color:#fff; border:1px solid rgba(255,255,255,0.2); border-radius:6px; width:36px; height:36px; cursor:pointer; font-size:18px; font-weight:bold; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(4px); transition: background 0.2s;">+</button>
                    <button id="mv-zoom-out-\${p.id}" title="Zoom Out" style="background:rgba(0,0,0,0.6); color:#fff; border:1px solid rgba(255,255,255,0.2); border-radius:6px; width:36px; height:36px; cursor:pointer; font-size:18px; font-weight:bold; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(4px); transition: background 0.2s;">-</button>
                    <button id="mv-fullscreen-\${p.id}" title="Full Screen" style="background:rgba(0,0,0,0.6); color:#fff; border:1px solid rgba(255,255,255,0.2); border-radius:6px; padding:0 12px; height:36px; cursor:pointer; font-size:13px; font-weight:600; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(4px); transition: background 0.2s;">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:6px;"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg> Fullscreen
                    </button>
                  </div>
                </div>
              \`;
              container.appendChild(controls);`;

content = content.replace(oldBlock, newBlock);
fs.writeFileSync(p, content);
console.log("Updated HTML block");
