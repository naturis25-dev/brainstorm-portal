const http = require('http');
http.get('http://localhost:5050/api/projects/stats?country=ca&category=All', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(JSON.parse(data)));
});
