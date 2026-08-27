const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, '..', '..', 'frontend', 'js', 'app.js');
let code = fs.readFileSync(p, 'utf8');

// 1. Replace limit=10000 with limit=50
code = code.replace("apiFetch('/projects?limit=10000')", "apiFetch('/projects?limit=50')");

// 2. Fix res.projects to res.data
code = code.replace("PROJECTS = res.projects || [];", "PROJECTS = res.data || [];");

// 3. Fix the stats aggregation to use /projects/stats instead of local variables
// Target:
// const stateCount = new Set(PROJECTS.map(p => p.state)).size;
// const activeCount = PROJECTS.filter(p => p.status === 'Active').length;
// const totalTons = PROJECTS.reduce((a, p) => a + (p.tons || 0), 0);
// statsRow.innerHTML = `
//   <div class="stat"><div class="n">${PROJECTS.length}</div><div class="l">TOTAL PROJECTS</div></div>
//   <div class="stat"><div class="n">${stateCount}</div><div class="l">REGIONS COVERED</div></div>
//   <div class="stat"><div class="n">${totalTons.toLocaleString()}</div><div class="l">TOTAL TONS</div></div>
// `;

const blockToReplace = `    const stateCount = new Set(PROJECTS.map(p => p.state)).size;
    const activeCount = PROJECTS.filter(p => p.status === 'Active').length;
    const totalTons = PROJECTS.reduce((a, p) => a + (p.tons || 0), 0);
    statsRow.innerHTML = \`
      <div class="stat"><div class="n">\${PROJECTS.length}</div><div class="l">TOTAL PROJECTS</div></div>
      <div class="stat"><div class="n">\${stateCount}</div><div class="l">REGIONS COVERED</div></div>
      <div class="stat"><div class="n">\${totalTons.toLocaleString()}</div><div class="l">TOTAL TONS</div></div>
    \`;`;

const newBlock = `    try {
      const stats = await apiFetch('/projects/stats');
      statsRow.innerHTML = \`
        <div class="stat"><div class="n">\${stats.totalProjects}</div><div class="l">TOTAL PROJECTS</div></div>
        <div class="stat"><div class="n">\${stats.statesCovered}</div><div class="l">REGIONS COVERED</div></div>
        <div class="stat"><div class="n">\${(stats.totalTons || 0).toLocaleString()}</div><div class="l">TOTAL TONS</div></div>
      \`;
    } catch(e) { console.error(e); }`;

code = code.replace(blockToReplace, newBlock);

fs.writeFileSync(p, code);
console.log("Safe replacement complete.");
