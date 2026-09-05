const fs = require('fs');
const p = 'frontend/js/app.js';
let content = fs.readFileSync(p, 'utf8');

// Replace the stale drawMap calls with refreshMapStats()
content = content.replace(
  /if \(window\.MapModule\) window\.MapModule\.drawMap\(PROJECT_STATS, currentCategory, currentCountry\);/g,
  'refreshMapStats();'
);

// Note: fetchAppInitialData shouldn't call refreshMapStats() again if it already fetches it, but let's check fetchAppInitialData
// Oh wait! fetchAppInitialData does:
// PROJECT_STATS = stats;
// and then renderMap() calls drawMap. That is fine.

fs.writeFileSync(p, content);
console.log("Replaced stale drawMap calls with refreshMapStats()!");
