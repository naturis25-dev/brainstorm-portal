const fs = require('fs');
let p = 'frontend/js/map.js';
let content = fs.readFileSync(p, 'utf8');

const target = `function drawMap(stats, categoryFilter, countryFilter) {
  var country  = countryFilter  || 'us';
  var category = categoryFilter || 'All';

  var svg = d3.select('#map');
  if (svg.empty()) return;
  svg.selectAll('*').remove();

  document.body.classList.toggle('theme-ca', country === 'ca');`;

const replacement = `let lastCountry = null;
let mapTransitionTimeout = null;

function drawMap(stats, categoryFilter, countryFilter) {
  var country  = countryFilter  || 'us';
  var category = categoryFilter || 'All';

  var svg = d3.select('#map');
  if (svg.empty()) return;

  const render = () => {
    svg.selectAll('*').remove();
    document.body.classList.toggle('theme-ca', country === 'ca');`;

const target2 = `  var projection = country === 'us'`;
const replacement2 = `  };

  if (lastCountry !== null && lastCountry !== country) {
    if (mapTransitionTimeout) clearTimeout(mapTransitionTimeout);
    var svgNode = svg.node();
    svgNode.classList.add('fade-out');
    
    mapTransitionTimeout = setTimeout(() => {
      render();
      svgNode.classList.remove('fade-out');
      
      // Continue with the rest of drawMap logic inside the timeout
      finishDrawMap();
    }, 250);
  } else {
    render();
    finishDrawMap();
  }
  
  lastCountry = country;

  function finishDrawMap() {
    var projection = country === 'us'`;

// Wait, doing finishDrawMap() might be tricky if local variables are used below, like 'feats' which needs to be defined.
