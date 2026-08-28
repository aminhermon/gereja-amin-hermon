/**
 * deploy.js — Membuat file ZIP siap deploy ke Hostinger
 * 
 * Jalankan: node deploy.js
 * Hasil: file 'deploy-hostinger.zip' di folder proyek
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_DIR = __dirname;
const OUTPUT_ZIP = path.join(PROJECT_DIR, 'deploy-hostinger.zip');

// File & folder yang TIDAK perlu di-upload
const EXCLUDE = [
  'node_modules',
  '.git',
  '.cache',
  'deploy-hostinger.zip',
  'deploy.js',
  'serve.ps1',
  'Mulai_Website.bat',
  'temp.html',
  'views.zip',
  'script.js',
  'update-db.js',
  'data/db.persisted.json',
  'data/snapshots',
];

// Kumpulkan semua file yang akan di-zip
function getAllFiles(dir, baseDir = dir) {
  let results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(baseDir, fullPath);
    
    // Skip excluded files/folders
    const topLevel = relativePath.split(path.sep)[0];
    if (EXCLUDE.includes(topLevel) || EXCLUDE.includes(entry.name)) continue;
    
    if (entry.isDirectory()) {
      results = results.concat(getAllFiles(fullPath, baseDir));
    } else {
      results.push(relativePath);
    }
  }
  return results;
}

console.log('📦 Membuat deployment package untuk Hostinger...\n');

// Build minified assets first
console.log('🔨 Building minified CSS & JS...');
try {
  execSync('node build.js', { cwd: PROJECT_DIR, stdio: 'inherit' });
} catch (e) {
  console.error('⚠️  Build gagal, melanjutkan tanpa build...');
}

// Collect files
const files = getAllFiles(PROJECT_DIR);
console.log(`\n📋 ${files.length} file akan di-package:`);

// Group by folder for display
const folders = {};
files.forEach(f => {
  const dir = path.dirname(f);
  if (!folders[dir]) folders[dir] = [];
  folders[dir].push(path.basename(f));
});
Object.keys(folders).sort().forEach(dir => {
  console.log(`   📁 ${dir === '.' ? '(root)' : dir}/  (${folders[dir].length} file)`);
});

// Create zip using PowerShell (available on Windows)
if (fs.existsSync(OUTPUT_ZIP)) {
  fs.unlinkSync(OUTPUT_ZIP);
}

// Write file list to temp file for PowerShell
const tempListFile = path.join(PROJECT_DIR, '_deploy_filelist.txt');
fs.writeFileSync(tempListFile, files.join('\n'), 'utf8');

const psScript = `
$projectDir = '${PROJECT_DIR.replace(/\\/g, '/')}'
$outputZip = '${OUTPUT_ZIP.replace(/\\/g, '/')}'
$fileList = Get-Content '${tempListFile.replace(/\\/g, '/')}'

Add-Type -AssemblyName System.IO.Compression.FileSystem

$zip = [System.IO.Compression.ZipFile]::Open($outputZip, 'Create')

foreach ($file in $fileList) {
  $fullPath = Join-Path $projectDir $file
  $entryName = $file -replace '\\\\', '/'
  if (Test-Path $fullPath -PathType Leaf) {
    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $fullPath, $entryName, 'Optimal') | Out-Null
  }
}

$zip.Dispose()
`;

const psFile = path.join(PROJECT_DIR, '_deploy_zip.ps1');
fs.writeFileSync(psFile, psScript, 'utf8');

try {
  execSync(`powershell -ExecutionPolicy Bypass -File "${psFile}"`, { stdio: 'inherit' });
  
  const stats = fs.statSync(OUTPUT_ZIP);
  const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
  
  console.log(`\n✅ Deployment package berhasil dibuat!`);
  console.log(`   📦 File: deploy-hostinger.zip`);
  console.log(`   📏 Ukuran: ${sizeMB} MB`);
  console.log(`\n🚀 Langkah selanjutnya:`);
  console.log(`   1. Login ke hPanel Hostinger`);
  console.log(`   2. Buka menu "Node.js" → Buat Aplikasi Baru`);
  console.log(`      - Application Startup File: app.js`);
  console.log(`      - Application Root: public_html (atau folder pilihan Anda)`);
  console.log(`   3. Buka File Manager → Upload "deploy-hostinger.zip"`);
  console.log(`   4. Klik kanan file zip → Extract`);
  console.log(`   5. Kembali ke menu Node.js → Klik "NPM Install"`);
  console.log(`   6. Klik "Start Application" / "Restart"`);
  console.log(`   7. Website Anda online! 🎉`);
  
} catch (e) {
  console.error('❌ Gagal membuat ZIP:', e.message);
} finally {
  // Cleanup temp files
  if (fs.existsSync(tempListFile)) fs.unlinkSync(tempListFile);
  if (fs.existsSync(psFile)) fs.unlinkSync(psFile);
}
