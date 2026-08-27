const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, '..', '..', 'frontend', 'js', 'app.js');
let content = fs.readFileSync(p, 'utf8');

// Replace limit=10000 with limit=50
content = content.replace("apiFetch('/projects?limit=10000')", "apiFetch('/projects?limit=50')");

// Fix res.projects to res.data
content = content.replace("PROJECTS = res.projects || [];", "PROJECTS = res.data || [];");

// We also need to fix the stats block because counting stateCount/activeCount/totalTons on a bounded PROJECTS array (50) will show wrong stats!
// Let's rewrite that block completely.
const statsBlockStart = content.indexOf("const statsRow = document.getElementById('adminStatsRow');");
const statsBlockEnd = content.indexOf("    `;\n  }", statsBlockStart) + 10;

const newStatsBlock = `
  const statsRow = document.getElementById('adminStatsRow');
  if (statsRow) {
    try {
      const stats = await apiFetch('/projects/stats');
      statsRow.innerHTML = \`
        <div class="stat"><div class="n">\${stats.totalProjects}</div><div class="l">TOTAL PROJECTS</div></div>
        <div class="stat"><div class="n">\${stats.statesCovered}</div><div class="l">REGIONS COVERED</div></div>
        <div class="stat"><div class="n">\${(stats.totalTons || 0).toLocaleString()}</div><div class="l">TOTAL TONS</div></div>
      \`;
    } catch(e) { console.error(e); }
  }
`;

content = content.substring(0, statsBlockStart) + newStatsBlock + content.substring(statsBlockEnd);
fs.writeFileSync(p, content);
console.log("Replaced successfully!");
