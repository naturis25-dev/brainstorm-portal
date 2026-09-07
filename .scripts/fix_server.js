const fs = require('fs');
let p = 'backend/server.js';
let content = fs.readFileSync(p, 'utf8');

// Reduce JSON body limit from 1000mb to 10mb for security (DOS prevention)
content = content.replace(
  "app.use(bodyParser.json({ limit: '1000mb' }));",
  "app.use(bodyParser.json({ limit: '10mb' })); // Reduced from 1000mb for DOS protection"
);
content = content.replace(
  "app.use(bodyParser.urlencoded({ extended: true, limit: '1000mb' }));",
  "app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));"
);

// Add global error handler and graceful shutdown before app.listen
const targetListen = "app.listen(PORT, async () => {";
const improvements = `
// Global Error Handler (Prevents stack trace leaks and server crashes)
app.use((err, req, res, next) => {
  console.error('[Express Error]', err);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message
  });
});

const server = app.listen(PORT, async () => {`;

content = content.replace(targetListen, improvements);

// Add Graceful Shutdown
content += `

// Graceful Shutdown for Deployment (Docker/Heroku/Render)
const shutdown = () => {
  console.log('\\n[Server] Received kill signal, shutting down gracefully...');
  server.close(async () => {
    console.log('[Server] Closed out remaining connections.');
    try {
      const { pool } = require('./database.pg.js');
      if (pool) await pool.end();
      console.log('[DB] PostgreSQL pool closed.');
    } catch (err) {
      console.error('[DB] Error during pool closure:', err);
    }
    process.exit(0);
  });
  
  setTimeout(() => {
    console.error('[Server] Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
`;

fs.writeFileSync(p, content);
console.log("Patched server.js with deployment improvements!");
