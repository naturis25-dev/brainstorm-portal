
    let _loaderInterval;
    let _loaderProgress = 0;
    
    const _loadStartTime = Date.now();
      const MIN_LOAD_TIME = 2400;
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
      };

    window.addEventListener("load", () => {
      const logo = document.getElementById("loaderLogo");
      const line = document.querySelector(".ldr-line");
      const caption = document.querySelector(".ldr-caption");
      const pct = document.getElementById("ldrPct");

      _loaderProgress = 20;
        _loaderInterval = setInterval(() => {
          _loaderProgress += 1;
          if (_loaderProgress >= 100) {
            _loaderProgress = 100;
            clearInterval(_loaderInterval);
          }
          if(pct) pct.textContent = _loaderProgress + '%';
        }, 30);

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

      if (line) {
        line.animate(
          [
            { strokeDashoffset: 300, opacity: 0 },
            { strokeDashoffset: 0, opacity: 1 }
          ],
          { duration: 1200, easing: "ease-in-out", fill: "forwards" }
        );
      }

      if (caption) {
        setTimeout(() => {
          caption.animate(
            [
              { opacity: 0, transform: "translateY(5px)" },
              { opacity: 1, transform: "translateY(0)" }
            ],
            { duration: 500, easing: "ease-out", fill: "forwards" }
          );
        }, 200);
      }
    });
  