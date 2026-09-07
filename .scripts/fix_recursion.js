const fs = require('fs');
const p = 'frontend/js/app.js';
let content = fs.readFileSync(p, 'utf8');

const brokenFunc = `async function refreshMapStats() {
    try {
        PROJECT_STATS = await apiFetch('/projects/stats?country=' + window.currentCountry + '&category=' + window.currentCategory);
        refreshMapStats();
    } catch(e) { console.error(e); }
}`;

const fixedFunc = `async function refreshMapStats() {
    try {
        PROJECT_STATS = await apiFetch('/projects/stats?country=' + currentCountry + '&category=' + currentCategory);
        if (window.MapModule) window.MapModule.drawMap(PROJECT_STATS, currentCategory, currentCountry);
    } catch(e) { console.error(e); }
}`;

if (content.includes('refreshMapStats();\n    } catch(e)')) {
    content = content.replace(/async function refreshMapStats\(\) \{[\s\S]*?refreshMapStats\(\);[\s\S]*?catch\(e\) \{ console\.error\(e\); \}\n\}/, fixedFunc);
    fs.writeFileSync(p, content);
    console.log("Fixed infinite recursion in refreshMapStats!");
} else {
    console.log("Could not find the broken function.");
}
