const fs = require('fs');
const p = 'frontend/js/app.js';
let content = fs.readFileSync(p, 'utf8');

const replacement = `async function fetchAppInitialData() {
  try {
    // Fire map stats fetch immediately so the map renders ASAP
    refreshMapStats();

    const [meta, proj] = await Promise.all([
      apiFetch('/metadata'),
      apiFetch('/projects?limit=50') // Limit to speed up initial load
    ]);
    METADATA = meta;
    PROJECTS = proj.projects || proj.data || proj || [];

    // Populate dropdowns and checkboxes`;

content = content.replace(/async function fetchAppInitialData\(\) \{[\s\S]*?\/\/ Populate dropdowns and checkboxes/, replacement);

// Clean up any remaining renderMap calls
content = content.replace(/renderMap\(\);\n/g, "");

fs.writeFileSync(p, content);
console.log("Optimized fetchAppInitialData for instant map rendering");
