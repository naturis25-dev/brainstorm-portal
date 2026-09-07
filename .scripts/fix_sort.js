const fs = require('fs');
const p = 'backend/database.pg.js';
let content = fs.readFileSync(p, 'utf8');

content = content.replace("filters.sort === 'alphabetical'", "filters.sort === 'title'");
content = content.replace("filters.sort === 'tons'", "filters.sort === 'tonnage'");

fs.writeFileSync(p, content);
console.log("Fixed sorting keys in database.pg.js!");
