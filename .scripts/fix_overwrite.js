const fs = require('fs');
let p = 'frontend/js/map.js';
let content = fs.readFileSync(p, 'utf8');

content = content.replace("window.PROJECTS = projectsData;", "");
fs.writeFileSync(p, content);

console.log("Removed global PROJECTS overwrite from map.js");
