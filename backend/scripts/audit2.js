const Database = require('better-sqlite3');
const path = require('path');
const sdb = new Database(path.join(__dirname, '..', 'data', 'projects.db'));

const day8 = sdb.prepare("SELECT COUNT(*) as c FROM projects WHERE substr(createdAt, 1, 10) = '2026-08-08'").get().c;
console.log(`Original projects from Aug 8: ${day8}`);

const day26 = sdb.prepare("SELECT * FROM projects WHERE substr(createdAt, 1, 10) = '2026-08-26'").all();
console.log(`Projects created today (Aug 26): ${day26.length}`);
console.log("\nSample of today's projects:");
day26.slice(0, 5).forEach(p => console.log(`ID: ${p.id}, Title: ${p.title}, created_by: ${p.created_by}`));

// Are all the 4300 test projects named something specific?
const synthPattern = day26.filter(p => p.id.startsWith('mock_') || p.title.startsWith('Test') || p.title.startsWith('Project '));
console.log(`\nDay 26 projects matching 'mock_' / 'Test' / 'Project ': ${synthPattern.length}`);
if (synthPattern.length > 0) {
    console.log("Sample of synth pattern:");
    synthPattern.slice(0, 3).forEach(p => console.log(p.title));
}
