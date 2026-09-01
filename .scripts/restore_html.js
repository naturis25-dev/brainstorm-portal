const fs = require('fs');
let p = 'frontend/index.html';
let content = fs.readFileSync(p, 'utf8');

const target = `<div class="ldr-caption" id="ldrCaption">
      LOADING... <span id="ldrPct">0%</span>
    </div>`;

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
      LOADING... <span id="ldrPct">0%</span>
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

// Replace the caption with the restored block
content = content.replace(target, restored);
fs.writeFileSync(p, content);
console.log("Restored SVG and skyline");
