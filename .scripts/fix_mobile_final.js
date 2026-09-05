const fs = require('fs');
let p = 'frontend/css/style.css';
let content = fs.readFileSync(p, 'utf8');

const additionalMobileCSS = `
@media (max-width: 768px) {
  /* Fix Topbar Brochure wrapping */
  #navBrochureLabel .title {
    display: none !important;
  }
  #navBrochureLabel {
    padding: 9px 11px !important; /* Match other icon buttons */
    border-radius: 50% !important;
    background: transparent !important;
  }
  #navBrochureLabel .circle {
    background: transparent !important;
    width: auto !important;
    height: auto !important;
  }
  #navBrochureLabel svg {
    stroke: var(--ink) !important;
    width: 20px !important;
    height: 20px !important;
  }
  #navBrochureLabel::before {
    display: none !important;
  }

  /* Fix Bottom Floating Alignment */
  #dntToggle, .inline-search-wrap {
    bottom: 20px !important;
    height: 52px !important;
    margin: 0 !important;
  }
  #dntToggle {
    left: 16px !important;
    width: 52px !important;
  }
  .inline-search-wrap {
    left: 80px !important;
    right: 16px !important;
  }
  .inline-search-wrap input {
    height: 102% !important; /* Fix any inner height issues */
  }
  
  /* Reduce map-hero margins to tighten up space */
  .map-hero {
    margin: 16px 16px 12px 16px !important;
  }
  .chip-row {
    padding-bottom: 70px !important; /* Leave proper space for fixed footer items to not overlap map on scroll */
  }
}
`;

content = content + "\n" + additionalMobileCSS;
fs.writeFileSync(p, content);
console.log("Applied final mobile layout polish");
