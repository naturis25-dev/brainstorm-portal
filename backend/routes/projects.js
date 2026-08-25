const express = require('express');
const router = express.Router();
const db = require('../database');
const { BUILDING_TYPES, STEEL_TYPES, CATEGORY_MAP, STOCK_IMAGES } = require('./metadata');
const { requireAdmin } = require('./auth');

function rand(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomImages() {
  const shuffled = [...STOCK_IMAGES].sort(() => Math.random() - 0.5);
  const n = 2 + Math.floor(Math.random() * 2);
  return shuffled.slice(0, n);
}

// Function to generate seed projects without client field
function generateSeedProjects() {
  const projects = [];
  let idc = 1;

  const usPick = [
    "California","Texas","New York","Florida","Illinois","Washington",
    "Massachusetts","Georgia","Ohio","Pennsylvania","Michigan","Arizona","Colorado","North Carolina"
  ];
  const caPick = ["Ontario","British Columbia","Quebec","Alberta","Manitoba","Nova Scotia"];
  const STATUSES = ["Completed","Active","In Review"];

  usPick.forEach(st => {
    const n = 10;
    for (let i = 0; i < n; i++) {
      const btype = rand(BUILDING_TYPES);
      const ptype = rand(STEEL_TYPES);
      projects.push({
        id: "p" + (idc++),
        title: `${btype} ${ptype}`,
        state: st,
        country: "US",
        type: ptype,
        category: CATEGORY_MAP[btype] || "Misc Steel",
        status: rand(STATUSES),
        year: rand([2023, 2024, 2025, 2026]),
        tons: Math.round(50 + Math.random() * 950),
        description: `Complete ${ptype.toLowerCase()} services provided for a ${btype.toLowerCase()} project including shop drawings, erection plans, and material takeoffs, ensuring accuracy and code compliance.`,
        images: randomImages(),
        video: ""
      });
    }
  });

  caPick.forEach(pr => {
    const n = 10;
    for (let i = 0; i < n; i++) {
      const btype = rand(BUILDING_TYPES);
      const ptype = rand(STEEL_TYPES);
      projects.push({
        id: "p" + (idc++),
        title: `${btype} ${ptype}`,
        state: pr,
        country: "CA",
        type: ptype,
        category: CATEGORY_MAP[btype] || "Misc Steel",
        status: rand(STATUSES),
        year: rand([2023, 2024, 2025, 2026]),
        tons: Math.round(50 + Math.random() * 950),
        description: `Complete ${ptype.toLowerCase()} services provided for a ${btype.toLowerCase()} project including shop drawings, erection plans, and material takeoffs, ensuring accuracy and code compliance.`,
        images: randomImages(),
        video: ""
      });
    }
  });

  return projects;
}

// Ensure database is seeded
try {
  const existing = db.getProjects({ limit: 1 });
  if (existing.length === 0) {
    console.log("Seeding SQLite database with initial projects...");
    const seed = generateSeedProjects();
    db.bulkInsertProjects(seed);
  }
} catch (e) {
  console.error("Error checking/seeding DB:", e.message);
}

// GET /api/projects - list or filter projects
router.get('/', (req, res) => {
  try {
    const filters = {
      country: req.query.country,
      state: req.query.state,
      category: req.query.category,
      search: req.query.search,
      limit: req.query.limit,
      offset: req.query.offset
    };
    
    const projects = db.getProjects(filters);
    res.json({
      total: db.countProjects(filters),
      limit: Math.min(Math.max(parseInt(req.query.limit, 10) || 500, 1), 1000),
      offset: Math.max(parseInt(req.query.offset, 10) || 0, 0),
      projects: projects
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// GET /api/projects/:id - single project
router.get('/:id', (req, res) => {
  try {
    const project = db.getProjectById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.json(project);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// POST /api/projects - create new project
router.post('/', requireAdmin, (req, res) => {
  const newProject = req.body;

  if (!newProject.title || !newProject.state || !newProject.country) {
    return res.status(400).json({ message: "Title, state, and country are required fields." });
  }

  newProject.id = newProject.id || "p" + Date.now();
  newProject.tons = Number(newProject.tons) || 0;
  newProject.images = Array.isArray(newProject.images) ? newProject.images : (newProject.images ? [newProject.images] : randomImages());
  
  try {
    const inserted = db.insertProject(newProject);
    res.status(201).json({ message: "Project created successfully", project: inserted });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// POST /api/projects/bulk - bulk upload projects
router.post('/bulk', requireAdmin, (req, res) => {
  const projects = req.body.projects;
  if (!Array.isArray(projects)) {
    return res.status(400).json({ message: "projects must be an array" });
  }

  try {
    const insertedCount = db.bulkInsertProjects(projects);
    res.status(201).json({ message: `Successfully inserted ${insertedCount} projects` });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// PUT /api/projects/:id - update project
router.put('/:id', requireAdmin, (req, res) => {
  try {
    const success = db.updateProject(req.params.id, req.body);
    if (!success) {
      return res.status(404).json({ message: "Project not found or no changes made" });
    }
    const updated = db.getProjectById(req.params.id);
    res.json({ message: "Project updated successfully", project: updated });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// DELETE /api/projects/:id - delete project
router.delete('/:id', requireAdmin, (req, res) => {
  try {
    const success = db.deleteProject(req.params.id);
    if (!success) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.json({ message: "Project deleted successfully" });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;
