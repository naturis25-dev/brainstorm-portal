const fs = require('fs');
const p = 'backend/database.js';
let content = fs.readFileSync(p, 'utf8');

const oldFunc = `const insertProject = (project) => {
  const stmt = db.prepare(\`
    INSERT INTO projects (id, title, country, state, category, type, tons, status, images, video, year, description, modelUrl, isKeyProject, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  \`);
  
  stmt.run(
    project.id || Date.now().toString(),`;

const newFunc = `const insertProject = (project) => {
  project.id = project.id || Date.now().toString();
  const stmt = db.prepare(\`
    INSERT INTO projects (id, title, country, state, category, type, tons, status, images, video, year, description, modelUrl, isKeyProject, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  \`);
  
  stmt.run(
    project.id,`;

content = content.replace(/const insertProject = \(project\) => \{[\s\S]*?stmt\.run\([\s\S]*?project\.id \|\| Date\.now\(\)\.toString\(\),/, newFunc);
fs.writeFileSync(p, content);
console.log("Patched!");
