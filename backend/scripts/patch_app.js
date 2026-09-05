const fs = require('fs');
const path = require('path');

const p = path.join(__dirname, '..', '..', 'frontend', 'js', 'app.js');
let code = fs.readFileSync(p, 'utf8');

const targetStr = `  // Fetch full list for the admin table only when admin view is opened
  try {
    const res = await apiFetch('/projects?limit=10000');
    PROJECTS = res.projects || [];
  } catch (e) {
    console.error('Failed to load admin projects:', e);
  }

  const statsRow = document.getElementById('adminStatsRow');
  if (statsRow) {
    const stateCount = new Set(PROJECTS.map(p => p.state)).size;
    const activeCount = PROJECTS.filter(p => p.status === 'Active').length;
    const totalTons = PROJECTS.reduce((a, p) => a + (p.tons || 0), 0);
    statsRow.innerHTML = \`
      <div class="stat"><div class="n">\\${PROJECTS.length}</div><div class="l">TOTAL PROJECTS</div></div>
      <div class="stat"><div class="n">\\${stateCount}</div><div class="l">REGIONS COVERED</div></div>
      <div class="stat"><div class="n">\\${totalTons.toLocaleString()}</div><div class="l">TOTAL TONS</div></div>
    \`;
  }`;

const replaceStr = `  // Fetch bounded list and use aggregate stats endpoint instead of loading all 4,500 projects
  try {
    const stats = await apiFetch('/projects/stats');
    const statsRow = document.getElementById('adminStatsRow');
    if (statsRow) {
      statsRow.innerHTML = \`
        <div class="stat"><div class="n">\\${stats.totalProjects}</div><div class="l">TOTAL PROJECTS</div></div>
        <div class="stat"><div class="n">\\${stats.statesCovered}</div><div class="l">REGIONS COVERED</div></div>
        <div class="stat"><div class="n">\\${(stats.totalTons || 0).toLocaleString()}</div><div class="l">TOTAL TONS</div></div>
      \`;
    }

    const res = await apiFetch('/projects?limit=50');
    PROJECTS = res.data || [];
  } catch (e) {
    console.error('Failed to load admin projects:', e);
  }`;

if (code.includes('const res = await apiFetch(\'/projects?limit=10000\');')) {
    // We will do a generic replacement using regex or indexOf to be safe against slight whitespace differences
    const startIdx = code.indexOf('// Fetch full list for the admin table');
    const endIdxStr = '    `;\n  }';
    const endIdx = code.indexOf(endIdxStr, startIdx) + endIdxStr.length;
    
    if(startIdx !== -1 && endIdx !== -1) {
        code = code.substring(0, startIdx) + replaceStr + code.substring(endIdx);
        fs.writeFileSync(p, code);
        console.log("Patch applied successfully.");
    } else {
        console.log("Could not find exact block to replace.");
    }
} else {
    console.log("Target string not found in app.js.");
}
