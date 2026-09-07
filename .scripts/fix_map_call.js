const fs = require('fs');
const p = 'frontend/js/app.js';
let content = fs.readFileSync(p, 'utf8');
content = content.replace(/drawMap\(PROJECTS,/g, 'drawMap(PROJECT_STATS,');
fs.writeFileSync(p, content);
console.log("Replaced PROJECTS with PROJECT_STATS in drawMap calls!");
