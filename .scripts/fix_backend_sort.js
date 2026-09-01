const fs = require('fs');
let p = 'backend/database.pg.js';
let content = fs.readFileSync(p, 'utf8');

content = content.replace(
  "else if (filters.sort === 'key') {\n    query += ' ORDER BY is_key_project DESC, created_at DESC';\n  } else {",
  "else if (filters.sort === 'key') {\n    query += ' ORDER BY is_key_project DESC, created_at DESC';\n  } else if (filters.sort === 'tonnage_asc') {\n    query += ' ORDER BY tons ASC, title ASC';\n  } else {"
);

fs.writeFileSync(p, content);
console.log("Updated backend sorting");
