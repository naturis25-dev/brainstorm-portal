const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const sampleImages = JSON.stringify([
  "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=80",
  "https://images.unsplash.com/photo-1541888081622-c2e8c2579df2?w=800&q=80",
  "https://images.unsplash.com/photo-1508450859948-4e04fabaa4ea?w=800&q=80",
  "https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?w=800&q=80",
  "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80",
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80",
  "https://images.unsplash.com/photo-1517581177682-a085bb7ffb15?w=800&q=80"
]);

const bigDescription = `This project represents a monumental achievement in structural engineering and architectural design. Spanning multiple phases of rigorous planning, drafting, and execution, our team meticulously handled the fabrication and erection detailing. The structure incorporates advanced high-strength steel alloys, ensuring unprecedented durability and seismic resilience. 

During the primary construction phase, we navigated complex logistical challenges to deliver thousands of tons of steel on schedule. The sophisticated load-bearing framework was modeled entirely in 3D, allowing for flawless clash detection and integration with the mechanical, electrical, and plumbing (MEP) systems. 

Environmental sustainability was a core focus; the steel used contains over 80% recycled content, significantly reducing the carbon footprint of the build. State-of-the-art welding techniques and exhaustive quality assurance protocols were enforced at every step, culminating in a state-of-the-art facility that not only meets but exceeds all international safety standards. 

This facility will serve as a cornerstone for the region's industrial growth, providing critical infrastructure that supports hundreds of jobs and streamlines local supply chains. We are incredibly proud of the collaborative effort between the architects, engineers, and site crews that brought this visionary blueprint to life.`;

async function updateProjects() {
  try {
    console.log("Updating all projects...");
    const result = await pool.query(
      'UPDATE projects SET images = $1, description = $2 WHERE is_deleted = 0',
      [sampleImages, bigDescription]
    );
    console.log(`Successfully updated ${result.rowCount} projects.`);
  } catch(e) {
    console.error(e);
  } finally {
    pool.end();
  }
}

updateProjects();
