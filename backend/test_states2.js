const db = require('better-sqlite3')('data/projects.db');
const rows = db.prepare('SELECT DISTINCT country, state FROM projects WHERE is_deleted=0').all();
console.log(rows);
