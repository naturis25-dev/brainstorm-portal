const fs = require('fs');
let p = 'frontend/css/style.css';
let content = fs.readFileSync(p, 'utf8');

const additionalMobileCSS = `
@media (max-width: 768px) {
  /* Reduce Hero Text Size */
  .map-hero .page-title {
    font-size: 28px !important;
    margin-bottom: 12px !important;
  }
  .map-hero .hero-desc {
    font-size: 13px !important;
    line-height: 1.5 !important;
    max-width: 100% !important;
  }
  
  /* Increase map size */
  .map-card {
    margin: 0 !important;
    padding: 0 !important;
    border-radius: 0 !important;
    border-left: none !important;
    border-right: none !important;
  }
  svg#map {
    transform: scale(1.1) !important;
    transform-origin: center center !important;
    margin-top: 5px !important;
  }

  /* Move Day/Night toggle near floating search */
  #dntToggle {
    position: fixed !important;
    bottom: 24px !important;
    right: 24px !important;
    width: 56px !important;
    height: 56px !important;
    border-radius: 100px !important;
    background: var(--gray-50, #fff) !important;
    box-shadow: 0 16px 40px rgba(0,0,0,0.2) !important;
    z-index: 100 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    margin: 0 !important;
    border: 1.5px solid var(--line) !important;
  }
  body.dark-mode #dntToggle {
    background: var(--card-bg) !important;
    box-shadow: 0 16px 40px rgba(0,0,0,0.5) !important;
  }
  
  /* Make room for toggle */
  .inline-search-wrap {
    right: 92px !important;
  }
}
`;

content = content + "\n" + additionalMobileCSS;
fs.writeFileSync(p, content);
console.log("Applied mobile styling updates");
