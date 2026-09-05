const fs = require('fs');
const p = 'frontend/js/app.js';
let content = fs.readFileSync(p, 'utf8');

const searchJS = `
function setupGlobalSearch() {
  const searchInput = document.getElementById('globalProjectSearch');
  if (!searchInput) return;
  
  let debounceTimer;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(debounceTimer);
    const q = e.target.value.trim();
    if (!q) {
      if (document.getElementById('panel').classList.contains('open') && document.querySelector('.p-title').innerText === 'Search Results') {
        document.getElementById('panel').classList.remove('open');
        document.getElementById('overlay').classList.remove('open');
      }
      return;
    }
    
    debounceTimer = setTimeout(() => {
      apiFetch('/projects?search=' + encodeURIComponent(q) + '&limit=100')
        .then(res => {
          if (typeof openPanel === 'function') {
            openPanel('Search Results', res.data || []);
            document.getElementById('panel').classList.add('open');
            document.getElementById('overlay').classList.add('open');
          }
        })
        .catch(err => console.error("Search fetch failed", err));
    }, 400);
  });
}
`;

content = content.replace("function initApp() {", searchJS + "\nfunction initApp() {");
content = content.replace("setupDragAndDrop();", "setupDragAndDrop();\n  setupGlobalSearch();");

fs.writeFileSync(p, content);
console.log("Added global search JS logic!");
