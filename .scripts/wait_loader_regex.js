const fs = require('fs');
let p = 'frontend/index.html';
let content = fs.readFileSync(p, 'utf8');

// Replace the hideLoader function body
content = content.replace(/window\.hideLoader = function\(\) \{[\s\S]*?setTimeout\(\(\) => \{ loader\.remove\(\); \}, 700\);\s*\};/, `const _loadStartTime = Date.now();
      const MIN_LOAD_TIME = 2500;
      window.hideLoader = function() {
        const elapsed = Date.now() - _loadStartTime;
        const remaining = Math.max(0, MIN_LOAD_TIME - elapsed);
        setTimeout(() => {
          const loader = document.getElementById("loader");
          const pct = document.getElementById("ldrPct");
          if (!loader) return;
          if (typeof _loaderInterval !== 'undefined') clearInterval(_loaderInterval);
          if (pct) pct.textContent = '100%';
          loader.classList.add("loaded");
          setTimeout(() => { loader.remove(); }, 700);
        }, remaining);
      };`);

content = content.replace(/1400 \/ 30/g, "80");
content = content.replace(/Math\.floor\(Math\.random\(\) \* 5\) \+ 2/g, "Math.floor(Math.random() * 4) + 1");
content = content.replace(/v=\d+/g, "v=" + Date.now());

fs.writeFileSync(p, content);
console.log("Replaced hideLoader using regex");
