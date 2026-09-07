const fs = require('fs');
let p = 'frontend/index.html';
let content = fs.readFileSync(p, 'utf8');

// 1. Sync CSS duration
content = content.replace(/animation: drawLine \d+s/g, "animation: drawLine 1s");
content = content.replace(/animation: drawLine \d+\.\ds/g, "animation: drawLine 1s");

// 2. Sync MIN_LOAD_TIME
content = content.replace(/const MIN_LOAD_TIME = 1200;/g, "const MIN_LOAD_TIME = 1000;");

// 3. Sync JS progress counting
// Replace the interval logic entirely for a smooth, predictable 1000ms counter
const targetInterval = `_loaderInterval = setInterval(() => {
          _loaderProgress += Math.floor(Math.random() * 5) + 2;
          if (_loaderProgress >= 100) {
            _loaderProgress = 100;
            clearInterval(_loaderInterval);
          }
          if(pct) pct.textContent = _loaderProgress + '%';
        }, 1400 / 30);`;

const newInterval = `_loaderInterval = setInterval(() => {
          _loaderProgress += 2;
          if (_loaderProgress >= 100) {
            _loaderProgress = 100;
            clearInterval(_loaderInterval);
          }
          if(pct) pct.textContent = _loaderProgress + '%';
        }, 20);`; // 50 ticks of 20ms = 1000ms

content = content.replace(targetInterval, newInterval);
content = content.replace(/v=\d+/g, "v=" + Date.now());

fs.writeFileSync(p, content);
console.log("Synchronized curvy line, percentage, and load time to exactly 1 second.");
