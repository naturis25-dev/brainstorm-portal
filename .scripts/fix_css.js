const fs = require('fs');
const p = 'frontend/css/style.css';
let content = fs.readFileSync(p, 'utf8');

content = content.replace(
  "#categoryChipRow {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 8px;\n  align-items: center;\n}",
  "#categoryChipRow {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 8px;\n  align-items: center;\n  justify-content: center;\n}"
);

fs.writeFileSync(p, content);
console.log("Updated CSS to ensure center alignment");
