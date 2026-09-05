const fs = require('fs');
let p = 'frontend/css/style.css';
let content = fs.readFileSync(p, 'utf8');

const additionalMobileCSS = `
@media (max-width: 768px) {
  /* Reduce Brochure / Drawing Gallery Box Sizes */
  .drawing-folder-card {
    height: 180px !important;
  }
  .drawing-folder-card .flip-front-content .heading {
    font-size: 16px !important;
  }
  .drawing-folder-card .card-icon {
    width: 48px !important;
    height: 48px !important;
    margin-bottom: 8px !important;
  }
  .drawing-folder-card .card-icon svg {
    width: 24px !important;
    height: 24px !important;
  }
  .flip-front-content {
    padding: 16px !important;
    justify-content: center !important;
  }
  
  /* Reduce CTA Banner Size */
  .cta-banner {
    padding: 16px !important;
    flex-direction: column !important;
    text-align: left !important;
    align-items: flex-start !important;
    gap: 12px !important;
    margin-top: 16px !important;
  }
  .cta-banner .cta-icon {
    width: 36px !important;
    height: 36px !important;
  }
  .cta-banner h2 {
    font-size: 15px !important;
    margin: 0 0 4px 0 !important;
  }
  .cta-banner p {
    font-size: 12px !important;
    margin: 0 !important;
  }
  .cta-banner .cta-btn {
    width: 100% !important;
    justify-content: center !important;
    padding: 8px 12px !important;
    font-size: 12px !important;
  }
}
`;

content = content + "\n" + additionalMobileCSS;
fs.writeFileSync(p, content);
console.log("Applied smaller box sizes for mobile brochure view");
