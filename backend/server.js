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
  crossOriginEmbedderPolicy: false
}));
app.use(compression()); // Gzip compress responses for massive bandwidth savings
app.use(morgan('dev')); // Log API requests to terminal

// Anti-Brute Force on Auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 auth attempts per window
  message: "Too many login attempts, please try again later"
});
app.use('/api/auth/login', authLimiter);

// Standard Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || true }));
app.use('/uploads', express.static(uploadDir, { maxAge: '365d', immutable: true }));
app.use('/api/media', bodyParser.json({ limit: '1000mb' }), mediaRouter);
app.use(bodyParser.json({ limit: '1000mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '1000mb' }));

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

// Serve Frontend static files
app.use(express.static(path.join(__dirname, '../frontend')));

// Fallback to index.html for single page application routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

const server = app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 Brainstorm Infotech Portal Backend Server Running`);
  console.log(`🌐 Server URL: http://localhost:${PORT}`);
  console.log(`📡 API Endpoints: http://localhost:${PORT}/api/projects`);
  console.log(`====================================================`);
});

// Disable timeout for massive 5GB+ file uploads
server.setTimeout(0);
