const fs = require('fs');
let p = 'frontend/css/style.css';
let content = fs.readFileSync(p, 'utf8');

// The block currently looks like:
// .map-card {
//     
//     background-size: 20px 20px !important;
//     background-position: center center !important;
// }
// body.dark-mode .map-card {
//     
// }

content = content.replace(/\.map-card \{\s*background-size: 20px 20px !important;\s*background-position: center center !important;\s*\}/g, "");
content = content.replace(/body\.dark-mode \.map-card \{\s*\}/g, "");

fs.writeFileSync(p, content);
console.log("Cleaned up remaining map grid css");
