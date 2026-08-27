const db = require('better-sqlite3')('data/projects.db');
const info = db.prepare("DELETE FROM projects WHERE title LIKE 'E2E Test%'").run();
console.log(`Deleted ${info.changes} E2E Test projects.`);
