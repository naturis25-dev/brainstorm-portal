const http = require('http');

const PORT = 5050;

function request(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: PORT,
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
      res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(data) }));
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTest() {
  console.log("--- Starting Concurrency Test ---");
  try {
    // 1. Login Manager A
    const loginA = await request('POST', '/api/auth/login', { username: 'manager1', password: 'password123' });
    const tokenA = loginA.data.token;
    
    // 2. Login Manager B
    const loginB = await request('POST', '/api/auth/login', { username: 'manager2', password: 'password123' });
    const tokenB = loginB.data.token;

    // 3. Manager A creates a project
    const create = await request('POST', '/api/projects', {
      title: 'Concurrency Test Project',
      country: 'US',
      state: 'Texas',
      category: 'Industrial',
      tons: 100,
      year: 2024
    }, tokenA);
    const projId = create.data.project.id;
    console.log(`Created project ${projId} (version ${create.data.project.version || 1})`);
    const initialVersion = create.data.project.version || 1;

    // 4. Manager A and Manager B both "open" it (they both have initialVersion = 1)
    console.log(`Manager A sees version: ${initialVersion}`);
    console.log(`Manager B sees version: ${initialVersion}`);

    // 5. Manager B saves first using version 1
    console.log("Manager B attempts to save...");
    const saveB = await request('PUT', `/api/projects/${projId}`, {
      title: 'Title edited by B',
      version: initialVersion
    }, tokenB);
    console.log(`Manager B save status: ${saveB.status}`);

    // 6. Manager A attempts to save using version 1
    console.log("Manager A attempts to save...");
    const saveA = await request('PUT', `/api/projects/${projId}`, {
      title: 'Title edited by A',
      version: initialVersion
    }, tokenA);
    console.log(`Manager A save status: ${saveA.status}`);
    console.log(`Manager A response:`, saveA.data);

    // 7. Verify final database state
    // We can't fetch it without auth since /api/projects/:id doesn't exist on public except via list,
    // actually let's just make a PUT that we know will fail, or use db directly.
    const getFinal = await request('GET', `/api/projects?sort=key`, null, null); // Will have it in the list
    const finalProj = getFinal.data.projects.find(p => p.id === projId);
    console.log(`Final Title in DB: ${finalProj.title}`);
    console.log(`Final Version in DB: ${finalProj.version}`);
    console.log(`Final Updated By in DB: ${finalProj.updated_by}`);
    
    if (saveA.status === 409 && finalProj.title === 'Title edited by B') {
      console.log('? TEST PASSED: Concurrency prevented Manager A from overwriting Manager B.');
    } else {
      console.log('? TEST FAILED.');
    }

  } catch (err) {
    console.error(err);
  }
}
runTest();
