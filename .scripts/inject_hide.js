const fs = require('fs');
let p = 'frontend/js/app.js';
let content = fs.readFileSync(p, 'utf8');

const targetStr = `    renderCategoryChips();
    renderMap();
  } catch (e) {
    console.error('Init error:', e);
    // Still render chips and try map with empty projects
    renderCategoryChips();
    renderMap();
  }`;

const replaceStr = `    renderCategoryChips();
    renderMap();
    if (typeof window.hideLoader === 'function') window.hideLoader();
  } catch (e) {
    console.error('Init error:', e);
    // Still render chips and try map with empty projects
    renderCategoryChips();
    renderMap();
    if (typeof window.hideLoader === 'function') window.hideLoader();
  }`;

content = content.replace(targetStr, replaceStr);
fs.writeFileSync(p, content);
console.log("Injected hideLoader");
