const fs = require('fs');
const p = 'frontend/js/app.js';
let content = fs.readFileSync(p, 'utf8');

// Change apiFetch('/projects?limit=50') to apiFetch('/projects?limit=5000')
content = content.replace(
  "apiFetch('/projects?limit=50')",
  "apiFetch('/projects?limit=5000')"
);

fs.writeFileSync(p, content);
console.log("Updated fetchAppInitialData to load all projects (limit 5000)");
