const { pool } = require('./database.pg.js');
(async () => {
    try {
        const res = await pool.query("SELECT id, title, images FROM projects WHERE title ILIKE '%tom patterson%'");
        console.log(res.rows);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();
