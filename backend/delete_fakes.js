const { getClient } = require('./database.pg.js');
(async () => {
    try {
        const client = await getClient();
        const res = await client.query("DELETE FROM projects WHERE id LIKE 'sim-%'");
        console.log(`Deleted ${res.rowCount} fake projects.`);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();
