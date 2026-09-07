const fs = require('fs');
const p = 'frontend/js/app.js';
let content = fs.readFileSync(p, 'utf8');

const replacement = `async function fetchAppInitialData() {
  try {
    const [meta, proj] = await Promise.all([
      apiFetch('/metadata'),
      apiFetch('/projects')
    ]);
    METADATA = meta;
    PROJECTS = proj.projects || proj.data || proj || [];

    // Also fetch map stats initially
    refreshMapStats();

    // Populate dropdowns and checkboxes`;

content = content.replace(/async function fetchAppInitialData\(\) \{[\s\S]*?\/\/ Populate dropdowns and checkboxes/, replacement);

fs.writeFileSync(p, content);
console.log("Updated fetchAppInitialData to refresh map stats on load");
