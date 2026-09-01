const fs = require('fs');
let p = 'frontend/css/style.css';
let content = fs.readFileSync(p, 'utf8');

const css = `
#map {
  transition: opacity 0.25s ease !important;
}
#map.fade-out {
  opacity: 0 !important;
}
`;

content = content + "\n" + css;
fs.writeFileSync(p, content);
console.log("Added fade-out CSS to map");
