const fs = require('fs');
const p = 'frontend/js/app.js';
let content = fs.readFileSync(p, 'utf8');

// The syntax error is at `    })\n    .catch(err => console.error("Stats refresh failed", err));\n}`
// which seems to be the tail end of refreshMapStats. Let's just remove that dangling piece and append the whole function.

content = content.replace(/    \}\)\n    \.catch\(err => console\.error\("Stats refresh failed", err\)\);\n\}/, "");

const newRefreshMapStats = `
function refreshMapStats() {
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
}
`;

content = content.replace("function setupGlobalSearch() {", newRefreshMapStats + "\nfunction setupGlobalSearch() {");

fs.writeFileSync(p, content);
console.log("Fixed syntax error in app.js");
