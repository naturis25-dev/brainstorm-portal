const fs = require('fs');
const p = 'frontend/js/app.js';
let content = fs.readFileSync(p, 'utf8');

content = content.replace(
  "window.PROJECT_STATS = res.data || [];",
  "window.PROJECT_STATS = res.regions ? res : (res.data || res || []);"
);

fs.writeFileSync(p, content);
console.log("Fixed refreshMapStats to correctly assign the stats object");
