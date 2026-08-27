const { getProjects } = require('./db');
(async () => {
    try {
        const p = await getProjects();
        console.log(JSON.stringify(p[0], null, 2));
        process.exit(0);
    } catch (e) {
        console.error(e);
    }
})();
