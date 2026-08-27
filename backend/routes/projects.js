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
