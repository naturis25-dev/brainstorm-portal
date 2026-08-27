const http = require('http');

const request = (path) => {
  return new Promise((resolve, reject) => {
    http.get('http://localhost:5050' + path, (res) => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
};

async function testFrontendLogic() {
  console.log("=== FRONTEND PAYLOAD VERIFICATION ===");
  
  // Test Washington
  const wa = await request('/api/projects?state=Washington&country=us&category=All&sort=key&limit=50');
  const waList = wa.data || [];
  console.log(`Washington (Click trigger): Rendered ${waList.length} projects (Expected: 10)`);
  
  // Test another state (e.g., Texas)
  const tx = await request('/api/projects?state=Texas&country=us&category=All&sort=key&limit=50');
  const txList = tx.data || [];
  console.log(`Texas (Click trigger): Rendered ${txList.length} projects`);
  
  // Test Sorting Dropdown (e.g., sort=year)
  const txSorted = await request('/api/projects?state=Texas&country=us&category=All&sort=year&limit=100');
  const txSortedList = txSorted.data || [];
  console.log(`Texas (Sort by Year trigger): Rendered ${txSortedList.length} projects`);
}
testFrontendLogic();
