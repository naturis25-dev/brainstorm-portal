const { pool } = require('./database.pg.js');
(async () => {
    try {
        const res = await pool.query("SELECT COUNT(*) FROM projects");
        console.log(`Remaining projects: ${res.rows[0].count}`);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();
