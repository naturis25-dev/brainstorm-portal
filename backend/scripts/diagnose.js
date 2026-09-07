const http = require('http');

const request = (path) => {
  return new Promise((resolve, reject) => {
    http.get('http://localhost:5050' + path, (res) => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(data) }));
    }).on('error', reject);
  });
};

async function diagnose() {
  console.log("=== DIAGNOSIS REPORT ===");
  
  // 1. Check stats endpoint for Washington
  console.log("\n1. Fetching /api/projects/stats?country=us");
  const stats = await request('/api/projects/stats?country=us');
  if (stats.body.regions && stats.body.regions['Washington']) {
    console.log(`   Stats says Washington has: ${stats.body.regions['Washington'].count} projects.`);
  } else {
    console.log(`   Stats has NO entry for Washington.`);
  }

  // 2. Check the actual project fetch request
  const fetchUrl = '/api/projects?state=Washington&country=us&category=All&sort=key&limit=50';
  console.log(`\n2. Fetching ${fetchUrl}`);
  const projectsRes = await request(fetchUrl);
  console.log(`   Status: ${projectsRes.status}`);
  console.log(`   Keys in response payload: ${Object.keys(projectsRes.body).join(', ')}`);
  if (projectsRes.body.data) {
    console.log(`   'data' array length: ${projectsRes.body.data.length}`);
  }
  if (projectsRes.body.projects) {
    console.log(`   'projects' array length: ${projectsRes.body.projects.length}`);
  }
}

diagnose();
