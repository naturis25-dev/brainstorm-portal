const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = process.env.DATA_DIR ? path.join(process.env.DATA_DIR, 'projects.db') : path.join(__dirname, 'data', 'projects.db');

// Ensure data directory exists
if (!fs.existsSync(path.dirname(dbPath))) {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
}

const db = new Database(dbPath);
db.pragma('journal_mode = WAL'); // Better performance

// Initialize schema (NO client field)
db.exec(`
  CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    country TEXT NOT NULL,
    state TEXT NOT NULL,
    category TEXT NOT NULL,
    type TEXT,
    tons INTEGER,
    status TEXT,
    images TEXT, -- JSON string array
    video TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  
  CREATE INDEX IF NOT EXISTS idx_country_state ON projects(country, state);
  CREATE INDEX IF NOT EXISTS idx_category ON projects(category);
  CREATE INDEX IF NOT EXISTS idx_created_at ON projects(createdAt DESC);

  CREATE TABLE IF NOT EXISTS admins (
    username TEXT PRIMARY KEY,
    passwordHash TEXT NOT NULL,
    salt TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Simple schema migration for added columns
try { db.exec("ALTER TABLE projects ADD COLUMN year INTEGER"); } catch (e) {}
try { db.exec("ALTER TABLE projects ADD COLUMN description TEXT"); } catch (e) {}
try { db.exec("ALTER TABLE projects ADD COLUMN modelUrl TEXT"); } catch (e) {}

// ----------------------------------------------------
// Database Operations
// ----------------------------------------------------

const getProjects = (filters = {}) => {
  let query = 'SELECT * FROM projects WHERE 1=1';
  const params = [];

  if (filters.country) {
    query += ' AND country = ?';
    params.push(filters.country.toUpperCase());
  }
  if (filters.category && filters.category !== 'All') {
    query += ' AND category = ?';
    params.push(filters.category);
  }
  if (filters.search) {
    query += ' AND (LOWER(title) LIKE ? OR LOWER(state) LIKE ? OR LOWER(type) LIKE ?)';
    const search = `%${filters.search.toLowerCase()}%`;
    params.push(search, search, search);
  }

  query += ' ORDER BY createdAt DESC';
  
  // Always bound reads so a large portfolio cannot create an unbounded response.
  const limit = Math.min(Math.max(parseInt(filters.limit, 10) || 500, 1), 1000);
  query += ' LIMIT ? OFFSET ?';
  params.push(limit, Math.max(parseInt(filters.offset, 10) || 0, 0));

  const rows = db.prepare(query).all(params);
  
  // Parse JSON for images
  return rows.map(row => ({
    ...row,
    images: parseImages(row.images)
  }));
};

const parseImages = (value) => {
  if (!value) return [];
  try { return Array.isArray(JSON.parse(value)) ? JSON.parse(value) : []; } catch (error) { return []; }
};

const countProjects = (filters = {}) => {
  let query = 'SELECT COUNT(*) AS count FROM projects WHERE 1=1';
  const params = [];
  if (filters.country) { query += ' AND country = ?'; params.push(filters.country.toUpperCase()); }
  if (filters.category && filters.category !== 'All') { query += ' AND category = ?'; params.push(filters.category); }
  if (filters.search) { query += ' AND (LOWER(title) LIKE ? OR LOWER(state) LIKE ? OR LOWER(type) LIKE ?)'; const search = `%${filters.search.toLowerCase()}%`; params.push(search, search, search); }
  return db.prepare(query).get(params).count;
};

const getProjectById = (id) => {
  const row = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
  if (row) {
    row.images = parseImages(row.images);
  }
  return row;
};

const insertProject = (project) => {
  const stmt = db.prepare(`
    INSERT INTO projects (id, title, country, state, category, type, tons, status, images, video, year, description, modelUrl)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(
    project.id || Date.now().toString(),
    project.title,
    project.country.toUpperCase(),
    project.state,
    project.category,
    project.type || '',
    project.tons || 0,
    project.status || 'Active',
    JSON.stringify(project.images || []),
    project.video || '',
    project.year || null,
    project.description || '',
    project.modelUrl || null
  );
  return project;
};

const updateProject = (id, updates) => {
  const allowedFields = ['title', 'country', 'state', 'category', 'type', 'tons', 'status', 'video', 'year', 'description', 'modelUrl'];
  let query = 'UPDATE projects SET ';
  const params = [];
  
  const sets = [];
  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      sets.push(`${field} = ?`);
      if (field === 'country') {
        params.push(updates[field].toUpperCase());
      } else {
        params.push(updates[field]);
      }
    }
  }
  
  if (updates.images !== undefined) {
    sets.push('images = ?');
    params.push(JSON.stringify(updates.images));
  }

  if (sets.length === 0) return false;

  query += sets.join(', ') + ' WHERE id = ?';
  params.push(id);
  
  const info = db.prepare(query).run(params);
  return info.changes > 0;
};

const deleteProject = (id) => {
  const info = db.prepare('DELETE FROM projects WHERE id = ?').run(id);
  return info.changes > 0;
};

// Bulk insert using transaction for extreme performance (can easily handle 4,000+ records in ms)
const bulkInsertProjects = (projects) => {
  const insert = db.prepare(`
    INSERT OR REPLACE INTO projects (id, title, country, state, category, type, tons, status, images, video, year, description)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  const insertMany = db.transaction((projs) => {
    let count = 0;
    for (const p of projs) {
      insert.run(
        p.id || `${Date.now()}-${count}`,
        p.title || 'Untitled',
        (p.country || 'US').toUpperCase(),
        p.state || '',
        p.category || 'Structural',
        p.type || '',
        p.tons || 0,
        p.status || 'Active',
        JSON.stringify(p.images || []),
        p.video || '',
        p.year || null,
        p.description || ''
      );
      count++;
    }
    return count;
  });
  
  return insertMany(projects);
};

const getSecondaryAdmin = (username) => {
  return db.prepare('SELECT * FROM admins WHERE username = ?').get(username);
};

const insertSecondaryAdmin = (username, passwordHash, salt) => {
  const stmt = db.prepare('INSERT INTO admins (username, passwordHash, salt) VALUES (?, ?, ?)');
  stmt.run(username, passwordHash, salt);
  return { username };
};

const getAllSecondaryAdmins = () => {
  return db.prepare('SELECT username, createdAt FROM admins ORDER BY createdAt DESC').all();
};

const deleteSecondaryAdmin = (username) => {
  const info = db.prepare('DELETE FROM admins WHERE username = ?').run(username);
  return info.changes > 0;
};

module.exports = {
  getProjects,
  countProjects,
  getProjectById,
  insertProject,
  updateProject,
  deleteProject,
  bulkInsertProjects,
  getSecondaryAdmin,
  insertSecondaryAdmin,
  getAllSecondaryAdmins,
  deleteSecondaryAdmin
};
