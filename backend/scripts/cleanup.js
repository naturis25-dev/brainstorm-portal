const pgDb = require('../database.pg.js');
async function cleanup() {
  try {
    const res = await pgDb.pool.query("DELETE FROM projects WHERE id = '1787738794665'");
    console.log(`Deleted ${res.rowCount} test projects.`);
  } catch(e) {
    console.error(e);
  } finally {
    pgDb.pool.end();
  }
}
cleanup();
