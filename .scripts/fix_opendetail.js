const fs = require('fs');
let p = 'frontend/js/app.js';
let content = fs.readFileSync(p, 'utf8');

const target = "window.openDetail = function(id) {\n  const p = PROJECTS.find(x => x.id === id);\n  if (!p) return;";
const replacement = `window.openDetail = async function(id) {
  const p = PROJECTS.find(x => x.id === id);
  if (!p) return;

  if (p._fullLoaded !== true) {
    try {
      const full = await apiFetch('/projects/' + id);
      p.images = full.images;
      p.description = full.description;
      p._fullLoaded = true;
    } catch(e) { console.error("Could not fetch full details", e); }
  }`;

content = content.replace("window.openDetail = function(id) {\n  const p = PROJECTS.find(x => x.id === id);\n  if (!p) return;", replacement);
fs.writeFileSync(p, content);
console.log("Updated openDetail");
