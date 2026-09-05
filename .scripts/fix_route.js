const fs = require('fs');
let p = 'backend/routes/projects.js';
let content = fs.readFileSync(p, 'utf8');

const target = "if (req.query.limit) filters.limit = parseInt(req.query.limit, 10);";
const replacement = "if (req.query.limit) filters.limit = parseInt(req.query.limit, 10);\n    if (req.query.lite === 'true') filters.lite = true;";

content = content.replace(target, replacement);
fs.writeFileSync(p, content);
console.log("Updated projects router");
