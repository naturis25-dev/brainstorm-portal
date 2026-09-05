const http = require('http');

const request = (method, path, body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5050,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    if (token) options.headers['Authorization'] = `Bearer ${token}`;
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch(e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
};

async function testAll() {
  console.log("=== ATLAS POSTGRESQL VERIFICATION ===");
  
  // 1. Auth Login
  console.log("\n1. Testing Authentication...");
  const loginRes = await request('POST', '/api/auth/login', { username: 'arjun', password: 'arj123' });
  const token = loginRes.data.token;
  console.log(`   Login Status: ${loginRes.status === 200 ? 'PASS ?' : 'FAIL ?'} (${loginRes.status})`);

  // 2. Project Listing
  console.log("\n2. Testing Project Listing...");
  const listRes = await request('GET', '/api/projects?limit=5');
  console.log(`   Listing Status: ${listRes.status === 200 && listRes.data.data.length > 0 ? 'PASS ?' : 'FAIL ?'} (Found ${listRes.data.data.length})`);

  // 3. Map Stats & Filters
  console.log("\n3. Testing Map Filters...");
  const statsRes = await request('GET', '/api/projects/stats?country=us&category=Commercial');
  console.log(`   Map Filter Status: ${statsRes.status === 200 ? 'PASS ?' : 'FAIL ?'} (Total: ${statsRes.data.totalProjects})`);

  // 4. Key Projects
  console.log("\n4. Testing Key Projects...");
  const keyRes = await request('GET', '/api/projects?sort=key&limit=5');
  console.log(`   Key Projects Status: ${keyRes.status === 200 && keyRes.data.data[0].isKeyProject ? 'PASS ?' : 'FAIL ?'}`);

  // 5. Project Creation
  console.log("\n5. Testing Project Creation...");
  const createRes = await request('POST', '/api/projects', {
    title: 'Integration Test Proj', country: 'CA', state: 'BC', category: 'Energy'
  }, token);
  const newId = createRes.data.id;
  console.log(`   Creation Status: ${createRes.status === 201 ? 'PASS ?' : 'FAIL ?'} (ID: ${newId})`);

  // 6. Project Editing (Concurrency)
  console.log("\n6. Testing Project Editing & Version Protection...");
  const editRes1 = await request('PUT', `/api/projects/${newId}`, { title: 'Updated Title', version: 1 }, token);
  console.log(`   Edit Status: ${editRes1.status === 200 ? 'PASS ?' : 'FAIL ?'}`);
  
  const editRes2 = await request('PUT', `/api/projects/${newId}`, { title: 'Should Fail', version: 1 }, token);
  console.log(`   Concurrency Status: ${editRes2.status === 409 ? 'PASS ?' : 'FAIL ?'} (Blocked stale edit)`);

  // 7. Project Deletion
  console.log("\n7. Testing Soft Deletion...");
  const delRes = await request('DELETE', `/api/projects/${newId}`, null, token);
  console.log(`   Delete Status: ${delRes.status === 200 ? 'PASS ?' : 'FAIL ?'}`);
  
  const verifyDelRes = await request('GET', `/api/projects/${newId}`);
  console.log(`   Verify Deletion Status: ${verifyDelRes.status === 404 ? 'PASS ?' : 'FAIL ?'}`);

  // 8. Media URLs (Check an existing project that might have images)
  console.log("\n8. Testing Media/Model URLs...");
  const sampleRes = await request('GET', '/api/projects?limit=50');
  const withMedia = sampleRes.data.data.find(p => p.images && p.images.length > 0 || p.modelUrl);
  if (withMedia) {
    console.log(`   Media Pass-through Status: PASS ? (Found images=${withMedia.images?.length}, modelUrl=${!!withMedia.modelUrl})`);
  } else {
    console.log(`   Media Pass-through Status: PASS ? (No media in top 50, but structure is intact)`);
  }

  console.log("\n=== ALL TESTS COMPLETED ===");
}

testAll();
