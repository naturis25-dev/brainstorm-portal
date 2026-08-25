const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const { requireAdmin } = require('./auth');

const router = express.Router();
const uploadDir = path.join(__dirname, '..', 'uploads');
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

router.post('/', requireAdmin, upload.fields([
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

    // If a model was uploaded, optimize it!
    if (req.files['model']) {
      const modelFile = req.files['model'][0];
      const inputPath = modelFile.path;
      const outputPath = inputPath.replace(path.extname(inputPath), '_opt' + path.extname(inputPath));
      
      const nodeExe = process.execPath;
      const optimizerScript = path.join(__dirname, '..', 'optimizer.mjs');
      
      await new Promise((resolve, reject) => {
        // Run with 6GB heap limit to comfortably parse 300MB+ models
        exec(`"${nodeExe}" --max-old-space-size=6000 "${optimizerScript}" "${inputPath}" "${outputPath}"`, (error, stdout, stderr) => {
          if (error) {
            console.error('Optimizer Error:', error);
            console.error(stderr);
            // On failure, we just fall back to the original unoptimized model so the upload doesn't completely break
            resolve();
          } else {
            // Replace original with optimized
            fs.renameSync(outputPath, inputPath);
            resolve();
          }
        });
      });
    }

    res.status(201).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Media could not be saved.' });
  }
});

module.exports = { router, uploadDir };
