const fs = require('fs');
const p = 'frontend/js/app.js';
let content = fs.readFileSync(p, 'utf8');

content = content.replace(
  "const q = searchInput.value.trim();",
  "const q = document.getElementById('globalProjectSearch').value.trim();"
);

fs.writeFileSync(p, content);
console.log("Fixed search input value retrieval in executeSearch");
