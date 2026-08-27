const db = require('./database.pg.js');
const { BUILDING_TYPES, STEEL_TYPES, CATEGORY_MAP, STOCK_IMAGES, US_STATES, CA_PROVINCES } = require('./routes/metadata.js');

function rand(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomImages() {
  const shuffled = [...STOCK_IMAGES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 2);
}

async function seed() {
  const projects = [];
  const STATUSES = ["Completed", "Active", "In Review"];
  let idc = Date.now();

  for (let i = 0; i < 2000; i++) {
    const isUS = Math.random() > 0.2; // 80% US, 20% CA
    const country = isUS ? 'US' : 'CA';
    const state = isUS ? rand(US_STATES) : rand(CA_PROVINCES);
    
    const btype = rand(BUILDING_TYPES);
    const ptype = rand(STEEL_TYPES);
    
    projects.push({
      id: "sim-" + (idc++),
      title: `${btype} ${ptype}`,
      state: state,
      country: country,
      type: ptype,
      category: CATEGORY_MAP[btype] || "Misc Steel",
      status: rand(STATUSES),
      year: rand([2023, 2024, 2025, 2026]),
      tons: Math.round(50 + Math.random() * 950),
      description: `Complete ${ptype.toLowerCase()} services provided for a ${btype.toLowerCase()} project located in ${state}. This is a synthetic load-test project demonstrating full scalability.`,
      images: randomImages(),
      video: ""
    });
  }

  console.log("Generating and inserting 2,000 demo projects into Neon PostgreSQL...");
  await db.bulkInsertProjects(projects);
  console.log("Done! 2,000 projects inserted successfully.");
  process.exit(0);
}

seed().catch(e => {
  console.error(e);
  process.exit(1);
});
