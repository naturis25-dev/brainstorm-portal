const fs = require('fs');
let p = 'frontend/css/style.css';
let content = fs.readFileSync(p, 'utf8');

const additionalMobileCSS = `
@media (max-width: 768px) {
  /* Move Day/Night toggle to the left to avoid Back to Top collision */
  #dntToggle {
    right: auto !important;
    left: 24px !important;
  }
  
  /* Shift search bar to the right to make room */
  .inline-search-wrap {
    left: 92px !important;
    right: 24px !important;
  }

  /* Make map click burst boxes smaller on mobile */
  .burst-thumb {
    width: 76px !important;
    height: 54px !important;
    border-radius: 6px !important;
    border-width: 2px !important;
  }
  .bt-label {
    font-size: 8px !important;
    padding: 2px 4px !important;
  }
}
`;

content = content + "\n" + additionalMobileCSS;
fs.writeFileSync(p, content);
console.log("Applied left toggle and smaller burst thumbs");
