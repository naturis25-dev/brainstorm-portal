const fs = require('fs');
let p = 'backend/database.pg.js';
let content = fs.readFileSync(p, 'utf8');

const targetQuery = "let query = 'SELECT * FROM projects WHERE is_deleted = 0';";
const replacementQuery = "let query = filters.lite ? 'SELECT id, title, country, state, category, type, tons, status, video, created_at, year, model_url, is_key_project, is_deleted, created_by, updated_by FROM projects WHERE is_deleted = 0' : 'SELECT * FROM projects WHERE is_deleted = 0';";

content = content.replace(targetQuery, replacementQuery);
fs.writeFileSync(p, content);
console.log("Updated getProjects in database.pg.js");
