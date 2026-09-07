const fs = require('fs');
let p = 'frontend/js/app.js';
let content = fs.readFileSync(p, 'utf8');

content = content.replace("PROJECTS = proj.projects || [];", "PROJECTS = proj.data || proj.projects || proj || [];");

fs.writeFileSync(p, content);
console.log("Fixed PROJECTS assignment");
