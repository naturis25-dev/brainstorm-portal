const Database = require('better-sqlite3');
const path = require('path');
const sdb = new Database(path.join(__dirname, '..', 'data', 'projects.db'));

const simCount = sdb.prepare("SELECT COUNT(*) as c FROM projects WHERE id LIKE 'sim-%' OR title LIKE 'Simulated Project%'").get().c;
console.log(`Mock Projects (ID starting with 'sim-' or Title starting with 'Simulated'): ${simCount}`);

const rest = sdb.prepare("SELECT id, title, createdAt FROM projects WHERE id NOT LIKE 'sim-%' AND title NOT LIKE 'Simulated Project%'").all();
console.log(`Genuine Projects remaining: ${rest.length}`);

console.log("\nGenuine projects breakdown by date:");
const counts = {};
rest.forEach(r => {
    const d = r.createdAt.substring(0, 10);
    counts[d] = (counts[d] || 0) + 1;
});
console.log(counts);

