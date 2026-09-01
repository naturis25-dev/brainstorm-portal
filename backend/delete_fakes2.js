const { pool } = require('./database.pg.js');
(async () => {
    try {
        const res = await pool.query("DELETE FROM projects WHERE id LIKE 'sim-%'");
        console.log(`Deleted ${res.rowCount} fake projects.`);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();
