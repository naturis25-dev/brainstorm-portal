const fs = require('fs');
let p = 'frontend/index.html';
let content = fs.readFileSync(p, 'utf8');

const target = `    <script>
      /* ================= LOADER ANIMATION ================= */
      let _loaderInterval;
      let _loaderProgress = 0;
      
      window.hideLoader = function() {
        const loader = document.getElementById("loader");
        const pct = document.getElementById("ldrPct");
        if (!loader) return;
        if (typeof _loaderInterval !== 'undefined') clearInterval(_loaderInterval);
        if (pct) pct.textContent = '100%';
        loader.classList.add("loaded");
        setTimeout(() => { loader.remove(); }, 700);
      };`;

const replaced = `    <script>
      /* ================= LOADER ANIMATION ================= */
      let _loaderInterval;
      let _loaderProgress = 0;
      const _loadStartTime = Date.now();
      const MIN_LOAD_TIME = 2500; // 2.5 seconds minimum for smoothness
      
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
      };`;

content = content.replace(target, replaced);

// Slow down the progress percentage counting slightly so it lines up better with 2.5s
content = content.replace(/1400 \/ 30/g, "80"); 
content = content.replace(/Math\.floor\(Math\.random\(\) \* 5\) \+ 2/g, "Math.floor(Math.random() * 4) + 1");

content = content.replace(/v=\d+/g, "v=" + Date.now());
fs.writeFileSync(p, content);
console.log("Added minimum load time for smoothness");
