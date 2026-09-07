const fs = require('fs');
let p = 'frontend/css/style.css';
let content = fs.readFileSync(p, 'utf8');

const additionalMobileCSS = `
@media (max-width: 768px) {
  /* Fix Brochure Button Visibility */
  #navBrochureLabel .circle {
    width: 20px !important;
    height: 20px !important;
  }
  
  /* Make Texts & UI More Compact */
  .map-hero .page-title {
    font-size: 24px !important;
    line-height: 1.15 !important;
    margin-bottom: 8px !important;
  }
  .map-hero .hero-desc {
    font-size: 12px !important;
    line-height: 1.4 !important;
  }
  .map-hero {
    margin: 12px 12px 8px 12px !important;
  }
  
  /* Compact Filter Chips */
  .cat-chip {
    padding: 5px 12px !important;
    font-size: 11px !important;
    border-radius: 100px !important;
    height: auto !important;
  }
  #categoryChipRow {
    gap: 6px !important;
    padding: 0 12px 65px 12px !important; /* Keep bottom padding for floating bar */
  }
  
  /* Compact Country Pills */
  .toggle-row {
    margin-bottom: 12px !important;
  }
  .toggle-btn {
    padding: 6px 14px !important;
    font-size: 12px !important;
  }
  .toggle-btn svg {
    width: 14px !important;
    height: 14px !important;
  }
  
  /* Topbar compactness */
  .topbar {
    padding: 8px 12px !important;
    top: 8px !important;
  }
  .brand .logo-box {
    width: 32px !important;
    height: 32px !important;
  }
  .brand-text .b-name {
    font-size: 13px !important;
  }
  .brand-text .b-tag {
    font-size: 8px !important;
  }
}
`;

content = content + "\n" + additionalMobileCSS;
fs.writeFileSync(p, content);
console.log("Applied ultra compact mobile text and fixed brochure icon");
