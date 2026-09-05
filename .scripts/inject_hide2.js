const fs = require('fs');
let p = 'frontend/js/app.js';
let content = fs.readFileSync(p, 'utf8');

const targetStr = `      console.error('Init error:', e);
      // Still render chips and try map with empty projects
      renderCategoryChips();
      renderMap();
    }
  }`;

const replaceStr = `      console.error('Init error:', e);
      // Still render chips and try map with empty projects
      renderCategoryChips();
      renderMap();
      if (typeof window.hideLoader === 'function') window.hideLoader();
    }
  }`;

content = content.replace(targetStr, replaceStr);
fs.writeFileSync(p, content);
console.log("Injected second hideLoader");
