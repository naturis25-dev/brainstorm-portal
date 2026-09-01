const fs = require('fs');
let p = 'frontend/js/map.js';
let content = fs.readFileSync(p, 'utf8');

const target = "<option value=\"default\">Sort: Default</option>";
const replacement = "<option value=\"default\">Sort: Default</option>' +\n                '<option value=\"key\">Key Projects</option>' +\n                '<option value=\"tonnage_asc\">Smallest Tonnage</option>";

content = content.replace(target, replacement);
fs.writeFileSync(p, content);
console.log("Updated map.js sorting dropdown");
