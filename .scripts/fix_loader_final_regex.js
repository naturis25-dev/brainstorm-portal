const fs = require('fs');
let p = 'frontend/index.html';
let content = fs.readFileSync(p, 'utf8');

content = content.replace(/_loaderInterval = setInterval\(\(\) => \{[\s\S]*?\},[^)]+\);/, `_loaderProgress = 20;
        _loaderInterval = setInterval(() => {
          _loaderProgress += 1;
          if (_loaderProgress >= 100) {
            _loaderProgress = 100;
            clearInterval(_loaderInterval);
          }
          if(pct) pct.textContent = _loaderProgress + '%';
        }, 30);`);

fs.writeFileSync(p, content);
console.log("Forced JS interval replacement with regex");
