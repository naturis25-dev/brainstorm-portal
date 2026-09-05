const fs = require('fs');
let p = 'frontend/js/app.js';
let content = fs.readFileSync(p, 'utf8');

const target = "apiFetch('/projects?limit=5000')";
const replacement = "apiFetch('/projects?limit=5000&lite=true')";

content = content.replace(target, replacement);
fs.writeFileSync(p, content);
console.log("Updated frontend to use lite=true");
