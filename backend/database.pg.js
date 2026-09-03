const { Pool } = require('pg');


const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function initialize() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        country TEXT NOT NULL,
        state TEXT NOT NULL,
        category TEXT NOT NULL,
        type TEXT,
        tons INTEGER,
        status TEXT,
        images TEXT,
        video TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        year INTEGER,
        description TEXT,
        model_url TEXT,
        is_key_project INTEGER DEFAULT 0,
        is_deleted INTEGER DEFAULT 0,
        created_by TEXT DEFAULT 'System',
        updated_by TEXT,
        deleted_by TEXT,
        deleted_at TEXT,
        version INTEGER DEFAULT 1
      );
    `);
    
    await client.query(`CREATE INDEX IF NOT EXISTS idx_country_state ON projects(country, state);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_category ON projects(category);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_created_at ON projects(created_at DESC);`);

    await client.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        admin_email TEXT NOT NULL,
        action TEXT NOT NULL,
        target_id TEXT,
        details TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS admins (
        username TEXT PRIMARY KEY,
        password_hash TEXT NOT NULL,
        salt TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log('[DB] PostgreSQL tables successfully initialized.');
  } catch (err) {
    console.error('[DB] Failed to initialize PostgreSQL:', err);
  } finally {
    client.release();
  }
}

const parseImages = (value) => {
  if (!value) return [];
  if (typeof value === 'string') {
    try { return JSON.parse(value); } catch(e) { return []; }
  }
  return value;
};

// Map Postgres snake_case back to Node.js camelCase
const mapProject = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    country: row.country,
    state: row.state,
    category: row.category,
    type: row.type,
    tons: row.tons,
    status: row.status,
    images: parseImages(row.images),
    video: row.video,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
    year: row.year,
    description: row.description,
    modelUrl: row.model_url,
    isKeyProject: row.is_key_project,
    is_deleted: row.is_deleted,
    created_by: row.created_by,
    updated_by: row.updated_by,
    deleted_by: row.deleted_by,
    deleted_at: row.deleted_at,
    version: row.version
  };
};

const getProjects = async (filters = {}) => {
  let query = filters.lite ? 'SELECT id, title, country, state, category, type, tons, status, video, created_at, year, model_url, is_key_project, is_deleted, created_by, updated_by FROM projects WHERE is_deleted = 0' : 'SELECT * FROM projects WHERE is_deleted = 0';
  const params = [];
  let paramIdx = 1;

  if (filters.country) {
    query += ` AND country = $${paramIdx++}`;
    params.push(filters.country.toUpperCase());
  }
  if (filters.state) {
    query += ` AND state = $${paramIdx++}`;
    params.push(filters.state);
  }
  if (filters.category && filters.category !== 'All') {
    query += ` AND category = ${paramIdx++}`;
    params.push(filters.category);
  }

  if (filters.search) {
    query += ` AND (title ILIKE $${paramIdx} OR state ILIKE $${paramIdx} OR type ILIKE $${paramIdx})`;
    params.push('%' + filters.search + '%');
    paramIdx++;
  }

  // Sort
  if (filters.sort === 'title') {
    query += ' ORDER BY title ASC';
  } else if (filters.sort === 'tonnage') {
    query += ' ORDER BY tons DESC, title ASC';
  } else if (filters.sort === 'year') {
    query += ' ORDER BY year DESC, title ASC';
  } else if (filters.sort === 'key') {
    query += ' ORDER BY is_key_project DESC, created_at DESC';
  } else {
    query += ' ORDER BY created_at DESC';
  }

  if (filters.limit) {
    query += ` LIMIT $${paramIdx++}`;
    params.push(filters.limit);
  }
  if (filters.offset) {
    query += ` OFFSET $${paramIdx++}`;
    params.push(filters.offset);
  }

  const result = await pool.query(query, params);
  return result.rows.map(mapProject);
};

const getProjectStats = async (filters = {}) => {
  let query = 'SELECT state, COUNT(*) as count, SUM(tons) as tons FROM projects WHERE is_deleted = 0';
  const params = [];
  let paramIdx = 1;

  if (filters.country) {
    query += ` AND country = $${paramIdx++}`;
    params.push(filters.country.toUpperCase());
  }
  if (filters.category && filters.category !== 'All') {
    query += ` AND category = $${paramIdx++}`;
    params.push(filters.category);
  }

  query += ' GROUP BY state';
  const result = await pool.query(query, params);
  
  let totalProjects = 0;
  let totalTons = 0;
  const regions = {};
  
  result.rows.forEach(r => {
    const tonsVal = parseInt(r.tons || 0, 10);
    const countVal = parseInt(r.count || 0, 10);
    totalProjects += countVal;
    totalTons += tonsVal;
    regions[r.state] = { count: countVal, tons: tonsVal };
  });
  
  return {
    totalProjects,
    totalTons,
    statesCovered: result.rows.length,
    regions
  };
};

const countProjects = async (filters = {}) => {
  let query = 'SELECT COUNT(*) as c FROM projects WHERE is_deleted = 0';
  const params = [];
  let paramIdx = 1;
  
  if (filters.country) {
    query += ` AND country = $${paramIdx++}`;
    params.push(filters.country.toUpperCase());
  }
  if (filters.state) {
    query += ` AND state = $${paramIdx++}`;
    params.push(filters.state);
  }
  if (filters.category && filters.category !== 'All') {
    query += ` AND category = $${paramIdx++}`;
    params.push(filters.category);
  }
  
  const result = await pool.query(query, params);
  return parseInt(result.rows[0].c, 10);
};

const getProjectById = async (id) => {
  const result = await pool.query('SELECT * FROM projects WHERE id = $1 AND is_deleted = 0', [id]);
  return mapProject(result.rows[0]);
};

const insertProject = async (project) => {
  const query = `
    INSERT INTO projects (
      id, title, country, state, category, type, tons, status, images, video, year, description, model_url, is_key_project, created_by
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
    RETURNING *
  `;
  const params = [
    project.id || Date.now().toString(),
    project.title,
    project.country.toUpperCase(),
    project.state,
    project.category,
    project.type || '',
    project.tons || 0,
    project.status || 'Draft',
    JSON.stringify(project.images || []), // TEXT exactly as SQLite
    project.video || '',
    project.year || null,
    project.description || '',
    project.modelUrl || null,
    project.isKeyProject ? 1 : 0,
    project.created_by || 'System'
  ];
  
  const result = await pool.query(query, params);
  return mapProject(result.rows[0]);
};

const updateProject = async (id, updates) => {
  // Map camelCase to snake_case for DB fields
  const fieldMap = {
    title: 'title', country: 'country', state: 'state', category: 'category', 
    type: 'type', tons: 'tons', status: 'status', video: 'video', year: 'year', 
    description: 'description', modelUrl: 'model_url', isKeyProject: 'is_key_project', 
    updated_by: 'updated_by'
  };
  
  let query = 'UPDATE projects SET ';
  const params = [];
  let paramIdx = 1;
  
  const sets = [];
  for (const [jsField, dbField] of Object.entries(fieldMap)) {
    if (updates[jsField] !== undefined) {
      sets.push(`${dbField} = $${paramIdx++}`);
      if (jsField === 'country') {
        params.push(updates[jsField].toUpperCase());
      } else if (jsField === 'isKeyProject') {
        params.push(updates[jsField] ? 1 : 0);
      } else {
        params.push(updates[jsField]);
      }
    }
  }
  
  if (updates.images !== undefined) {
    sets.push(`images = $${paramIdx++}`);
    params.push(JSON.stringify(updates.images));
  }

  if (sets.length === 0) return false;

  sets.push(`version = version + 1`);
  
  query += sets.join(', ') + ` WHERE id = $${paramIdx++} AND version = $${paramIdx++} AND is_deleted = 0`;
  params.push(id);
  const currentVersion = updates.version !== undefined ? parseInt(updates.version, 10) : 1;
  params.push(currentVersion);
  
  const result = await pool.query(query, params);
  
  if (result.rowCount === 0) {
    const exists = await pool.query('SELECT id FROM projects WHERE id = $1 AND is_deleted = 0', [id]);
    if (exists.rows.length > 0) {
      throw new Error('CONCURRENCY_CONFLICT');
    }
    return false;
  }
  return true;
};

const deleteProject = async (id, username) => {
  const now = new Date().toISOString();
  const query = `UPDATE projects SET is_deleted = 1, deleted_by = $1, deleted_at = $2 WHERE id = $3`;
  const result = await pool.query(query, [username || 'System', now, id]);
  return result.rowCount > 0;
};

const bulkInsertProjects = async (projects) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const p of projects) {
      const query = `
        INSERT INTO projects (
          id, title, country, state, category, type, tons, status, images, video, year, description
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title, country = EXCLUDED.country, state = EXCLUDED.state,
          category = EXCLUDED.category, type = EXCLUDED.type, tons = EXCLUDED.tons,
          status = EXCLUDED.status, images = EXCLUDED.images, video = EXCLUDED.video,
          year = EXCLUDED.year, description = EXCLUDED.description
      `;
      const params = [
        p.id, p.title, p.country, p.state, p.category, p.type, p.tons, p.status,
        JSON.stringify(p.images || []), p.video, p.year, p.description
      ];
      await client.query(query, params);
    }
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};

const getSecondaryAdmin = async (username) => {
  const res = await pool.query('SELECT * FROM admins WHERE username = $1', [username]);
  const row = res.rows[0];
  if (!row) return null;
  return {
    username: row.username,
    passwordHash: row.password_hash,
    salt: row.salt,
    createdAt: row.created_at,
    role: row.role
  };
};

const insertSecondaryAdmin = async (username, passwordHash, salt, role='MANAGER') => {
  const query = `
    INSERT INTO admins (username, password_hash, salt, role) 
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (username) DO NOTHING
  `;
  await pool.query(query, [username, passwordHash, salt, role]);
};

const getAllSecondaryAdmins = async () => {
  const res = await pool.query('SELECT username, created_at as "createdAt", role FROM admins ORDER BY created_at DESC');
  return res.rows;
};

const deleteSecondaryAdmin = async (username) => {
  const res = await pool.query('DELETE FROM admins WHERE username = $1', [username]);
  return res.rowCount > 0;
};


const insertAuditLog = async (admin_email, action, target_id, details) => {
  const query = 'INSERT INTO audit_logs (admin_email, action, target_id, details) VALUES (, , , )';
  const values = [admin_email, action, target_id, details ? JSON.stringify(details) : null];
  await pool.query(query, values);
};

const getAuditLogs = async (limit = 100) => {
  const res = await pool.query('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT ', [limit]);
  return res.rows.map(l => {
    if (l.details) { try { l.details = JSON.parse(l.details); } catch(e){} }
    return l;
  });
};

const getProjectsCount = async () => { const res = await pool.query("SELECT COUNT(*) as count FROM projects WHERE is_deleted = 0"); return parseInt(res.rows[0].count, 10); };
module.exports = {
  getProjectsCount,
  insertAuditLog,
  getAuditLogs,
  pool,
  initialize,
  getProjects,
  countProjects,
  getProjectById,
  insertProject,
  updateProject,
  deleteProject,
  parseImages,
  getProjectStats,
  bulkInsertProjects,
  getSecondaryAdmin,
  insertSecondaryAdmin,
  getAllSecondaryAdmins,
  deleteSecondaryAdmin
};
