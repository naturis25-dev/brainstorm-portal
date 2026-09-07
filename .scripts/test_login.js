const http = require('http');
const req = http.request({
  hostname: 'localhost',
  port: 5050,
  path: '/api/auth/login',
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(data));
});
req.write(JSON.stringify({ username: 'arjun', password: 'arj123' }));
req.end();
