const fs = require('fs');
const p = 'frontend/js/map.js';
let content = fs.readFileSync(p, 'utf8');

const replacement = `  var g = svg.append('g');
  var zoom = d3.zoom().scaleExtent([1, 8]).on('zoom', function(event) { g.attr('transform', event.transform); });
  svg.call(zoom);
  g.selectAll('path')`;

content = content.replace("svg.append('g').selectAll('path')", replacement);

fs.writeFileSync(p, content);
console.log("Added interactive zoom/pan to map.js!");
