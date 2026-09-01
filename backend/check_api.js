const { getProjects } = require('./database.pg.js');
(async () => {
    const projs = await getProjects();
    const tom = projs.find(p => p.title.includes('Tom Patterson'));
    console.log(typeof tom.images, Array.isArray(tom.images));
    process.exit(0);
})();
