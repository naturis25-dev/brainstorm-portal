const fs = require('fs');
let p = 'frontend/js/app.js';
let content = fs.readFileSync(p, 'utf8');

const target = `      statsRow.innerHTML = \`
        <div class="stat"><div class="n">\${PROJECTS.length}</div><div class="l">TOTAL PROJECTS</div></div>
        <div class="stat"><div class="n">\${stateCount}</div><div class="l">REGIONS COVERED</div></div>
        <div class="stat"><div class="n">\${totalTons.toLocaleString()}</div><div class="l">TOTAL TONS</div></div>
      \`;`;

const replacement = `      statsRow.innerHTML = \`
        <div class="stat"><div class="n" id="stat-proj">0</div><div class="l">TOTAL PROJECTS</div></div>
        <div class="stat"><div class="n" id="stat-state">0</div><div class="l">REGIONS COVERED</div></div>
        <div class="stat"><div class="n" id="stat-tons">0</div><div class="l">TOTAL TONS</div></div>
      \`;
      const animVal = (el, end) => {
        let startTS = null;
        const step = (ts) => {
          if (!startTS) startTS = ts;
          const p = Math.min((ts - startTS) / 1200, 1);
          const ease = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
          if (el) el.innerHTML = Math.floor(ease * end).toLocaleString();
          if (p < 1) window.requestAnimationFrame(step);
        };
        window.requestAnimationFrame(step);
      };
      animVal(document.getElementById('stat-proj'), PROJECTS.length);
      animVal(document.getElementById('stat-state'), stateCount);
      animVal(document.getElementById('stat-tons'), totalTons);`;

content = content.replace(target, replacement);
fs.writeFileSync(p, content);
console.log("Added animated counters to admin stats!");
