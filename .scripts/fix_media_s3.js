const fs = require('fs');
let p = 'backend/routes/media.js';
let content = fs.readFileSync(p, 'utf8');

const regexImports = /const multer = require\('multer'\);\nconst \{ requireAuth \} = require\('\.\/auth'\);/;
const newImports = `const multer = require('multer');
const { requireAuth } = require('./auth');
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');

let s3Client = null;
if (process.env.S3_ENDPOINT && process.env.S3_ACCESS_KEY && process.env.S3_SECRET_KEY && process.env.S3_BUCKET) {
  s3Client = new S3Client({
    region: 'auto',
    endpoint: process.env.S3_ENDPOINT,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY,
      secretAccessKey: process.env.S3_SECRET_KEY
    }
  });
  console.log('[Cloud Storage] S3/R2 Client Initialized.');
}`;
content = content.replace(regexImports, newImports);

const regexPost = /router\.post\('\/upload', requireAuth, upload\.array\('files'\), \(req, res\) => \{\s*if \(\!req\.files \|\| req\.files\.length === 0\) \{\s*return res\.status\(400\)\.json\(\{ error: 'No files uploaded' \}\);\s*\}\s*const uploadedFiles = req\.files\.map\(f => f\.filename\);\s*res\.json\(\{ success: true, files: uploadedFiles \}\);\s*\}\);/;
const newPost = `router.post('/upload', requireAuth, upload.array('files'), async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }
  
  try {
    const uploadedFiles = [];
    for (let f of req.files) {
      let finalPath = f.filename;
      
      if (s3Client) {
        const fileStream = fs.createReadStream(f.path);
        const command = new PutObjectCommand({
          Bucket: process.env.S3_BUCKET,
          Key: f.filename,
          Body: fileStream,
          ContentType: f.mimetype
        });
        await s3Client.send(command);
        
        finalPath = process.env.S3_PUBLIC_DOMAIN 
          ? \`https://\${process.env.S3_PUBLIC_DOMAIN}/\${f.filename}\`
          : \`\${process.env.S3_ENDPOINT}/\${process.env.S3_BUCKET}/\${f.filename}\`;
          
        fs.unlinkSync(f.path);
      }
      uploadedFiles.push(finalPath);
    }
    res.json({ success: true, files: uploadedFiles });
  } catch (err) {
    next(err);
  }
});`;
content = content.replace(regexPost, newPost);

const regexDel = /router\.delete\('\/upload\/:filename', requireAuth, \(req, res\) => \{\s*const filepath = path\.join\(uploadDir, req\.params\.filename\);\s*if \(fs\.existsSync\(filepath\)\) \{\s*fs\.unlinkSync\(filepath\);\s*res\.json\(\{ success: true \}\);\s*\} else \{\s*res\.status\(404\)\.json\(\{ error: 'File not found' \}\);\s*\}\s*\}\);/;
const newDel = `router.delete('/upload/:filename', requireAuth, async (req, res, next) => {
  try {
    const filename = req.params.filename;
    if (s3Client) {
      // If it's a full URL, extract the key
      let key = filename;
      if (filename.startsWith('http')) {
        const urlParts = new URL(filename);
        key = urlParts.pathname.split('/').pop();
      }
      const command = new DeleteObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: key
      });
      await s3Client.send(command);
      res.json({ success: true });
    } else {
      const filepath = path.join(uploadDir, filename);
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
        res.json({ success: true });
      } else {
        res.status(404).json({ error: 'File not found locally' });
      }
    }
  } catch (err) {
    next(err);
  }
});`;
content = content.replace(regexDel, newDel);

fs.writeFileSync(p, content);
console.log("S3 logic added successfully!");
