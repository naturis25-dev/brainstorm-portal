const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const { requireAuth } = require('./auth');

const router = express.Router();
const uploadDir = process.env.DATA_DIR ? path.join(process.env.DATA_DIR, 'uploads') : path.join(__dirname, '..', 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const name = crypto.randomBytes(16).toString('hex') + ext;
    cb(null, name);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 6000 * 1024 * 1024 } // 6GB limit
});

const { exec } = require('child_process');

function startOptimization(targetPath) {
  const processingPath = targetPath + '.processing';
  const failedPath = targetPath + '.failed';

  // Ensure states are clean
  if (!fs.existsSync(processingPath)) return;
  if (fs.existsSync(failedPath)) fs.unlinkSync(failedPath);
  if (fs.existsSync(targetPath)) fs.unlinkSync(targetPath);

  const nodeExe = process.execPath;
  const optimizerScript = path.join(__dirname, '..', 'optimizer.mjs');

  exec(`"${nodeExe}" --max-old-space-size=6000 "${optimizerScript}" "${processingPath}" "${targetPath}"`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Optimizer failed for ${targetPath}: code ${error.code}`);
      
      if (!fs.existsSync(processingPath)) return; // Should not happen

      if (error.code === 2) {
        // Corrupted / Cannot Read
        fs.renameSync(processingPath, failedPath);
      } else if (error.code === 3) {
        // Valid, but optimization failed (e.g. OOM)
        fs.renameSync(processingPath, targetPath); // Fallback to original
      } else {
        // Unknown crash
        fs.renameSync(processingPath, failedPath);
      }
    } else {
      // Success! The output was written to targetPath.
      if (fs.existsSync(processingPath)) {
        fs.unlinkSync(processingPath);
      }
    }
  });
}

// ----------------------------------------------------
// Start-up recovery logic: Resume orphaned tasks
// ----------------------------------------------------
function resumeFailedOptimizations() {
  const files = fs.readdirSync(uploadDir);
  files.forEach(f => {
    if (f.endsWith('.processing')) {
      console.log(`[Media] Resuming orphaned optimization for ${f}`);
      const targetName = f.replace('.processing', '');
      startOptimization(path.join(uploadDir, targetName));
    }
  });
}
// Run once on load
resumeFailedOptimizations();


router.post('/', requireAuth, upload.fields([
  { name: 'images', maxCount: 20 },
  { name: 'video', maxCount: 1 },
  { name: 'model', maxCount: 1 }
]), async (req, res) => {
  try {
    const response = {
      images: req.files['images'] ? req.files['images'].map(f => `/uploads/${f.filename}`) : [],
      video: req.files['video'] ? `/uploads/${req.files['video'][0].filename}` : '',
      model: req.files['model'] ? `/uploads/${req.files['model'][0].filename}` : ''
    };

    if (req.files['model'] && req.files['model'][0]) {
      const targetPath = req.files['model'][0].path;
      const processingPath = targetPath + '.processing';
      
      // Move original aside
      fs.renameSync(targetPath, processingPath);
      
      // Launch background worker
      startOptimization(targetPath);
    }

    res.status(202).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Media could not be saved.' });
  }
});

// STATUS endpoint for frontend polling
router.get('/status', (req, res) => {
  try {
    const fileUrl = req.query.file;
    if (!fileUrl || !fileUrl.startsWith('/uploads/')) return res.json({ status: 'NOT_FOUND' });
    
    const baseName = path.basename(fileUrl);
    const targetPath = path.join(uploadDir, baseName);

    if (fs.existsSync(targetPath)) return res.json({ status: 'READY' });
    if (fs.existsSync(targetPath + '.processing')) return res.json({ status: 'PROCESSING' });
    if (fs.existsSync(targetPath + '.failed')) return res.json({ status: 'FAILED' });
    
    return res.json({ status: 'NOT_FOUND' });
  } catch (e) {
    return res.json({ status: 'NOT_FOUND' });
  }
});

module.exports = { router, uploadDir };
