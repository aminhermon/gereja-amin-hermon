const fs = require('fs');
const path = require('path');

function checkPaths(obj, parent = '') {
  for (const k in obj) {
    const val = obj[k];
    if (typeof val === 'string' && (/\.(png|jpg|jpeg|webp|gif|mp4)$/i.test(val))) {
      const pubPath = path.join('public', val);
      const rootPath = val;
      const exists = fs.existsSync(pubPath) || fs.existsSync(rootPath);
      if (!exists) {
        console.log('❌ MISSING:', parent + '.' + k, '=', val);
      } else {
        console.log('✅ OK:', parent + '.' + k, '=', val);
      }
    } else if (typeof val === 'object' && val !== null) {
      checkPaths(val, parent ? parent + '.' + k : k);
    }
  }
}

const db = JSON.parse(fs.readFileSync('data/db.json', 'utf8'));
checkPaths(db);
