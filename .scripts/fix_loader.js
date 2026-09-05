const fs = require('fs');
let p = 'frontend/index.html';
let content = fs.readFileSync(p, 'utf8');

const replacement = `
      /* Global function to hide loader manually */
      window.hideLoader = function() {
        if (typeof interval !== 'undefined') clearInterval(interval);
        if (pct) pct.textContent = '100%';
        loader.classList.add("loaded");
        setTimeout(() => {
          loader.remove();
        }, 700);
      };
`;

content = content.replace(/\/\*\s*Remove loader\s*\*\/[\s\S]*?\}, 2200\);/, replacement);

content = content.replace(/v=\d+/g, "v=" + Date.now());

fs.writeFileSync(p, content);
console.log("Updated loader logic in index.html");
