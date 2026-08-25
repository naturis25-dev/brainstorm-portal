const fs = require('fs');
const path = require('path');

const baseDir = '/Users/arjuns/Documents/brainstorm-portal/frontend/assets/pdfs';
const categories = {
  'Miscellaneous Framing Sheets': 'misc',
  'Projects_Canada': 'canada',
  'Projects_Quebec_Canada': 'quebec',
  'Projects_USA': 'usa',
  'Projects_United_Arab_Emirates': 'uae'
};

const getFiles = (dir) => {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(file));
    } else {
      if (file.endsWith('.pdf')) {
        results.push(file);
      }
    }
  });
  return results;
};

const data = {};
for (const [folderName, catId] of Object.entries(categories)) {
  const fullPath = path.join(baseDir, folderName);
  if (fs.existsSync(fullPath)) {
    const files = getFiles(fullPath).map(f => {
      // relative to frontend
      const relPath = f.replace('/Users/arjuns/Documents/brainstorm-portal/frontend/', '');
      const name = path.basename(f, '.pdf');
      // maybe also get subdirectory structure for a tag
      const relToCat = f.replace(fullPath + '/', '');
      const parts = relToCat.split('/');
      parts.pop(); // remove filename
      // The parent folder (or first subfolder) might be useful as a tag
      const tag = parts.length > 0 ? parts[parts.length - 1] : folderName.replace(/_/g, ' ');
      return { path: relPath, name: name, tag: tag };
    });
    data[catId] = { title: folderName.replace(/_/g, ' '), files: files };
  }
}

fs.writeFileSync('drawings_data.json', JSON.stringify(data, null, 2));
console.log('Done generating data');
