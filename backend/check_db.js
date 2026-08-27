const { getProjects } = require('./db');
(async () => {
    try {
        const p = await getProjects();
        console.log("Projects:", p.length);
        process.exit(0);
    } catch (e) {
        console.error(e);
    }
})();
