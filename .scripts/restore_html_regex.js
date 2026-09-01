const fs = require('fs');
let p = 'frontend/index.html';
let content = fs.readFileSync(p, 'utf8');

const restored = `
    <svg viewBox="0 0 280 80" aria-hidden="true">
      <path
        class="ldr-line"
        d="M10 40
           C35 15, 60 65, 85 40
           S135 15, 160 40
           S235 15, 270 40"
      />
    </svg>
    <div class="ldr-caption" id="ldrCaption">
      INITIALIZING PLATFORM <span id="ldrPct">0%</span>
    </div>
    
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

// Replace using regex that ignores exact whitespace
content = content.replace(/<div class="ldr-caption" id="ldrCaption">\s*LOADING\.\.\. <span id="ldrPct">0%<\/span>\s*<\/div>/, restored);

fs.writeFileSync(p, content);
console.log("Forcibly restored SVG and skyline via Regex");
