const fs = require('fs');
let p = 'frontend/css/style.css';
let content = fs.readFileSync(p, 'utf8');

const additionalMobileCSS = `
@media (max-width: 768px) {
  /* Make CTA Banner ultra compact */
  .cta-banner {
    padding: 12px 14px !important;
    gap: 8px !important;
    margin-top: 12px !important;
    border-radius: 12px !important;
  }
  .cta-banner .cta-icon {
    width: 28px !important;
    height: 28px !important;
    border-radius: 8px !important;
  }
  .cta-banner .cta-icon svg {
    width: 14px !important;
    height: 14px !important;
  }
  .cta-banner h2 {
    font-size: 13px !important;
    margin: 0 0 2px 0 !important;
  }
  .cta-banner p {
    font-size: 10.5px !important;
    line-height: 1.3 !important;
    margin: 0 !important;
  }
  .cta-banner .cta-btn {
    padding: 6px 10px !important;
    font-size: 11px !important;
    border-radius: 6px !important;
    height: auto !important;
  }
  .cta-banner .cta-btn svg {
    width: 12px !important;
    height: 12px !important;
  }
}
`;

content = content + "\n" + additionalMobileCSS;
fs.writeFileSync(p, content);
console.log("Made CTA Banner ultra compact");
