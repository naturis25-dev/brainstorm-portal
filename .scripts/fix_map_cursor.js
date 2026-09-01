const fs = require('fs');
const p = 'frontend/css/style.css';
let content = fs.readFileSync(p, 'utf8');

const newCSS = `
/* Map Zoom Cursor */
#map {
  cursor: grab;
}
#map:active {
  cursor: grabbing;
}
`;

fs.appendFileSync(p, newCSS);
console.log("Added grab cursor to map!");
