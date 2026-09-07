const fs = require('fs');
let p = 'frontend/js/app.js';
let content = fs.readFileSync(p, 'utf8');

const regexStats = /statsRow\.innerHTML = `[\s\S]*?TOTAL TONS<\/div><\/div>\s*`;/g;
const replacementStats = `statsRow.innerHTML = \`
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

content = content.replace(regexStats, replacementStats);

const regexMap = /if \(heroHighlight\) heroHighlight\.className = 'highlight-usa';\s*\}\s*if \(window\.MapModule\) window\.MapModule\.drawMap\(window\.PROJECT_STATS \|\| PROJECTS, currentCategory, currentCountry\);/g;
const replacementMap = `if (heroHighlight) heroHighlight.className = 'highlight-usa';
        }
  
        const mapEl = document.getElementById('map');
        if (mapEl) {
          mapEl.classList.add('fade-out');
          setTimeout(() => {
            if (window.MapModule) window.MapModule.drawMap(window.PROJECT_STATS || PROJECTS, currentCategory, currentCountry);
            setTimeout(() => mapEl.classList.remove('fade-out'), 50);
          }, 250);
        } else {
          if (window.MapModule) window.MapModule.drawMap(window.PROJECT_STATS || PROJECTS, currentCategory, currentCountry);
        }`;

content = content.replace(regexMap, replacementMap);

fs.writeFileSync(p, content);
console.log("Fixed map transition and admin stats!");
