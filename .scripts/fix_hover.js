const fs = require('fs');
const p = 'frontend/js/map.js';
let content = fs.readFileSync(p, 'utf8');

const oldHover = `function handleHover(event, d, stats) {
  var tooltip = d3.select('#tooltip');
  var name    = d.properties.name;
  var list    = projectsForState(name, projectsList, category);
  var tons    = list.reduce(function(a, p) { return a + (p.tons || 0); }, 0);

  if (!list || list.length === 0) {
    tooltip.html(
      '<div class="t-name">' + name + '</div>' +
      '<div class="t-meta">No projects yet</div>'
    ).classed('show', true);
  } else {
    tooltip.html(
      '<div class="t-name">' + name + '</div>' +
      '<div class="t-meta">' + Math.round(tons).toLocaleString() + ' Total Tons</div>' +
      '<div class="t-cta">Click to explore &rarr;</div>'
    ).classed('show', true);
  }
}`;

const newHover = `function handleHover(event, d, stats) {
  var tooltip = d3.select('#tooltip');
  var name    = d.properties.name;
  var region  = projectsForState(name, stats);

  if (!region || region.count === 0) {
    tooltip.html(
      '<div class="t-name">' + name + '</div>' +
      '<div class="t-meta">No projects yet</div>'
    ).classed('show', true);
  } else {
    tooltip.html(
      '<div class="t-name">' + name + '</div>' +
      '<div class="t-meta">' + Math.round(region.tons || 0).toLocaleString() + ' Total Tons</div>' +
      '<div class="t-cta">Click to explore &rarr;</div>'
    ).classed('show', true);
  }
}`;

// We have to be careful with regex due to newlines, so we'll replace by exact string matching or use an index.
const startIdx = content.indexOf('function handleHover(event, d, stats) {');
if (startIdx !== -1) {
  const endIdx = content.indexOf('function handleMove', startIdx);
  content = content.substring(0, startIdx) + newHover + '\n\n' + content.substring(endIdx);
  fs.writeFileSync(p, content);
  console.log('Fixed handleHover in map.js');
} else {
  console.log('Could not find handleHover');
}
