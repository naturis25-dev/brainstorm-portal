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

  
  CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    admin_email TEXT NOT NULL,
    action TEXT NOT NULL,
    target_id TEXT,
    details TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

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
try { db.exec("ALTER TABLE projects ADD COLUMN isKeyProject INTEGER DEFAULT 0"); } catch (e) {}

// Enterprise Architecture Upgrades (Phase 2 Prep)
try { db.exec("ALTER TABLE projects ADD COLUMN is_deleted INTEGER DEFAULT 0"); } catch (e) {}
try { db.exec("ALTER TABLE projects ADD COLUMN created_by TEXT DEFAULT 'System'"); } catch (e) {}
try { db.exec("ALTER TABLE projects ADD COLUMN updated_by TEXT"); } catch (e) {}
try { db.exec("ALTER TABLE projects ADD COLUMN deleted_by TEXT"); } catch (e) {}
try { db.exec("ALTER TABLE projects ADD COLUMN deleted_at TEXT"); } catch (e) {}
try { db.exec("ALTER TABLE admins ADD COLUMN role TEXT DEFAULT 'MANAGER'"); } catch (e) {} // SUPER_ADMIN or MANAGER
try { db.exec("ALTER TABLE projects ADD COLUMN version INTEGER DEFAULT 1"); } catch (e) {}

// Seed projects from projects_100.json if database is currently empty
try {
  const countRow = db.prepare('SELECT COUNT(*) as cnt FROM projects').get();
  if (!countRow || countRow.cnt === 0) {
    const seedPath = path.join(__dirname, '../frontend/assets/data/projects_100.json');
    if (fs.existsSync(seedPath)) {
      const rawSeed = fs.readFileSync(seedPath, 'utf8');
      const seedList = JSON.parse(rawSeed);
      if (Array.isArray(seedList) && seedList.length > 0) {
        const insertStmt = db.prepare(`
          INSERT OR REPLACE INTO projects (id, title, country, state, category, type, tons, status, images, video, year, description, modelUrl, isKeyProject, is_deleted)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
        `);
        const insertTx = db.transaction((items) => {
          for (const item of items) {
            let imgVal = item.images;
            if (Array.isArray(imgVal)) imgVal = JSON.stringify(imgVal);
            insertStmt.run(
              item.id || String(Date.now() + Math.random()),
              item.title || 'Untitled Project',
              (item.country || 'US').toUpperCase(),
              item.state || '',
              item.category || 'Commercial',
              item.type || '',
              item.tons || 0,
              item.status || 'Active',
              imgVal || '[]',
              item.video || '',
              item.year || null,
              item.description || '',
              item.modelUrl || '',
              item.isKeyProject ? 1 : 0
            );
          }
        });
        insertTx(seedList);
        console.log(`[DB Seed] Auto-seeded ${seedList.length} projects into SQLite database.`);
      }
    }
  } else {
    // Bring any soft-deleted seed rows back if deleted
    db.prepare('UPDATE projects SET is_deleted = 0 WHERE is_deleted = 1').run();
    console.log('[DB Seed] Restored project records.');
  }
} catch (seedErr) {
  console.error('[DB Seed] Warning: Auto-seed failed:', seedErr);
}

// ----------------------------------------------------
// Database Operations
// ----------------------------------------------------

