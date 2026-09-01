const fs = require('fs');
const p = 'frontend/js/app.js';
let content = fs.readFileSync(p, 'utf8');

// We need to call setupGlobalSearch() right after row.innerHTML is updated, 
// outside of the click handlers.

const replacement = `  row.querySelectorAll('.cat-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      currentCategory = chip.dataset.cat;
      renderCategoryChips();
      refreshMapStats();
      closePanel();
    });
  });
  
  // Attach search listeners to the newly rendered search box
  if (typeof setupGlobalSearch === 'function') setupGlobalSearch();
}`;

content = content.replace(/  row\.querySelectorAll\('\.cat-chip'\)[\s\S]*?\}\);[\s\n]*\}\);[\s\n]*\}/, replacement);

fs.writeFileSync(p, content);
console.log("Fixed setupGlobalSearch binding in renderCategoryChips");
