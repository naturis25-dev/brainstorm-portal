const fs = require('fs');
let p = 'frontend/js/app.js';
let content = fs.readFileSync(p, 'utf8');

const regex = /renderMap\(\);\s*if \(typeof window\.hideLoader === 'function'\) window\.hideLoader\(\);\s*\} catch \(e\) \{\s*console\.error\('Init error:', e\);\s*\/\/ Still render chips and try map with empty projects\s*renderCategoryChips\(\);\s*renderMap\(\);\s*\}/;

const newCode = `renderMap();
  } catch (e) {
    console.error('Init error:', e);
    // Still render chips and try map with empty projects
    renderCategoryChips();
    renderMap();
  } finally {
    if (typeof window.hideLoader === 'function') window.hideLoader();
  }`;

content = content.replace(regex, newCode);
fs.writeFileSync(p, content);
console.log("Fixed loader with regex");
