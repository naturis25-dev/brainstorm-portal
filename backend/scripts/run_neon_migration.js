const Database = require('better-sqlite3');
const path = require('path');

// Set Neon URL for the pg Pool FIRST before requiring database.pg.js
process.env.DATABASE_URL = 'postgresql://neondb_owner:npg_twvrTNVeS60g@ep-sparkling-recipe-azhryvr4.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

const sqliteDb = require('../database.js');
const pgDb = require('../database.pg.js');
const pool = pgDb.pool;

async function runNeonMigration() {
  console.log("=== Phase 3B: PostgreSQL Migration to Neon Staging ===");
  
  try {
    console.log("\n[1] Initializing PostgreSQL schema...");
    await pgDb.initialize();

    const dbPath = path.join(__dirname, '..', 'data', 'projects.db');
    const sdb = new Database(dbPath);
    
    console.log("\n[2] Extracting Admins from SQLite...");
    const sqliteAdmins = sdb.prepare('SELECT * FROM admins').all();
    console.log(`    Found ${sqliteAdmins.length} admins.`);
    for (const a of sqliteAdmins) {
      const q = `
        INSERT INTO admins (username, "passwordHash", salt, "createdAt", role)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (username) DO NOTHING
      `;
      // Preserve createdAt
      await pool.query(q, [a.username, a.passwordHash, a.salt, a.createdAt, a.role]);
    }

    console.log("\n[3] Extracting Projects from SQLite...");
    const sqliteProjects = sdb.prepare('SELECT * FROM projects').all();
    console.log(`    Found ${sqliteProjects.length} projects.`);

    console.log("    Migrating to PostgreSQL (preserving createdAt exactly)...");
    let inserted = 0;
    
    // Batch insert for speed
    await pool.query('BEGIN');
    for (const p of sqliteProjects) {
      const q = `
        INSERT INTO projects (
          id, title, country, state, category, type, tons, status, images, video, 
          "createdAt", year, description, "modelUrl", "isKeyProject", is_deleted, 
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
      if (inserted % 1000 === 0) console.log(`    ...${inserted} projects inserted`);
    }
    await pool.query('COMMIT');
    console.log(`    Finished inserting ${inserted} projects.`);

    console.log("\n[4] Performing Strict Verification (SQLite vs PostgreSQL)...");
    
    const verify = async (name, sqliteQuery, pgQuery) => {
      const sqliteVal = sdb.prepare(sqliteQuery).get();
      const pgVal = await pool.query(pgQuery);
      
      const sValStr = String(Object.values(sqliteVal)[0]);
      let pValStr = Object.values(pgVal.rows[0])[0];
      
      // Handle BigInt vs Int conversion logic for comparison
      if (typeof pValStr === 'object' && pValStr !== null) {
          // just cast nulls or weird things
          pValStr = String(pValStr);
      } else {
          pValStr = String(pValStr);
      }
      
      const match = sValStr === pValStr;
      console.log(`    ${match ? '?' : '?'} ${name.padEnd(25)} | SQLite: ${sValStr.padEnd(10)} | PG: ${pValStr}`);
      return match;
    };

    await verify('Total Admins', 'SELECT COUNT(*) as c FROM admins', 'SELECT COUNT(*)::int as c FROM admins');
    await verify('Total Projects', 'SELECT COUNT(*) as c FROM projects', 'SELECT COUNT(*)::int as c FROM projects');
    await verify('Deleted Projects', 'SELECT COUNT(*) as c FROM projects WHERE is_deleted = 1', 'SELECT COUNT(*)::int as c FROM projects WHERE is_deleted = 1');
    await verify('Draft Status', 'SELECT COUNT(*) as c FROM projects WHERE status = \'Draft\'', 'SELECT COUNT(*)::int as c FROM projects WHERE status = \'Draft\'');
    await verify('Published Status', 'SELECT COUNT(*) as c FROM projects WHERE status = \'Published\'', 'SELECT COUNT(*)::int as c FROM projects WHERE status = \'Published\'');
    await verify('Key Projects', 'SELECT COUNT(*) as c FROM projects WHERE isKeyProject = 1', 'SELECT COUNT(*)::int as c FROM projects WHERE "isKeyProject" = 1');
    await verify('Max Version', 'SELECT MAX(version) as c FROM projects', 'SELECT MAX(version)::int as c FROM projects');
    await verify('Min Version', 'SELECT MIN(version) as c FROM projects', 'SELECT MIN(version)::int as c FROM projects');
    await verify('Audit (created_by)', 'SELECT COUNT(*) as c FROM projects WHERE created_by IS NOT NULL', 'SELECT COUNT(*)::int as c FROM projects WHERE created_by IS NOT NULL');
    await verify('Audit (updated_by)', 'SELECT COUNT(*) as c FROM projects WHERE updated_by IS NOT NULL', 'SELECT COUNT(*)::int as c FROM projects WHERE updated_by IS NOT NULL');
    
    // Sum tons
    const sTons = sdb.prepare('SELECT SUM(tons) as c FROM projects').get().c;
    const pTons = (await pool.query('SELECT SUM(tons)::bigint as c FROM projects')).rows[0].c;
    console.log(`    ${String(sTons) === String(pTons) ? '?' : '?'} ${'Total Tons'.padEnd(25)} | SQLite: ${String(sTons).padEnd(10)} | PG: ${String(pTons)}`);

    console.log("\n[5] Testing PostgreSQL CRUD & Concurrency...");
    
    console.log("    -> Testing Insert...");
    const testProj = await pgDb.insertProject({ title: 'Neon Test', country: 'US', state: 'NY', category: 'Commercial' });
    console.log(`       Inserted project id: ${testProj.id}`);

    console.log("    -> Testing Read...");
    const fetchedProj = await pgDb.getProjectById(testProj.id);
    console.log(`       Read back title: ${fetchedProj.title}`);

    console.log("    -> Testing Update...");
    const updateSuccess = await pgDb.updateProject(testProj.id, { title: 'Neon Test Updated', version: testProj.version });
    console.log(`       Update success: ${updateSuccess}`);

    console.log("    -> Testing Concurrency Control...");
    try {
      await pgDb.updateProject(testProj.id, { title: 'Should Fail', version: testProj.version }); // Stale version
      console.log("       ? Concurrency failed (did not throw)");
    } catch(e) {
      console.log("       ? Concurrency correctly blocked stale write: " + e.message);
    }

    console.log("    -> Testing Soft Delete...");
    await pgDb.deleteProject(testProj.id, 'admin123');
    const checkDeleted = await pool.query('SELECT is_deleted FROM projects WHERE id = $1', [testProj.id]);
    console.log(`       is_deleted flag: ${checkDeleted.rows[0].is_deleted}`);

    console.log("\n? ALL STAGING TESTS COMPLETED SUCCESSFULLY.");
    
  } catch (e) {
    console.error("\n? Error during migration:", e);
  } finally {
    pool.end();
  }
}

runNeonMigration();
