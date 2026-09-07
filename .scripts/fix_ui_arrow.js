const fs = require('fs');
let p = 'frontend/css/style.css';
let content = fs.readFileSync(p, 'utf8');

const additionalCSS = `
.proj-card.premium-card .pc-arrow {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  background: var(--accent-soft) !important;
  color: var(--accent) !important;
  transition: all 0.2s ease !important;
}
.proj-card.premium-card:hover .pc-arrow {
  background: var(--accent) !important;
  color: #fff !important;
  transform: translateX(0) scale(1.1) !important;
}
.proj-card.premium-card .pc-content {
  padding-bottom: 24px !important;
}
`;
content = content + "\n" + additionalCSS;
fs.writeFileSync(p, content);
console.log("Appended additional arrow CSS");
