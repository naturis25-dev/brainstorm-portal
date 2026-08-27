const Database = require('better-sqlite3');
const db = new Database('./data/atlas.sqlite');

const insertStmt = db.prepare(
  INSERT INTO projects (
    id, title, country, state, type, category, status, year, tons, description, isKeyProject, images, video, modelUrl, is_deleted
  ) VALUES (
    @id, @title, @country, @state, @type, @category, @status, @year, @tons, @description, @isKeyProject, @images, @video, @modelUrl, 0
  )
);

const baseStates = ['Texas', 'California', 'New York', 'Florida', 'Illinois', 'Ontario', 'British Columbia', 'Quebec'];
const baseCats = ['Industrial', 'Commercial', 'Miscellaneous', 'Healthcare'];

console.log('Counting current projects...');
const count = db.prepare('SELECT COUNT(*) as c FROM projects').get().c;
console.log('Current count:', count);

if (count < 4000) {
  console.log('Seeding up to 4500...');
  const toAdd = 4500 - count;
  db.exec('BEGIN TRANSACTION');
  for (let i = 0; i < toAdd; i++) {
    const isCA = i % 8 >= 5;
    insertStmt.run({
      id: 'sim-' + Math.random().toString(36).substr(2, 9) + '-' + i,
      title: 'Simulated Project ' + i,
      country: isCA ? 'CA' : 'US',
      state: baseStates[i % baseStates.length],
      type: 'Industrial Facility',
      category: baseCats[i % baseCats.length],
      status: 'Active',
      year: 2024 - (i % 5),
      tons: Math.floor(Math.random() * 5000) + 100,
      description: 'A simulated large-scale project.',
      isKeyProject: (i % 20 === 0) ? 1 : 0,
      images: '[]',
      video: '',
      modelUrl: ''
    });
  }
  db.exec('COMMIT');
  console.log('Seeded successfully. New count:', db.prepare('SELECT COUNT(*) as c FROM projects').get().c);
} else {
  console.log('Already over 4000 projects.');
}
