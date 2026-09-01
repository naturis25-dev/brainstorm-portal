const fs = require('fs');
let p = 'frontend/index.html';
let content = fs.readFileSync(p, 'utf8');

// Replace using regex for the interval block
content = content.replace(/_loaderInterval = setInterval\(\(\) => \{[\s\S]*?\},[^)]+\);/, `_loaderInterval = setInterval(() => {
          _loaderProgress += 2;
          if (_loaderProgress >= 100) {
            _loaderProgress = 100;
            clearInterval(_loaderInterval);
          }
          if(pct) pct.textContent = _loaderProgress + '%';
        }, 20);`);

content = content.replace(/v=\d+/g, "v=" + Date.now());
fs.writeFileSync(p, content);
console.log("Forced JS interval replacement with regex");
