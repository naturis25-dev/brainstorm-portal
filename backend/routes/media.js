const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const { requireAuth } = require('./auth');
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const mime = require('mime-types');

let s3Client = null;
let s3PublicUrl = process.env.S3_PUBLIC_URL || '';
if (process.env.S3_ENDPOINT && process.env.S3_ACCESS_KEY && process.env.S3_SECRET_KEY && process.env.S3_BUCKET) {
  s3Client = new S3Client({
    region: 'auto',
    endpoint: process.env.S3_ENDPOINT,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY,
      secretAccessKey: process.env.S3_SECRET_KEY
    }
  });
  if (!s3PublicUrl) {
    s3PublicUrl = `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET}`;
  }
  console.log('[Cloud Storage] S3/R2 Client Initialized. Public URL:', s3PublicUrl);
}

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

async function uploadToR2AndDelete(localPath, filename) {
  if (!s3Client) return `/uploads/${filename}`;
  try {
    const fileStream = fs.createReadStream(localPath);
    const contentType = mime.lookup(localPath) || 'application/octet-stream';
    const key = `uploads/${filename}`;
    
    await s3Client.send(new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      Body: fileStream,
      ContentType: contentType,
    }));
    
    if (fs.existsSync(localPath)) fs.unlinkSync(localPath);
    
    const base = s3PublicUrl.replace(/\/$/, '');
    return `${base}/${key}`;
  } catch (err) {
    console.error(`[Cloud Storage] Failed to upload ${filename} to R2:`, err);
    return `/uploads/${filename}`;
  }
}

function getFinalUrl(filename) {
  if (!s3Client) return `/uploads/${filename}`;
  const base = s3PublicUrl.replace(/\/$/, '');
  return `${base}/uploads/${filename}`;
}

const { exec } = require('child_process');

function startOptimization(targetPath, filename) {
  const processingPath = targetPath + '.processing';
  const failedPath = targetPath + '.failed';

  if (!fs.existsSync(processingPath)) return;
  if (fs.existsSync(failedPath)) fs.unlinkSync(failedPath);
  if (fs.existsSync(targetPath)) fs.unlinkSync(targetPath);

  const nodeExe = process.execPath;
  const optimizerScript = path.join(__dirname, '..', 'optimizer.mjs');

  exec(`"${nodeExe}" --max-old-space-size=6000 "${optimizerScript}" "${processingPath}" "${targetPath}"`, async (error, stdout, stderr) => {
    let finalLocalPath = targetPath;
    let optimizationFailed = false;
    
    if (error) {
      console.error(`Optimizer failed for ${targetPath}: code ${error.code}`);
      if (!fs.existsSync(processingPath)) return;
      if (error.code === 2) {
        fs.renameSync(processingPath, failedPath);
        optimizationFailed = true;
      } else if (error.code === 3) {
        fs.renameSync(processingPath, targetPath);
      } else {
        fs.renameSync(processingPath, failedPath);
        optimizationFailed = true;
      }
    } else {
      if (fs.existsSync(processingPath)) fs.unlinkSync(processingPath);
    }

    if (s3Client && !optimizationFailed && fs.existsSync(finalLocalPath)) {
       try {
         await uploadToR2AndDelete(finalLocalPath, filename);
       } catch(e) {
         console.error('Failed post-optimization R2 upload:', e);
       }
    }
  });
}

function resumeFailedOptimizations() {
  const files = fs.readdirSync(uploadDir);
  files.forEach(f => {
    if (f.endsWith('.processing')) {
      const targetName = f.replace('.processing', '');
      startOptimization(path.join(uploadDir, targetName), targetName);
    }
  });
}
resumeFailedOptimizations();

router.post('/', requireAuth, upload.fields([
  { name: 'images', maxCount: 20 },
  { name: 'video', maxCount: 1 },
  { name: 'model', maxCount: 1 },
  { name: 'document', maxCount: 1 }
]), async (req, res) => {
  try {
    const response = { images: [], video: '', model: '', document: '' };

    if (req.files['images']) {
      for (const f of req.files['images']) {
         if (s3Client) {
           const r2Url = await uploadToR2AndDelete(f.path, f.filename);
           response.images.push(r2Url);
         } else {
           response.images.push(`/uploads/${f.filename}`);
         }
      }
    }

    if (req.files['video'] && req.files['video'][0]) {
      const f = req.files['video'][0];
      if (s3Client) {
         response.video = await uploadToR2AndDelete(f.path, f.filename);
      } else {
         response.video = `/uploads/${f.filename}`;
      }
    }

    if (req.files['model'] && req.files['model'][0]) {
      const f = req.files['model'][0];
      const targetPath = f.path;
      const processingPath = targetPath + '.processing';
      
      fs.renameSync(targetPath, processingPath);
      startOptimization(targetPath, f.filename);
      response.model = getFinalUrl(f.filename);
    }

    if (req.files['document'] && req.files['document'][0]) {
      const f = req.files['document'][0];
      if (s3Client) {
         response.document = await uploadToR2AndDelete(f.path, f.filename);
      } else {
         response.document = `/uploads/${f.filename}`;
      }
    }

    res.status(202).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Media could not be saved.' });
  }
});

router.get('/status', (req, res) => {
  try {
    const fileUrl = req.query.file;
    if (!fileUrl) return res.json({ status: 'NOT_FOUND' });
    if (!fileUrl.includes('/uploads/')) return res.json({ status: 'NOT_FOUND' });
    
    const baseName = path.basename(fileUrl);
    const targetPath = path.join(uploadDir, baseName);

    if (s3Client && !fs.existsSync(targetPath) && !fs.existsSync(targetPath + '.processing') && !fs.existsSync(targetPath + '.failed')) {
        return res.json({ status: 'READY' });
    }

    if (fs.existsSync(targetPath)) return res.json({ status: 'READY' });
    if (fs.existsSync(targetPath + '.processing')) return res.json({ status: 'PROCESSING' });
    if (fs.existsSync(targetPath + '.failed')) return res.json({ status: 'FAILED' });
    
    return res.json({ status: 'NOT_FOUND' });
  } catch (e) {
    return res.json({ status: 'NOT_FOUND' });
  }
});

module.exports = { router, uploadDir };
