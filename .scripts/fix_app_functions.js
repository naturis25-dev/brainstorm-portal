const fs = require('fs');
const p = 'frontend/js/app.js';
let content = fs.readFileSync(p, 'utf8');

const additions = `
function refreshMapStats() {
  apiFetch('/projects/stats?country=' + currentCountry + '&category=' + encodeURIComponent(currentCategory))
    .then(res => {
      window.PROJECT_STATS = res.data || [];
      if (window.MapModule) window.MapModule.drawMap(window.PROJECT_STATS, currentCategory, currentCountry);
    })
    .catch(err => console.error("Stats refresh failed", err));
}

function setupGlobalSearch() {
  const searchInput = document.getElementById('globalProjectSearch');
  const searchBtn = document.getElementById('globalSearchBtn');
  if (!searchInput) return;
  
  function executeSearch() {
    const q = searchInput.value.trim();
    if (!q) {
      const titleEl = document.querySelector('.p-title');
      if (document.getElementById('panel').classList.contains('open') && titleEl && titleEl.innerText === 'Search Results') {
        document.getElementById('panel').classList.remove('open');
        document.getElementById('overlay').classList.remove('open');
      }
      return;
    }
    
    apiFetch('/projects?search=' + encodeURIComponent(q) + '&limit=100')
      .then(res => {
        if (typeof openPanel === 'function') {
          openPanel('Search Results', res.data || []);
          document.getElementById('panel').classList.add('open');
          document.getElementById('overlay').classList.add('open');
        }
      })
      .catch(err => console.error("Search fetch failed", err));
  }
  
  // Remove old listeners to avoid duplicates on re-render
  const newInput = searchInput.cloneNode(true);
  searchInput.parentNode.replaceChild(newInput, searchInput);
  
  const newBtn = searchBtn ? searchBtn.cloneNode(true) : null;
  if (searchBtn) searchBtn.parentNode.replaceChild(newBtn, searchBtn);
  
  newInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      executeSearch();
    }
  });
  
  if (newBtn) {
    newBtn.addEventListener('click', (e) => {
      e.preventDefault();
      executeSearch();
    });
  }
}
`;

content = content.replace("function initApp() {", additions + "\nfunction initApp() {\n  setupGlobalSearch();");

fs.writeFileSync(p, content);
console.log("Added missing functions!");
