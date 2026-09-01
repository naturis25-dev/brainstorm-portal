const fs = require('fs');
let p = 'frontend/js/app.js';
let content = fs.readFileSync(p, 'utf8');

const regex = /const \[meta, proj\] = await Promise\.all\(\[\s*apiFetch\('\/metadata'\),\s*apiFetch\('\/projects\?limit=5000'\)\s*\]\);\s*METADATA = meta;\s*PROJECTS = proj\.projects \|\| proj\.data \|\| \[\];/;

const replacement = `// Start background fetch for the massive projects list
    apiFetch('/projects?limit=5000').then(proj => {
      PROJECTS = proj.projects || proj.data || [];
      if (document.getElementById('adminView') && document.getElementById('adminView').style.display !== 'none') {
        renderAdmin();
      }
    }).catch(err => console.error("Background fetch failed", err));

    const meta = await apiFetch('/metadata');
    METADATA = meta;`;

content = content.replace(regex, replacement);
fs.writeFileSync(p, content);
console.log("Updated with regex");
