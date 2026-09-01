const fs = require('fs');
let p = 'frontend/index.html';
let content = fs.readFileSync(p, 'utf8');

const oldLoaderCss = `  #loaderLogo {
    width: 150px;
    height: auto;
    opacity: 0;
    margin-bottom: 28px;
  }

  #loader svg {
    width: 280px;
    height: 80px;
  }

  .ldr-line {
    stroke: #6D5DF6;
    stroke-width: 1.4;
    fill: none;

    stroke-dasharray: 600;
    stroke-dashoffset: 600;
    animation: drawLine 2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  }

  @keyframes drawLine {
    to { stroke-dashoffset: 0; }
  }

  .ldr-caption {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 2px;
    color: var(--sub);
    margin-top: -10px;
    animation: fadeIn 0.5s ease 0.5s forwards;
    opacity: 0;
  }

  #loader.loaded {
    animation: loaderExit 0.7s ease forwards;
  }

  @keyframes loaderExit {
    to {
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
    }
  }

  /* Skyline Animation */
  .loader-skyline {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    display: flex;
    align-items: flex-end;
    justify-content: space-around;
    padding: 0 4%;
    pointer-events: none;
    z-index: 1;
    overflow: hidden;
    height: 300px;
  }

  .sky-box {
    background: linear-gradient(to top, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0) 100%);
    border-left: 1px solid rgba(0,0,0,0.03);
    border-right: 1px solid rgba(0,0,0,0.03);
    border-top: 1px solid rgba(0,0,0,0.03);
    border-top-left-radius: 2px;
    border-top-right-radius: 2px;
    animation: riseUp 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
    opacity: 0;
    transform: translateY(100px);
  }

  .box-1 { width: 60px; height: 180px; animation-delay: 0.1s; }
  .box-2 { width: 80px; height: 250px; animation-delay: 0.3s; }
  .box-3 { width: 50px; height: 140px; animation-delay: 0.2s; }
  .box-4 { width: 100px; height: 280px; animation-delay: 0.5s; }
  .box-5 { width: 70px; height: 210px; animation-delay: 0.4s; }
  .box-6 { width: 45px; height: 160px; animation-delay: 0.15s; }
  .box-7 { width: 90px; height: 260px; animation-delay: 0.45s; }
  .box-8 { width: 55px; height: 190px; animation-delay: 0.25s; }

  @keyframes riseUp {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .floating-logo {
    animation: logoFloat 3s ease-in-out infinite;
  }
  @keyframes logoFloat {
    0% { transform: scale(1) translateY(0); filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1)); }
    50% { transform: scale(1.03) translateY(-6px); filter: drop-shadow(0 12px 20px rgba(220,20,60,0.35)); }
    100% { transform: scale(1) translateY(0); filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1)); }
  }`;

const oldJsTarget = `        if (logo) {
          logo.animate(
            [
              { opacity: 0, transform: "scale(0.85) translateY(5px)" },
              { opacity: 1, transform: "scale(1) translateY(0)" }
            ],
            { duration: 800, easing: "cubic-bezier(.22,1,.36,1)", fill: "forwards" }
          ).onfinish = () => {
            logo.classList.add("floating-logo");
          }
        }`;

// 1. Revert CSS
const startIdx = content.indexOf("  #loaderLogo {");
const endIdx = content.indexOf("/* ================= APP LAYOUT ================= */");
if (startIdx !== -1 && endIdx !== -1) {
  content = content.substring(0, startIdx) + oldLoaderCss + "\n  " + content.substring(endIdx);
}

// 2. Revert JS
const newJsTarget = `        if (logo) {
          logo.animate(
            [
              { opacity: 0, transform: "scale(0.9) translateY(15px)", filter: "blur(5px)" },
              { opacity: 1, transform: "scale(1) translateY(0)", filter: "blur(0px)" }
            ],
            { duration: 1200, easing: "cubic-bezier(.22,1,.36,1)", fill: "forwards" }
          ).onfinish = () => {
            logo.classList.add("cinematic-logo");
          }
        }`;
content = content.replace(newJsTarget, oldJsTarget);

// 3. Revert Progress Fill JS
content = content.replace("if(pct) pct.textContent = _loaderProgress + '%';\n          const fill = document.getElementById('ldrFill');\n          if (fill) fill.style.width = _loaderProgress + '%';", "if(pct) pct.textContent = _loaderProgress + '%';");

// 4. Revert HTML
const newHtml = `<div class="ldr-caption">LOADING PORTAL <span id="ldrPct">0%</span></div>
      <div class="ldr-progress-bar"><div class="ldr-progress-fill" id="ldrFill"></div></div>`;
const oldHtml = `
      <svg viewBox="0 0 280 80" aria-hidden="true">
        <path
          class="ldr-line"
          d="M10 40
             C35 15, 60 65, 85 40
             S135 15, 160 40
             S235 15, 270 40"
        />
      </svg>
      <div class="ldr-caption">INITIALIZING PLATFORM <span id="ldrPct">0%</span></div>
      <div class="loader-skyline">
        <div class="sky-box box-1"></div>
        <div class="sky-box box-2"></div>
        <div class="sky-box box-3"></div>
        <div class="sky-box box-4"></div>
        <div class="sky-box box-5"></div>
        <div class="sky-box box-6"></div>
        <div class="sky-box box-7"></div>
        <div class="sky-box box-8"></div>
      </div>`;
content = content.replace(newHtml, oldHtml);
content = content.replace(/v=\d+/g, "v=" + Date.now());

fs.writeFileSync(p, content);
console.log("Reverted loader");
