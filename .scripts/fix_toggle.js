const fs = require('fs');
let p = 'frontend/css/style.css';
let content = fs.readFileSync(p, 'utf8');

const additionalMobileCSS = `
@media (max-width: 768px) {
  /* Make Country Toggle Bar Ultra Compact */
  .toggle-row {
    padding: 4px !important;
    border-radius: 8px !important;
    margin-bottom: 10px !important;
  }
  .toggle-btn {
    padding: 4px 12px !important;
    font-size: 11px !important;
    border-radius: 6px !important;
  }
  .toggle-btn svg {
    width: 12px !important;
    height: 12px !important;
  }
}
`;

content = content + "\n" + additionalMobileCSS;
fs.writeFileSync(p, content);
console.log("Shrunk toggle row");
