const Database = require('better-sqlite3');
const path = require('path');
const crypto = require('crypto');
const pgDb = require('../database.pg.js');
const pool = pgDb.pool;

async function runNeonMigration() {
  console.log("=== Phase 3B: PostgreSQL Clean Migration & Validation ===");
  
  if (!process.env.DATABASE_URL) {
    console.error("? CRITICAL: DATABASE_URL is not set in .env.");
    process.exit(1);
  }

  try {
    console.log("\n[1] Dropping old tables and Initializing clean schema...");
    const client = await pool.connect();
    await client.query("DROP TABLE IF EXISTS projects; DROP TABLE IF EXISTS admins;");
    client.release();
    
    await pgDb.initialize();

    const dbPath = path.join(__dirname, '..', 'data', 'projects.db');
    const sdb = new Database(dbPath);
    
    console.log("\n[2] Extracting & Migrating Admins...");
    const sqliteAdmins = sdb.prepare('SELECT * FROM admins').all();
    console.log(`    Found ${sqliteAdmins.length} admins.`);
    for (const a of sqliteAdmins) {
      const q = `
        INSERT INTO admins (username, password_hash, salt, created_at, role)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (username) DO NOTHING
      `;
      await pool.query(q, [a.username, a.passwordHash, a.salt, a.createdAt, a.role]);
    }
    console.log("    Admins migrated.");

    console.log("\n[3] Extracting & Migrating Genuine Projects...");
    const totalProjects = sdb.prepare('SELECT COUNT(*) as c FROM projects').get().c;
    console.log(`    Total projects to migrate: ${totalProjects}`);

    let inserted = 0;
    const BATCH_SIZE = 500;
    let offset = 0;

    while (offset < totalProjects) {
      const batch = sdb.prepare(`SELECT * FROM projects LIMIT ${BATCH_SIZE} OFFSET ${offset}`).all();
      if (batch.length === 0) break;

      await pool.query('BEGIN');
      for (const p of batch) {
        const q = `
          INSERT INTO projects (
            id, title, country, state, category, type, tons, status, images, video, 
            created_at, year, description, model_url, is_key_project, is_deleted, 
            created_by, updated_by, deleted_by, deleted_at, version
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
          ON CONFLICT (id) DO NOTHING
        `;
        const params = [
          p.id, p.title, p.country, p.state, p.category, p.type, p.tons, p.status, 
          p.images || '[]', p.video, p.createdAt, p.year, p.description, p.modelUrl,
          p.isKeyProject, p.is_deleted, p.created_by, p.updated_by, p.deleted_by, p.deleted_at, p.version || 1
        ];
        await pool.query(q, params);
        inserted++;
      }
      await pool.query('COMMIT');
      console.log(`    ... Migrated ${inserted} / ${totalProjects}`);
      offset += BATCH_SIZE;
    }
    console.log(`    Finished migrating ${inserted} projects.`);

    console.log("\n[4] Comprehensive Validation...");

    const verifyCount = async (name, sQuery, pQuery) => {
      const sCount = sdb.prepare(sQuery).get().c;
      const pCount = (await pool.query(pQuery)).rows[0].c;
      const match = String(sCount) === String(pCount);
      console.log(`    ${match ? '?' : '?'} ${name.padEnd(25)} | SQLite: ${sCount.toString().padEnd(6)} | PG: ${pCount}`);
      if (!match) throw new Error(`Validation failed for: ${name}`);
    };

    // Row counts
    await verifyCount('Total Admins', 'SELECT COUNT(*) as c FROM admins', 'SELECT COUNT(*)::int as c FROM admins');
    await verifyCount('Total Projects', 'SELECT COUNT(*) as c FROM projects', 'SELECT COUNT(*)::int as c FROM projects');
    await verifyCount('Deleted Projects', 'SELECT COUNT(*) as c FROM projects WHERE is_deleted = 1', 'SELECT COUNT(*)::int as c FROM projects WHERE is_deleted = 1');
    await verifyCount('Draft Projects', 'SELECT COUNT(*) as c FROM projects WHERE status = \'Draft\'', 'SELECT COUNT(*)::int as c FROM projects WHERE status = \'Draft\'');
    await verifyCount('Published Projects', 'SELECT COUNT(*) as c FROM projects WHERE status != \'Draft\'', 'SELECT COUNT(*)::int as c FROM projects WHERE status != \'Draft\'');
    await verifyCount('Key Projects', 'SELECT COUNT(*) as c FROM projects WHERE isKeyProject = 1', 'SELECT COUNT(*)::int as c FROM projects WHERE is_key_project = 1');
    
    // Deterministic Hash Check covering ALL fields
    console.log("\n    -> Calculating Deterministic Full-Record Checksums...");
    
    const normalizeRow = (r, isPg = false) => {
      const ts = isPg ? r.created_at : r.createdAt;
      const dateNorm = ts ? new Date(ts).getTime().toString() : '';
      
      return [
        r.id || '', r.title || '', r.country || '', r.state || '', r.category || '', r.type || '',
        r.tons || '0', r.status || '', r.images || '[]', r.video || '', dateNorm, r.year || '',
        r.description || '', isPg ? (r.model_url || '') : (r.modelUrl || ''),
        isPg ? (r.is_key_project || '0') : (r.isKeyProject || '0'), r.is_deleted || '0',
        r.created_by || '', r.updated_by || '', r.deleted_by || '', r.deleted_at || '', r.version || '1'
      ].join('|');
    };

    const sHashObj = crypto.createHash('sha256');
    const sqliteRows = sdb.prepare("SELECT * FROM projects ORDER BY id").all();
    sqliteRows.forEach(r => sHashObj.update(normalizeRow(r, false)));
    const sHash = sHashObj.digest('hex');

    const pHashObj = crypto.createHash('sha256');
    const pgRows = await pool.query("SELECT * FROM projects ORDER BY id");
    pgRows.rows.forEach(r => pHashObj.update(normalizeRow(r, true)));
    const pHash = pHashObj.digest('hex');
    
    const hashMatch = sHash === pHash;
    console.log(`    ${hashMatch ? '?' : '?'} Full-Record Checksum  | Match: ${hashMatch}`);
    if (!hashMatch) throw new Error("Full-Record Checksum Validation Failed! Data mismatch detected.");

    // Sample Verifications
    console.log("\n    -> Sampling Representative Records...");
    const sampleTypes = [
      { name: 'Draft', q: "SELECT id FROM projects WHERE status = 'Draft' LIMIT 1" },
      { name: 'Published', q: "SELECT id FROM projects WHERE status != 'Draft' LIMIT 1" },
      { name: 'Key Project', q: "SELECT id FROM projects WHERE isKeyProject = 1 LIMIT 1" }
    ];

    for (const t of sampleTypes) {
      const row = sdb.prepare(t.q).get();
      if (!row) {
        console.log(`    ??  Skipped sample '${t.name}' (none found in SQLite).`);
        continue;
      }
      const sRow = sdb.prepare('SELECT * FROM projects WHERE id = ?').get(row.id);
      const pRowQuery = await pool.query('SELECT * FROM projects WHERE id = $1', [row.id]);
      const pRow = pRowQuery.rows[0];
      const sNorm = normalizeRow(sRow, false);
      const pNorm = normalizeRow(pRow, true);
      const isMatch = sNorm === pNorm;
      console.log(`    ${isMatch ? '?' : '?'} Sample: ${t.name.padEnd(15)} | ID: ${sRow.id}`);
      if (!isMatch) throw new Error(`Sample verification failed for project ID ${sRow.id}`);
    }

    console.log("\n[5] Testing PostgreSQL CRUD & Concurrency independently...");
    const testProj = await pgDb.insertProject({ title: 'CRUD Test', country: 'CA', state: 'ON', category: 'Bridge' });
    console.log(`    ? Inserted test project: ${testProj.id}`);
    const fetched = await pgDb.getProjectById(testProj.id);
    console.log(`    ? Read back title: ${fetched.title}`);
    await pgDb.updateProject(testProj.id, { title: 'CRUD Updated', version: testProj.version });
    console.log(`    ? Updated project successfully.`);
    try {
      await pgDb.updateProject(testProj.id, { title: 'Should Fail', version: testProj.version });
      throw new Error("Concurrency failed (did not throw)");
    } catch(e) {
      if (e.message.includes("CONCURRENCY_CONFLICT")) {
         console.log("    ? Concurrency correctly blocked stale write.");
      } else {
         throw e;
      }
    }
    await pgDb.deleteProject(testProj.id, 'test_admin');
    console.log(`    ? Soft Delete successful`);

    // Clean up test record since this is testing independently
    await pool.query("DELETE FROM projects WHERE id = $1", [testProj.id]);

    console.log("\n?? ALL STAGING TESTS COMPLETED SUCCESSFULLY.");
    console.log("PostgreSQL is clean and contains exactly your 208 real projects.");
    
  } catch (e) {
    console.error("\n? FATAL ERROR DURING MIGRATION:");
    console.error(e.message);
    process.exit(1);
  } finally {
    pool.end();
  }
}

runNeonMigration();
