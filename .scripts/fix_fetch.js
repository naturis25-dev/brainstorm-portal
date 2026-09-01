const fs = require('fs');
let p = 'frontend/js/app.js';
let content = fs.readFileSync(p, 'utf8');

const target = `    const [meta, proj] = await Promise.all([
      apiFetch('/metadata'),
      apiFetch('/projects?limit=5000')
    ]);
    METADATA = meta;
    PROJECTS = proj.projects || proj.data || [];`;

const replacement = `    // Start background fetch for the massive projects list
    apiFetch('/projects?limit=5000').then(proj => {
      PROJECTS = proj.projects || proj.data || [];
      if (document.getElementById('adminView') && document.getElementById('adminView').style.display !== 'none') {
        renderAdmin();
      }
    }).catch(err => console.error("Background fetch failed", err));

    const [meta] = await Promise.all([
      apiFetch('/metadata')
    ]);
    METADATA = meta;`;

content = content.replace(target, replacement);

fs.writeFileSync(p, content);
console.log("Updated fetchAppInitialData to async background fetch");
