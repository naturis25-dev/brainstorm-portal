const fs = require('fs');
let p = 'frontend/js/app.js';
let content = fs.readFileSync(p, 'utf8');

const regex = /\/\/ Start background fetch for the massive projects list[\s\S]*?METADATA = meta;/;

const replacement = `const [meta, proj] = await Promise.all([
      apiFetch('/metadata'),
      apiFetch('/projects?limit=5000&lite=true')
    ]);
    METADATA = meta;
    PROJECTS = proj.projects || proj.data || [];`;

content = content.replace(regex, replacement);
fs.writeFileSync(p, content);
console.log("Restored Promise.all");
