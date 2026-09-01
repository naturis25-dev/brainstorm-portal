const fs = require('fs');
let p = 'frontend/js/app.js';
let content = fs.readFileSync(p, 'utf8');

const target = `        if (currentCountry === 'ca' || currentCountry === 'Canada') {
          if (minSlider) minSlider.classList.add('ca');
          if (heroPill) { heroPill.classList.remove('usa'); heroPill.classList.add('ca'); }
          if (heroHighlight) heroHighlight.className = 'highlight-ca';
        } else {
          if (minSlider) minSlider.classList.remove('ca');
          if (heroPill) { heroPill.classList.remove('ca'); heroPill.classList.add('usa'); }
          if (heroHighlight) heroHighlight.className = 'highlight-usa';
        }
  
        if (window.MapModule) window.MapModule.drawMap(window.PROJECT_STATS || PROJECTS, currentCategory, currentCountry);
      });`;

const replacement = `        if (currentCountry === 'ca' || currentCountry === 'Canada') {
          if (minSlider) minSlider.classList.add('ca');
          if (heroPill) { heroPill.classList.remove('usa'); heroPill.classList.add('ca'); }
          if (heroHighlight) heroHighlight.className = 'highlight-ca';
        } else {
          if (minSlider) minSlider.classList.remove('ca');
          if (heroPill) { heroPill.classList.remove('ca'); heroPill.classList.add('usa'); }
          if (heroHighlight) heroHighlight.className = 'highlight-usa';
        }
  
        const mapEl = document.getElementById('map');
        if (mapEl) {
          mapEl.classList.add('fade-out');
          setTimeout(() => {
            if (window.MapModule) window.MapModule.drawMap(window.PROJECT_STATS || PROJECTS, currentCategory, currentCountry);
            setTimeout(() => mapEl.classList.remove('fade-out'), 50);
          }, 250);
        } else {
          if (window.MapModule) window.MapModule.drawMap(window.PROJECT_STATS || PROJECTS, currentCategory, currentCountry);
        }
      });`;

content = content.replace(target, replacement);
fs.writeFileSync(p, content);
console.log("Fixed map transition!");
