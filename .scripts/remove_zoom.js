const fs = require('fs');
const p = 'frontend/js/map.js';
let content = fs.readFileSync(p, 'utf8');

// The code looks like:
// var g = svg.append('g');
// var zoom = d3.zoom().scaleExtent([1, 8]).on('zoom', function(event) { g.attr('transform', event.transform); });
// svg.call(zoom);
// g.selectAll('path')

content = content.replace(
  /var zoom = d3\.zoom\(\)\.scaleExtent\(\[1, 8\]\)\.on\('zoom', function\(event\) \{ g\.attr\('transform', event\.transform\); \}\);\s*svg\.call\(zoom\);\s*/g,
  ""
);

fs.writeFileSync(p, content);
console.log("Removed map zoom and drag feature");
