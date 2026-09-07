const fs = require('fs');
let p = 'frontend/css/style.css';
let content = fs.readFileSync(p, 'utf8');

const additionalMobileCSS = `
@media (max-width: 768px) {
  /* Reduce map-note text size */
  .map-note {
    font-size: 10px !important;
    line-height: 1.4 !important;
    padding: 0 10px !important;
    margin-top: 8px !important;
  }
}
`;

content = content + "\n" + additionalMobileCSS;
fs.writeFileSync(p, content);
console.log("Reduced map-note font size on mobile");
