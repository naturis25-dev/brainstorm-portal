const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, '..', '..', 'frontend', 'js', 'app.js');
let content = fs.readFileSync(p, 'utf8');

// 1. Initial Data Fetch -> Stats Only
content = content.replace(
  "apiFetch('/projects')",
  "apiFetch('/projects/stats?country=us&category=All')"
);
content = content.replace(
  "PROJECTS = proj.projects || [];",
  "PROJECT_STATS = proj || {};"
);

// 2. Add refreshMapStats helper (since we lost it)
if (!content.includes('async function refreshMapStats')) {
    const fn = `
async function refreshMapStats() {
    try {
        PROJECT_STATS = await apiFetch('/projects/stats?country=' + window.currentCountry + '&category=' + window.currentCategory);
        if (window.MapModule) window.MapModule.drawMap(PROJECTS, currentCategory, currentCountry);
    } catch(e) { console.error(e); }
}
`;
    content = content.replace('async function fetchAppInitialData', fn + '\nasync function fetchAppInitialData');
}

// 3. renderAdmin rewrite (to not fetch all 10000 projects, use res.data, and use /stats)
const oldRenderAdminStart = content.indexOf('function renderAdmin() {');
const oldRenderAdminEnd = content.indexOf('function renderAdminTable', oldRenderAdminStart);

const newRenderAdmin = `async function renderAdmin() {
  const isSuperAdmin = sessionStorage.getItem('steeltrack_is_superadmin') === 'true';
  const title = document.getElementById('adminPageTitle');
  if (title) title.textContent = isSuperAdmin ? 'Super Atlas Admin Dashboard' : 'Atlas Admin Dashboard';
  
  const manageAdminsBtn = document.getElementById('navManageAdminsBtn');
  if (manageAdminsBtn) manageAdminsBtn.style.display = isSuperAdmin ? '' : 'none';

  try {
    const stats = await apiFetch('/projects/stats');
    const statsRow = document.getElementById('adminStatsRow');
    if (statsRow) {
      statsRow.innerHTML = \`
        <div class="stat"><div class="n">\${stats.totalProjects}</div><div class="l">TOTAL PROJECTS</div></div>
        <div class="stat"><div class="n">\${stats.statesCovered}</div><div class="l">REGIONS COVERED</div></div>
        <div class="stat"><div class="n">\${(stats.totalTons || 0).toLocaleString()}</div><div class="l">TOTAL TONS</div></div>
      \`;
    }
    const res = await apiFetch('/projects?limit=50');
    PROJECTS = res.data || [];
  } catch (e) {
    console.error('Failed to load admin projects:', e);
  }

  renderAdminTable(typeof getFilteredSortedAdminProjects === 'function' ? getFilteredSortedAdminProjects() : PROJECTS);
}
`;

content = content.substring(0, oldRenderAdminStart) + newRenderAdmin + content.substring(oldRenderAdminEnd);

// 4. Update res.project to res.data where applicable
content = content.replace("PROJECTS.push(res.project);", "PROJECTS.push(res.project || res.data || res);");
content = content.replace("PROJECTS[idx] = res.project;", "PROJECTS[idx] = res.project || res.data || res;");

fs.writeFileSync(p, content);
console.log("App restored and patched safely.");
