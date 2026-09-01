const fs = require('fs');
let p = 'frontend/js/app.js';
let content = fs.readFileSync(p, 'utf8');

const targetTry = "renderCategoryChips();\n  } catch (e) {";
const replacementTry = "renderCategoryChips();\n    if (typeof window.hideLoader === 'function') window.hideLoader();\n  } catch (e) {";

const targetCatch = "renderCategoryChips();\n  }\n}";
const replacementCatch = "renderCategoryChips();\n    if (typeof window.hideLoader === 'function') window.hideLoader();\n  }\n}";

content = content.replace(targetTry, replacementTry).replace(targetCatch, replacementCatch);
fs.writeFileSync(p, content);
console.log("Injected window.hideLoader() into fetchAppInitialData()");
