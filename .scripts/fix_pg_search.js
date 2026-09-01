const fs = require('fs');
const p = 'backend/database.pg.js';
let content = fs.readFileSync(p, 'utf8');

const regex = /if \(filters\.category && filters\.category !== 'All'\) \{[\s\S]*?params\.push\(filters\.category\);\s*\}/;

const searchSupport = `if (filters.category && filters.category !== 'All') {
    query += \` AND category = $\${paramIdx++}\`;
    params.push(filters.category);
  }

  if (filters.search) {
    query += \` AND (title ILIKE $\${paramIdx} OR state ILIKE $\${paramIdx} OR type ILIKE $\${paramIdx})\`;
    params.push('%' + filters.search + '%');
    paramIdx++;
  }`;

content = content.replace(regex, searchSupport);

fs.writeFileSync(p, content);
console.log("Added search support to database.pg.js!");
