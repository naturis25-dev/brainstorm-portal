const fs = require('fs');
const p = 'backend/routes/projects.js';
let content = fs.readFileSync(p, 'utf8');

content = content.replace(
  "const filters = { country: req.query.country, state: req.query.state, category: req.query.category, sort: req.query.sort };",
  "const filters = { country: req.query.country, state: req.query.state, category: req.query.category, sort: req.query.sort, search: req.query.search };"
);

fs.writeFileSync(p, content);
console.log("Passed search query parameter to projects router!");
