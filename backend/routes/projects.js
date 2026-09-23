const express = require('express');
const db = require('../db.js');
const { requireAuth } = require('./auth');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const filters = { country: req.query.country, state: req.query.state, category: req.query.category, sort: req.query.sort, search: req.query.search };
    if (req.query.limit) filters.limit = parseInt(req.query.limit, 10);
    if (req.query.lite === 'true') filters.lite = true;
    if (req.query.offset) filters.offset = parseInt(req.query.offset, 10);

    const projects = await db.getProjects(filters);
    const totalCount = await db.countProjects(filters);
    res.json({ data: projects, total: totalCount, limit: filters.limit || null, offset: filters.offset || null });
  } catch (e) { console.error(e); res.status(500).json({ message: 'Error' }); }
});

router.get('/stats', async (req, res) => {
  try { res.json(await db.getProjectStats({ country: req.query.country, category: req.query.category })); }
  catch (e) { console.error(e); res.status(500).json({ message: 'Error' }); }
});

const path = require('path');
const fs = require('fs');

router.get('/export', requireAuth, async (req, res) => {
  try {
    const allProjects = await db.getProjects({ limit: 100000 });
    let sampleDrawings = null;
    const drawingsPath = path.join(__dirname, '../../frontend/drawings_data.json');
    if (fs.existsSync(drawingsPath)) {
      try {
        sampleDrawings = JSON.parse(fs.readFileSync(drawingsPath, 'utf8'));
      } catch(e){}
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="atlas_complete_backup_${new Date().toISOString().split('T')[0]}.json"`);
    res.json({
      backupVersion: "2.0",
      exportedAt: new Date().toISOString(),
      exportedBy: req.admin ? req.admin.username : 'Admin',
      totalProjects: allProjects.length,
      projects: allProjects,
      sampleDrawings: sampleDrawings
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Export failed: ' + e.message });
  }
});

router.post('/import', requireAuth, async (req, res) => {
  try {
    let list = req.body.projects || req.body.data || (Array.isArray(req.body) ? req.body : null);
    let sampleDrawings = req.body.sampleDrawings || req.body.drawings || null;

    let importedCount = 0;
    if (Array.isArray(list) && list.length > 0) {
      importedCount = await db.bulkInsertProjects(list);
    }

    if (sampleDrawings && typeof sampleDrawings === 'object') {
      const drawingsPath = path.join(__dirname, '../../frontend/drawings_data.json');
      fs.writeFileSync(drawingsPath, JSON.stringify(sampleDrawings, null, 2));
    }

    try {
      if (req.admin && db.insertAuditLog) {
        await db.insertAuditLog(req.admin.username, 'IMPORT_BACKUP', null, { 
          projectsCount: importedCount, 
          restoredDrawings: !!sampleDrawings 
        });
      }
    } catch(e){}

    res.json({ 
      success: true, 
      message: `Successfully imported & restored ${importedCount} projects${sampleDrawings ? ' and all sample drawings' : ''}!`, 
      count: importedCount,
      restoredDrawings: !!sampleDrawings
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Import failed: ' + e.message });
  }
});

router.post('/clear-all', requireAuth, async (req, res) => {
  try {
    if (db.clearAllProjects) {
      await db.clearAllProjects();
    }
    try {
      if (req.admin && db.insertAuditLog) {
        await db.insertAuditLog(req.admin.username, 'CLEAR_ALL_PROJECTS', null, { clearedAt: new Date().toISOString() });
      }
    } catch(e){}
    res.json({ success: true, message: 'All project records have been cleared.' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to clear projects: ' + e.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const project = await db.getProjectById(req.params.id);
    if (project) res.json(project);
    else res.status(404).json({ message: 'Not found' });
  } catch (e) { console.error(e); res.status(500).json({ message: 'Error' }); }
});

router.post('/', requireAuth, async (req, res) => {
  const newProject = req.body;
  if (!newProject.title || !newProject.country || !newProject.state || !newProject.category) return res.status(400).json({ message: 'Missing fields' });
  newProject.created_by = req.admin.username;
  try {
    const inserted = await db.insertProject(newProject);
    try { await db.insertAuditLog(req.admin.username, 'CREATE_PROJECT', inserted.id, { title: newProject.title }); } catch(e){}
    res.status(201).json({ message: 'Project created successfully', project: inserted });
  } catch (e) { console.error(e); res.status(500).json({ message: 'Error' }); }
});

router.post('/bulk', requireAuth, async (req, res) => {
  if (!Array.isArray(req.body.projects)) return res.status(400).json({ message: 'Invalid payload' });
  try {
    await db.bulkInsertProjects(req.body.projects);
    res.json({ message: 'Imported' });
  } catch (e) { console.error(e); res.status(500).json({ message: 'Error' }); }
});

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const updates = req.body;
    updates.updated_by = req.admin.username;
    const success = await db.updateProject(req.params.id, updates);
    if (success) {
      const updated = await db.getProjectById(req.params.id);
      res.json({ message: 'Project updated successfully', project: updated });
    } else res.status(404).json({ message: 'Not found' });
  } catch (e) {
    if (e.message === 'CONCURRENCY_CONFLICT') return res.status(409).json({ message: 'Concurrency conflict' });
    console.error(e); res.status(500).json({ message: 'Error' });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const success = await db.deleteProject(req.params.id, req.admin.username);
    if (success) res.json({ message: 'Deleted' });
    else res.status(404).json({ message: 'Not found' });
  } catch (e) { console.error(e); res.status(500).json({ message: 'Error' }); }
});

module.exports = router;
