const fs = require('fs');
const p = 'frontend/js/map.js';
let content = fs.readFileSync(p, 'utf8');

const regex = /var stateStats = projectsForState\(name, window\.PROJECT_STATS\);\s*var tons = stateStats\.tons;\s*var pCount = stateStats\.count;/;

const newStats = `var stateStats = projectsForState(name, window.PROJECT_STATS);
    var tons = name === 'Search Results' ? list.reduce(function(sum, p) { return sum + (p.tons || 0); }, 0) : stateStats.tons;
    var pCount = name === 'Search Results' ? list.length : stateStats.count;`;

content = content.replace(regex, newStats);

fs.writeFileSync(p, content);
console.log("Updated openPanel stats for search results in map.js!");
