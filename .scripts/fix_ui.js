const fs = require('fs');
let p = 'frontend/css/style.css';
let content = fs.readFileSync(p, 'utf8');

// Inject the new Grid layout for #projectListContainer
const gridCSS = `
#projectListContainer {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  padding: 10px 0;
}
`;
content = content + "\n" + gridCSS;

// Let's replace the .premium-card !important styles
content = content.replace(/display:\s*flex\s*!important;/g, "display: flex !important; flex-direction: column !important; align-items: flex-start !important; padding: 0 !important; overflow: hidden !important;");
content = content.replace(/width:\s*80px\s*!important;\s*height:\s*80px\s*!important;/g, "width: 100% !important; height: 160px !important; border-radius: 0 !important; margin-bottom: -4px !important;");
content = content.replace(/width:\s*80px;\s*height:\s*80px;\s*border-radius:\s*12px;/g, "width: 100%; height: 160px; border-radius: 0;");

content = content.replace(/\.premium-card \{/g, ".premium-card { flex-direction: column !important; align-items: stretch !important; padding: 0 !important; overflow: hidden !important;");

const pcContentCSS = `
.pc-content {
  padding: 16px !important;
  width: 100%;
}
.pc-arrow {
  position: absolute;
  bottom: 16px;
  right: 16px;
}
.premium-card {
  position: relative;
}
`;
content = content + "\n" + pcContentCSS;

fs.writeFileSync(p, content);
console.log("Updated to grid layout");
