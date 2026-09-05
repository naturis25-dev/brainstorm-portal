const Database = require('better-sqlite3');
const path = require('path');
const sdb = new Database(path.join(__dirname, '..', 'data', 'projects.db'));
const count = sdb.prepare("SELECT COUNT(*) as c FROM projects WHERE state = 'Washington'").get().c;
console.log(`SQLite Washington projects: ${count}`);
