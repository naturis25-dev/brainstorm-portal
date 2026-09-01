const fs = require('fs');
const p = 'frontend/js/app.js';
let content = fs.readFileSync(p, 'utf8');

content = content.replace(
  "if (window.MapModule) window.MapModule.drawMap(PROJECTS, currentCategory, currentCountry);",
  "if (typeof refreshMapStats === 'function') refreshMapStats(); else if (window.MapModule) window.MapModule.drawMap(window.PROJECT_STATS || PROJECTS, currentCategory, currentCountry);"
);

fs.writeFileSync(p, content);
console.log("Updated country toggle to use refreshMapStats");
