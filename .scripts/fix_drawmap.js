const fs = require('fs');
const p = 'frontend/js/app.js';
let content = fs.readFileSync(p, 'utf8');

// Replace all occurrences of drawMap(PROJECTS, ...) with drawMap(window.PROJECT_STATS || PROJECTS, ...)
content = content.replace(/drawMap\(PROJECTS,/g, "drawMap(window.PROJECT_STATS || PROJECTS,");

fs.writeFileSync(p, content);
console.log("Updated drawMap calls to use PROJECT_STATS");
