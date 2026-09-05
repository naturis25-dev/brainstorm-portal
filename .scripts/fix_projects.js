const fs = require('fs');
const p = 'backend/routes/projects.js';
let content = fs.readFileSync(p, 'utf8');

content = content.replace(
  "res.status(201).json({ message: 'Created', id: inserted.id });",
  "res.status(201).json({ message: 'Project created successfully', project: inserted });"
);

// We need to fetch the updated project for PUT
// const success = await db.updateProject(req.params.id, updates);
// if (success) res.json({ message: 'Updated' });
const updatedBlock = `const success = await db.updateProject(req.params.id, updates);
    if (success) {
      const updated = await db.getProjectById(req.params.id);
      res.json({ message: 'Project updated successfully', project: updated });
    } else res.status(404).json({ message: 'Not found' });`;

content = content.replace(
  /const success = await db\.updateProject\(req\.params\.id, updates\);\s*if \(success\) res\.json\(\{ message: 'Updated' \}\);\s*else res\.status\(404\)\.json\(\{ message: 'Not found' \}\);/,
  updatedBlock
);

fs.writeFileSync(p, content);
console.log("Restored project JSON payloads!");
