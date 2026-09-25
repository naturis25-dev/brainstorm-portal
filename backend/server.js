require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');

const projectsRouter = require('./routes/projects');
const { router: authRouter, requireAuth } = require('./routes/auth');
const { router: metadataRouter } = require('./routes/metadata');
const { router: mediaRouter, uploadDir } = require('./routes/media');

const app = express();
const PORT = process.env.PORT || 5050;

// Production Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Prevents breaking inline 3D viewers and styles
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: false,
  referrerPolicy: { policy: 'no-referrer-when-downgrade' }
}));
app.use(compression()); // Gzip compress responses for massive bandwidth savings
app.use(morgan('dev')); // Log API requests to terminal

// Anti-Brute Force on Auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // limit each IP to 30 auth attempts per window
  message: { message: "Too many authentication requests, please try again after 15 minutes." }
});
app.use('/api/auth', authLimiter);

// Standard Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || true }));
app.use('/uploads', cors(), express.static(uploadDir, { 
  maxAge: '365d', 
  immutable: true,
  setHeaders: (res, filePath) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    if (filePath.endsWith('.glb')) {
      res.setHeader('Content-Type', 'model/gltf-binary');
    } else if (filePath.endsWith('.gltf')) {
      res.setHeader('Content-Type', 'model/gltf+json');
    }
  }
}));
app.use('/api/media', bodyParser.json({ limit: '1000mb' }), mediaRouter);
app.use(bodyParser.json({ limit: '50mb' })); // DOS protection
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Protected Debug Endpoint for Admins Only
app.get('/api/debug-db', requireAuth, async (req, res) => {
  if (req.admin.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ message: 'Forbidden' });
  }
  try {
    const db = require('./db.js');
    if (process.env.DB_CLIENT !== 'pg') {
      return res.json({ status: 'SQLite active', DB_CLIENT: process.env.DB_CLIENT });
    }
    if (!db.pool) {
      return res.json({ status: 'Postgres active but no pool found' });
    }
    const client = await db.pool.connect();
    const result = await client.query('SELECT current_user, current_database();');
    client.release();
    res.json({ 
      status: 'Connected to Postgres!', 
      info: result.rows 
    });
  } catch (err) {
    res.status(500).json({ 
      status: 'Failed to connect', 
      error: err.message
    });
  }
});

// API Routes
app.use('/api/projects', projectsRouter);
app.use('/api/auth', authRouter);
app.use('/api/metadata', metadataRouter);

app.get('/api/drawings', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/drawings_data.json'));
});
app.post('/api/drawings', requireAuth, (req, res) => {
  try {
    fs.writeFileSync(path.join(__dirname, '../frontend/drawings_data.json'), JSON.stringify(req.body, null, 2));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to write drawings data' });
  }
});

// Clean embedded website endpoint with injected ultra-slim scrollbar
app.get('/api/website-embed', async (req, res) => {
  try {
    const targetUrl = 'https://www.brainstorminfotech.com/';
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    if (!response.ok) {
      return res.redirect(targetUrl);
    }
    let html = await response.text();
    const slimScrollbarStyle = `
      <base href="https://www.brainstorminfotech.com/">
      <style id="atlas-ultra-slim-scrollbar">
        ::-webkit-scrollbar {
          width: 3.5px !important;
          height: 3.5px !important;
        }
        ::-webkit-scrollbar-track {
          background: transparent !important;
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(37, 99, 235, 0.45) !important;
          border-radius: 99px !important;
          transition: background 0.2s ease !important;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(37, 99, 235, 0.9) !important;
        }
        * {
          scrollbar-width: thin !important;
          scrollbar-color: rgba(37, 99, 235, 0.45) transparent !important;
        }
      </style>
    `;
    if (html.includes('<head>')) {
      html = html.replace('<head>', '<head>' + slimScrollbarStyle);
    } else {
      html = slimScrollbarStyle + html;
    }
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (err) {
    res.redirect('https://www.brainstorminfotech.com/');
  }
});

// Serve Frontend static files
app.use(express.static(path.join(__dirname, '../frontend')));

// Fallback to index.html for single page application routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

const db = require('./db.js');
if (db.initialize) {
  db.initialize().catch(err => {
    console.error('DB Init Error:', err);
  });
}

const server = app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 Brainstorm Infotech Portal Backend Server Running`);
  console.log(`🌐 Server URL: http://localhost:${PORT}`);
  console.log(`📡 API Endpoints: http://localhost:${PORT}/api/projects`);
  console.log(`====================================================`);
});

// Disable timeout for massive 5GB+ file uploads
server.setTimeout(0);


// Graceful Shutdown for Deployment (Docker/Heroku/Render)
const shutdown = () => {
  console.log('\n[Server] Received kill signal, shutting down gracefully...');
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

// trigger railway redeploy
