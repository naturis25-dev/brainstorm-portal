const fs = require('fs');
let p = 'frontend/js/app.js';
let content = fs.readFileSync(p, 'utf8');

content = content.replace(/renderCategoryChips\(\);[\s\n]*\} catch \(e\) \{/, 
  "renderCategoryChips();\n    if (typeof window.hideLoader === 'function') window.hideLoader();\n  } catch (e) {");

content = content.replace(/renderCategoryChips\(\);[\s\n]*\}[\s\n]*\}\n\n\/\* =================/, 
  "renderCategoryChips();\n    if (typeof window.hideLoader === 'function') window.hideLoader();\n  }\n}\n\n/* =================");

fs.writeFileSync(p, content);
console.log("Injected window.hideLoader() into fetchAppInitialData() with regex");
