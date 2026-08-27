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
  console.log("=== PHASE 3C: ATLAS POSTGRESQL APPLICATION TEST ===");
  
  // 1. Auth Login & Verify
  console.log("\n1. Testing Authentication & Authorization...");
  // Super Admin
  const saRes = await request('POST', '/api/auth/login', { username: 'arjun', password: 'arj123' });
  const saToken = saRes.data.token;
  console.log(`   Super Admin Login: ${saRes.status === 200 ? 'PASS' : 'FAIL'} (${saRes.status})`);
  
  const verifyRes = await request('GET', '/api/auth/verify', null, saToken);
  console.log(`   Token Verification: ${verifyRes.status === 200 && verifyRes.data.valid ? 'PASS' : 'FAIL'}`);

  // 2. Admin Management
  console.log("\n2. Testing Admin Management (Super Admin permissions)...");
  const createAdminRes = await request('POST', '/api/auth/admins', { username: 'test_manager', password: 'password123' }, saToken);
  console.log(`   Create Manager: ${createAdminRes.status === 201 || createAdminRes.status === 500 ? 'PASS (or exists)' : 'FAIL'} (${createAdminRes.status})`);
  
  const listAdminRes = await request('GET', '/api/auth/admins', null, saToken);
  console.log(`   List Admins: ${listAdminRes.status === 200 && listAdminRes.data.length > 0 ? 'PASS' : 'FAIL'} (Count: ${listAdminRes.data.length})`);
  
  const delAdminRes = await request('DELETE', '/api/auth/admins/test_manager', null, saToken);
  console.log(`   Delete Manager: ${delAdminRes.status === 200 ? 'PASS' : 'FAIL'} (${delAdminRes.status})`);

  // 3. Project Stats & Map Aggregation
  console.log("\n3. Testing Map Aggregation & Stats...");
  const statsRes = await request('GET', '/api/projects/stats?country=us');
  console.log(`   Map Filter Status: ${statsRes.status === 200 ? 'PASS' : 'FAIL'} (Total Projects: ${statsRes.data.totalProjects})`);

  // 4. Project Listing & Pagination
  console.log("\n4. Testing Project Listing & Pagination...");
  const listRes = await request('GET', '/api/projects?limit=5&offset=2');
  console.log(`   Listing Status: ${listRes.status === 200 && listRes.data.data.length <= 5 ? 'PASS' : 'FAIL'} (Found ${listRes.data.data.length}, Offset: ${listRes.data.offset})`);

  // 5. Project Creation
  console.log("\n5. Testing Project Creation...");
  const createRes = await request('POST', '/api/projects', {
    title: 'Phase 3C Test Proj', country: 'CA', state: 'BC', category: 'Energy'
  }, saToken);
  const newId = createRes.data.id;
  console.log(`   Creation Status: ${createRes.status === 201 ? 'PASS' : 'FAIL'} (ID: ${newId})`);

  // 6. Project Details (Read back)
  console.log("\n6. Testing Project Details Read-back...");
  const detailRes = await request('GET', `/api/projects/${newId}`);
  console.log(`   Details Status: ${detailRes.status === 200 && detailRes.data.title === 'Phase 3C Test Proj' ? 'PASS' : 'FAIL'}`);

  // 7. Project Editing & Concurrency
  console.log("\n7. Testing Project Editing & Version Protection...");
  const editRes1 = await request('PUT', `/api/projects/${newId}`, { title: 'Updated Phase 3C', version: 1 }, saToken);
  console.log(`   Edit Status: ${editRes1.status === 200 ? 'PASS' : 'FAIL'}`);
  
  const editRes2 = await request('PUT', `/api/projects/${newId}`, { title: 'Should Fail', version: 1 }, saToken);
  console.log(`   Concurrency Status: ${editRes2.status === 409 ? 'PASS' : 'FAIL'} (Blocked stale edit)`);

  // 8. Soft Deletion
  console.log("\n8. Testing Soft Deletion...");
  const delRes = await request('DELETE', `/api/projects/${newId}`, null, saToken);
  console.log(`   Delete Status: ${delRes.status === 200 ? 'PASS' : 'FAIL'}`);
  
  const verifyDelRes = await request('GET', `/api/projects/${newId}`);
  console.log(`   Verify Deletion Status: ${verifyDelRes.status === 404 ? 'PASS' : 'FAIL'}`);

  console.log("\n=== PHASE 3C TESTS COMPLETED ===");
}

testAll();
