const fs = require('fs');
let p = 'frontend/js/app.js';
let content = fs.readFileSync(p, 'utf8');

content = content.replace(/renderMap\(\);\s*\} catch \(e\) \{/, "renderMap();\n    if (typeof window.hideLoader === 'function') window.hideLoader();\n  } catch (e) {");

content = content.replace(/renderMap\(\);\s*\}\s*\}\s*function setupDragAndDrop/, "renderMap();\n    if (typeof window.hideLoader === 'function') window.hideLoader();\n  }\n}\n\nfunction setupDragAndDrop");

fs.writeFileSync(p, content);
console.log("Regex injected hideLoader");
