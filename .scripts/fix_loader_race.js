const fs = require('fs');
let p = 'frontend/index.html';
let content = fs.readFileSync(p, 'utf8');

const regex = /\/\*\s*=\s*LOADER ANIMATION\s*=\s*\*\/[\s\S]*?\}\s*\}\);\s*<\/script>/;

const replacement = `/* ================= LOADER ANIMATION ================= */
    let _loaderInterval;
    let _loaderProgress = 0;
    
    // Define hideLoader globally immediately
    window.hideLoader = function() {
      const loader = document.getElementById("loader");
      const pct = document.getElementById("ldrPct");
      if (!loader) return;
      if (typeof _loaderInterval !== 'undefined') clearInterval(_loaderInterval);
      if (pct) pct.textContent = '100%';
      loader.classList.add("loaded");
      setTimeout(() => { loader.remove(); }, 700);
    };

    window.addEventListener("load", () => {
      const logo = document.getElementById("loaderLogo");
      const line = document.querySelector(".ldr-line");
      const caption = document.querySelector(".ldr-caption");
      const pct = document.getElementById("ldrPct");

      /* Percentage Counter */
      _loaderInterval = setInterval(() => {
        _loaderProgress += Math.floor(Math.random() * 5) + 2;
        if (_loaderProgress >= 100) {
          _loaderProgress = 100;
          clearInterval(_loaderInterval);
        }
        if(pct) pct.textContent = _loaderProgress + '%';
      }, 1400 / 30);

      /* Logo fade + scale */
      if (logo) {
        logo.animate(
          [
            { opacity: 0, transform: "scale(0.85) translateY(5px)" },
            { opacity: 1, transform: "scale(1) translateY(0)" }
          ],
          { duration: 800, easing: "cubic-bezier(.22,1,.36,1)", fill: "forwards" }
        ).onfinish = () => {
          logo.animate(
            [
              { transform: "scale(1) translateY(0)" },
              { transform: "scale(1.02) translateY(-4px)" },
              { transform: "scale(1) translateY(0)" }
            ],
            { duration: 2500, iterations: Infinity, easing: "ease-in-out" }
          );
        };
      }

      /* Drawing line */
      if (line) {
        line.animate(
          [
            { strokeDashoffset: 300, opacity: 0 },
            { strokeDashoffset: 0, opacity: 1 }
          ],
          { duration: 1200, easing: "ease-in-out", fill: "forwards" }
        );
      }

      /* Caption fade */
      if (caption) {
        setTimeout(() => {
          caption.animate(
            [
              { opacity: 0, transform: "translateY(5px)" },
              { opacity: 1, transform: "translateY(0)" }
            ],
            { duration: 500, easing: "ease-out", fill: "forwards" }
          );
        }, 900);
      }
    });
  </script>`;

content = content.replace(regex, replacement);
content = content.replace(/v=\d+/g, "v=" + Date.now());
fs.writeFileSync(p, content);
console.log("Fixed hideLoader race condition");
