const fs = require('fs');
let p = 'frontend/css/style.css';
let content = fs.readFileSync(p, 'utf8');

const mobileCSS = `
@media (max-width: 768px) {
  /* Bigger Map by reducing container padding */
  .map-card {
    padding: 10px !important;
    border-radius: 16px !important;
    margin: 10px 16px 80px 16px !important; /* bottom margin for the floating search bar */
  }

  /* Bigger Header */
  .map-hero {
    margin: 30px 20px 20px 20px !important;
  }
  .map-hero .page-title {
    font-size: 44px !important;
    line-height: 1.1 !important;
  }
  .map-hero .hero-desc {
    font-size: 16px !important;
    line-height: 1.6 !important;
  }

  /* Floating Search Bar */
  .inline-search-wrap {
    position: fixed !important;
    bottom: 24px !important;
    left: 24px !important;
    right: 24px !important;
    width: auto !important;
    height: 56px !important;
    z-index: 100 !important;
    box-shadow: 0 16px 40px rgba(0,0,0,0.2) !important;
    border-radius: 100px !important;
    background: var(--gray-50, #fff);
  }
  
  body.dark-mode .inline-search-wrap {
    background: var(--card-bg) !important;
    box-shadow: 0 16px 40px rgba(0,0,0,0.5) !important;
  }

  .inline-search-wrap input {
    height: 100% !important;
    font-size: 16px !important;
    padding-left: 48px !important;
  }

  .inline-search-wrap > svg {
    width: 22px !important;
    height: 22px !important;
    left: 16px !important;
  }

  .inline-search-wrap button {
    width: 44px !important;
    height: 44px !important;
    right: 6px !important;
  }

  .inline-search-wrap button svg {
    width: 18px !important;
    height: 18px !important;
  }
  
  /* Make category chips scrollable horizontally instead of wrapping if it's too cramped, but flex wrap is fine */
  .chip-row {
    padding-bottom: 20px; /* space for the floater */
  }
}
`;
content = content + "\n" + mobileCSS;
fs.writeFileSync(p, content);
console.log("Appended mobile CSS");
