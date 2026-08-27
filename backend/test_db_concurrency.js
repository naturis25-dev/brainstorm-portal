const db = require('./database.js');

console.log("--- Starting DB Concurrency Test ---");

const myId = 'test-proj-' + Date.now();
const proj = db.insertProject({
  id: myId,
  title: 'DB Concurrency Test',
  country: 'US',
  state: 'Texas',
  category: 'Industrial',
  type: 'Test',
  tons: 100,
  year: 2024
});

console.log(`Created project ${myId}`);

const p1 = db.getProjectById(myId);
const initialVersion = p1.version || 1;
console.log(`Initial version: ${initialVersion}`);

console.log("Manager B updating...");
const successB = db.updateProject(myId, { title: 'Title edited by B', updated_by: 'managerB', version: initialVersion });
console.log(`Manager B success: ${successB}`);

console.log("Manager A updating...");
try {
  const successA = db.updateProject(myId, { title: 'Title edited by A', updated_by: 'managerA', version: initialVersion });
  console.log(`Manager A success: ${successA}`);
} catch (e) {
  console.log(`Manager A Error: ${e.message}`);
}

const pFinal = db.getProjectById(myId);
console.log(`Final Title: ${pFinal.title}`);
console.log(`Final Updated By: ${pFinal.updated_by}`);
console.log(`Final Version: ${pFinal.version}`);

if (pFinal.title === 'Title edited by B' && pFinal.version === initialVersion + 1) {
  console.log('? TEST PASSED: Concurrency prevented Manager A from overwriting Manager B.');
} else {
  console.log('? TEST FAILED.');
}
