const fs = require('fs');
let p = 'frontend/js/app.js';
let content = fs.readFileSync(p, 'utf8');

const regex = /closePanel\(\);\s*\}\);\s*\}\);\s*\}/g;

const newListeners = `closePanel();
      });
    });

    const searchInput = document.getElementById('globalProjectSearch');
    const searchBtn = document.getElementById('globalSearchBtn');
    
    function executeSearch() {
      const q = searchInput.value.trim();
      if (!q) {
        if (window.MapModule) window.MapModule.drawMap(window.PROJECT_STATS || PROJECTS, currentCategory, currentCountry);
        return;
      }
      
      const lowerQ = q.toLowerCase();
      const filtered = (window.PROJECT_STATS || PROJECTS).filter(p => {
        return (p.title || '').toLowerCase().includes(lowerQ) ||
               (p.state || '').toLowerCase().includes(lowerQ) ||
               (p.category || '').toLowerCase().includes(lowerQ) ||
               (p.type || '').toLowerCase().includes(lowerQ);
      });
      
      if (window.MapModule) {
        window.MapModule.drawMap(filtered, currentCategory, currentCountry);
      }
    }

    if (searchBtn) searchBtn.addEventListener('click', executeSearch);
    if (searchInput) {
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') executeSearch();
      });
      // also allow instant filtering
      searchInput.addEventListener('input', () => {
         if (searchInput.value.trim() === '') executeSearch();
      });
    }
  }`;

content = content.replace(regex, newListeners);
fs.writeFileSync(p, content);
console.log("Added search event listeners!");
