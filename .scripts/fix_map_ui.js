const fs = require('fs');
const p = 'frontend/css/style.css';
let content = fs.readFileSync(p, 'utf8');

const newCSS = `
/* =========================================================
   MAP VISUAL ENHANCEMENTS
   ========================================================= */

#map {
  filter: drop-shadow(0px 15px 35px rgba(37, 99, 235, 0.25));
  overflow: visible;
}
body.dark-mode #map {
  filter: drop-shadow(0px 15px 35px rgba(239, 68, 68, 0.25));
}

.map-card {
  background-image: 
    linear-gradient(rgba(37, 99, 235, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(37, 99, 235, 0.04) 1px, transparent 1px) !important;
  background-size: 20px 20px !important;
  background-position: center center !important;
}

body.dark-mode .map-card {
  background-image: 
    linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px) !important;
}

.state {
  stroke: rgba(255, 255, 255, 0.4) !important;
  stroke-width: 0.8px !important;
  stroke-linejoin: round;
  transition: filter 0.25s ease, stroke-width 0.25s ease, opacity 0.25s ease, transform 0.25s ease !important;
}

.state:hover {
  filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.5)) drop-shadow(0 10px 20px rgba(0,0,0,0.3)) brightness(1.15) !important;
  transform: scale(1.02) translateY(-2px) !important;
  stroke: rgba(255, 255, 255, 1) !important;
  stroke-width: 1.5px !important;
}
`;

fs.appendFileSync(p, newCSS);
console.log("Appended visual enhancements to style.css!");
