const Database = require('better-sqlite3');
const path = require('path');
const sdb = new Database(path.join(__dirname, '..', 'data', 'projects.db'));

// Let's get a random sample of projects to see their structure
const allProjects = sdb.prepare("SELECT id, title, created_by, createdAt, description FROM projects").all();
console.log(`Total projects: ${allProjects.length}`);

// Let's look at the first 10 and last 10
console.log("\nFirst 5 projects:");
allProjects.slice(0, 5).forEach(p => console.log(JSON.stringify(p)));

console.log("\nLast 5 projects:");
allProjects.slice(-5).forEach(p => console.log(JSON.stringify(p)));

// Can we identify mock data by a specific created_by, title pattern, or ID pattern?
const synthByTitle = allProjects.filter(p => p.title.includes('Mock') || p.title.includes('Test') || p.title.match(/Project \d+/));
console.log(`\nProjects with 'Mock/Test/Project N' in title: ${synthByTitle.length}`);

const groupedByCreator = sdb.prepare("SELECT created_by, COUNT(*) as c FROM projects GROUP BY created_by").all();
console.log("\nCounts by created_by:");
console.log(groupedByCreator);

const groupedByDate = sdb.prepare("SELECT substr(createdAt, 1, 10) as date, COUNT(*) as c FROM projects GROUP BY substr(createdAt, 1, 10)").all();
console.log("\nCounts by Date (createdAt):");
console.log(groupedByDate);

