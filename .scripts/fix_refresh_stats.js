const fs = require('fs');
const p = 'frontend/js/app.js';
let content = fs.readFileSync(p, 'utf8');

const newRefresh = `function refreshMapStats() {
  apiFetch('/projects/stats?country=' + currentCountry + '&category=' + encodeURIComponent(currentCategory))
    .then(res => {
      window.PROJECT_STATS = res.data || [];
      if (window.MapModule) {
        window.MapModule.loadMapData(() => {
          window.MapModule.drawMap(window.PROJECT_STATS, currentCategory, currentCountry);
        });
      }
    })
    .catch(err => console.error("Stats refresh failed", err));
}`;

content = content.replace(/function refreshMapStats\(\) \{[\s\S]*?\}\n/, newRefresh + "\n");

fs.writeFileSync(p, content);
console.log("Updated refreshMapStats to safely load map data before drawing.");
