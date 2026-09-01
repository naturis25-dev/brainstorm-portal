const fs = require('fs');
const geo = JSON.parse(fs.readFileSync('frontend/assets/vendor/canada.geojson', 'utf8'));
const names = geo.features.map(f => f.properties.name);
console.log(names);