const getProjects = (filters = {}) => {
  let query = 'SELECT * FROM projects WHERE is_deleted = 0';
  const params = [];

  if (filters.country) {
    query += ' AND country = ?';
    params.push(filters.country.toUpperCase());
  }
  if (filters.state) {
    query += ' AND state = ?';
    params.push(filters.state);
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

  // Handle sorting
  if (filters.sort === 'tonnage') {
    query += ' ORDER BY tons DESC';
  } else if (filters.sort === 'year') {
    query += ' ORDER BY CAST(year AS INTEGER) DESC';
  } else if (filters.sort === 'title') {
    query += ' ORDER BY title ASC';
  } else if (filters.sort === 'key') {
    query += ' ORDER BY isKeyProject DESC, tons DESC';
  } else {
    query += ' ORDER BY createdAt DESC';
  }
  
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
  let query = 'SELECT COUNT(*) AS count FROM projects WHERE is_deleted = 0';
  const params = [];
  if (filters.country) { query += ' AND country = ?'; params.push(filters.country.toUpperCase()); }
  if (filters.category && filters.category !== 'All') { query += ' AND category = ?'; params.push(filters.category); }
  if (filters.search) { query += ' AND (LOWER(title) LIKE ? OR LOWER(state) LIKE ? OR LOWER(type) LIKE ?)'; const search = `%${filters.search.toLowerCase()}%`; params.push(search, search, search); }
  return db.prepare(query).get(params).count;
};

const getProjectStats = (filters = {}) => {
  let query = 'SELECT state, COUNT(*) as count, SUM(tons) as tons FROM projects WHERE is_deleted = 0';
  const params = [];
  if (filters.country) { query += ' AND country = ?'; params.push(filters.country.toUpperCase()); }
  if (filters.category && filters.category !== 'All') { query += ' AND category = ?'; params.push(filters.category); }
  query += ' GROUP BY state';
  
  const rows = db.prepare(query).all(params);
  
  let totalProjects = 0;
  let totalTons = 0;
  const regions = {};
  
  rows.forEach(r => {
    totalProjects += r.count;
    totalTons += r.tons;
    regions[r.state] = { count: r.count, tons: r.tons };
  });
  
  return {
    totalProjects,
    totalTons,
    statesCovered: rows.length,
    regions
  };
};

const getProjectById = (id) => {
  const row = db.prepare('SELECT * FROM projects WHERE id = ? AND is_deleted = 0').get(id);
  if (row) {
    row.images = parseImages(row.images);
  }
  return row;
};

const insertProject = (project) => {
  project.id = project.id || Date.now().toString();
  const stmt = db.prepare(`
    INSERT INTO projects (id, title, country, state, category, type, tons, status, images, video, year, description, modelUrl, isKeyProject, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(
    project.id,
    project.title,
    project.country.toUpperCase(),
    project.state,
    project.category,
    project.type || '',
    project.tons || 0,
    project.status || 'Draft',
    JSON.stringify(project.images || []),
    project.video || '',
    project.year || null,
    project.description || '',
    project.modelUrl || null,
    project.isKeyProject ? 1 : 0,
    project.created_by || 'System'
  );
  return project;
};

const updateProject = (id, updates) => {
  const allowedFields = ['title', 'country', 'state', 'category', 'type', 'tons', 'status', 'video', 'year', 'description', 'modelUrl', 'isKeyProject', 'updated_by'];
  let query = 'UPDATE projects SET ';
  const params = [];
  
  const sets = [];
  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      sets.push(`${field} = ?`);
      if (field === 'country') {
        params.push(updates[field].toUpperCase());
      } else if (field === 'isKeyProject') {
        params.push(updates[field] ? 1 : 0);
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

  // Increment version safely
  sets.push('version = version + 1');

  // Must match both ID and current version
  query += sets.join(', ') + ' WHERE id = ? AND version = ? AND is_deleted = 0';
  params.push(id);
  
  // Default to version 1 if frontend doesn't supply it (for backwards compatibility/seeds)
  const currentVersion = updates.version !== undefined ? parseInt(updates.version, 10) : 1;
  params.push(currentVersion);
  
  const info = db.prepare(query).run(params);
  
  if (info.changes === 0) {
    // Check if the project exists at all
    const exists = db.prepare('SELECT id FROM projects WHERE id = ? AND is_deleted = 0').get(id);
    if (exists) {
      throw new Error('CONCURRENCY_CONFLICT');
    }
    return false; // Project not found
  }
  return true;
};

const deleteProject = (id, username) => {
  // Soft Delete implementation
  const now = new Date().toISOString();
  const info = db.prepare('UPDATE projects SET is_deleted = 1, deleted_by = ?, deleted_at = ? WHERE id = ?').run(username || 'System', now, id);
  return info.changes > 0;
};

// Bulk insert using transaction for extreme performance (can easily handle 4,000+ records in ms)
const bulkInsertProjects = (projects) => {
  const insert = db.prepare(`
    INSERT OR REPLACE INTO projects (id, title, country, state, category, type, tons, status, images, video, year, description, modelUrl, isKeyProject, is_deleted)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
  `);
  
  const insertMany = db.transaction((projs) => {
    let count = 0;
    for (const p of projs) {
      let imgVal = p.images;
      if (Array.isArray(imgVal)) imgVal = JSON.stringify(imgVal);
      else if (typeof imgVal !== 'string') imgVal = '[]';

      insert.run(
        p.id || `${Date.now()}-${count}-${Math.random().toString(36).substr(2, 4)}`,
        p.title || 'Untitled Project',
        (p.country || 'US').toUpperCase(),
        p.state || '',
        p.category || 'Commercial',
        p.type || '',
        p.tons || 0,
        p.status || 'Active',
        imgVal,
        p.video || '',
        p.year || null,
        p.description || '',
        p.modelUrl || p.model_url || '',
        p.isKeyProject ? 1 : 0
      );
      count++;
    }
    return count;
  });
  
  return insertMany(projects);
};

const clearAllProjects = () => {
  db.prepare('DELETE FROM projects').run();
  return true;
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


const insertAuditLog = (admin_email, action, target_id, details) => {
  const stmt = db.prepare('INSERT INTO audit_logs (admin_email, action, target_id, details) VALUES (?, ?, ?, ?)');
  stmt.run(admin_email, action, target_id, details ? JSON.stringify(details) : null);
};

const getAuditLogs = (limit = 100) => {
  return db.prepare('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT ?').all(limit).map(l => {
    if (l.details) { try { l.details = JSON.parse(l.details); } catch(e){} }
    return l;
  });
};

const getProjectsCount = () => { return db.prepare("SELECT COUNT(*) as count FROM projects WHERE is_deleted = 0").get().count; };
module.exports = {
  getProjectsCount,
  insertAuditLog,
  getAuditLogs,
  getProjects,
  countProjects,
  getProjectById,
  insertProject,
  updateProject,
  deleteProject,
  parseImages,
  getProjectStats,
  bulkInsertProjects,
  clearAllProjects,
  getSecondaryAdmin,
  insertSecondaryAdmin,
  getAllSecondaryAdmins,
  deleteSecondaryAdmin
};
