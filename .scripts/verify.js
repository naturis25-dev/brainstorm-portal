const fs = require('fs');
let p = 'frontend/js/app.js';
let content = fs.readFileSync(p, 'utf8');

if (!content.includes('catch (e) {\n      console.error(\'Init error:\', e);\n      // Still render chips\n      renderCategoryChips();\n    if (typeof window.hideLoader === \'function\') window.hideLoader();\n  }\n}')) {
   content = content.replace(/catch \(e\) \{\s*console\.error\('Init error:', e\);\s*\/\/ Still render chips\s*renderCategoryChips\(\);\s*\}\s*\}/,
   "catch (e) {\n      console.error('Init error:', e);\n      // Still render chips\n      renderCategoryChips();\n      if (typeof window.hideLoader === 'function') window.hideLoader();\n    }\n}");
   fs.writeFileSync(p, content);
}
console.log("Verified second hideLoader");
