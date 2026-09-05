const fs = require('fs');
let p = 'frontend/index.html';
let content = fs.readFileSync(p, 'utf8');

// 1. Sync CSS duration to 2.4s
content = content.replace(/animation: drawLine 1s/g, "animation: drawLine 2.4s");

// 2. Sync MIN_LOAD_TIME
content = content.replace(/const MIN_LOAD_TIME = 1000;/g, "const MIN_LOAD_TIME = 2400;");

// 3. Update Progress Interval
const oldInterval = `_loaderInterval = setInterval(() => {
            _loaderProgress += 2;
            if (_loaderProgress >= 100) {
              _loaderProgress = 100;
              clearInterval(_loaderInterval);
            }
            if(pct) pct.textContent = _loaderProgress + '%';
          }, 20);`;

const newInterval = `_loaderProgress = 20; // Start at 20%
        _loaderInterval = setInterval(() => {
            _loaderProgress += 1;
            if (_loaderProgress >= 100) {
              _loaderProgress = 100;
              clearInterval(_loaderInterval);
            }
            if(pct) pct.textContent = _loaderProgress + '%';
          }, 30);`;

content = content.replace(oldInterval, newInterval);

// 4. Fix Caption Fade In Timeout (change from 900 to 200)
content = content.replace(/}, 900\);/g, "}, 200);");

content = content.replace(/v=\d+/g, "v=" + Date.now());

fs.writeFileSync(p, content);
console.log("Fixed loader speeds and caption visibility");
