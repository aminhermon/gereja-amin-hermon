/**
 * Build script: Minify CSS and JS files
 * Run: node build.js
 */
const fs = require('fs');
const path = require('path');
const CleanCSS = require('clean-css');
const { minify } = require('terser');

async function build() {
  console.log('🔨 Building minified assets...\n');

  // Minify CSS
  const cssDir = path.join(__dirname, 'public', 'css');
  const cssFiles = fs.readdirSync(cssDir).filter(f => f.endsWith('.css') && !f.endsWith('.min.css'));
  for (const file of cssFiles) {
    const src = fs.readFileSync(path.join(cssDir, file), 'utf8');
    const result = new CleanCSS({ level: 1 }).minify(src);
    const minName = file.replace('.css', '.min.css');
    fs.writeFileSync(path.join(cssDir, minName), result.styles);
    const saved = ((1 - result.stats.minifiedSize / result.stats.originalSize) * 100).toFixed(1);
    console.log(`  ✅ CSS: ${file} → ${minName} (${saved}% smaller)`);
  }

  // Minify JS
  const jsDir = path.join(__dirname, 'public', 'js');
  if (fs.existsSync(jsDir)) {
    const jsFiles = fs.readdirSync(jsDir).filter(f => f.endsWith('.js') && !f.endsWith('.min.js'));
    for (const file of jsFiles) {
      const src = fs.readFileSync(path.join(jsDir, file), 'utf8');
      const result = await minify(src, { compress: true, mangle: true });
      if (result.code) {
        const minName = file.replace('.js', '.min.js');
        fs.writeFileSync(path.join(jsDir, minName), result.code);
        const saved = ((1 - result.code.length / src.length) * 100).toFixed(1);
        console.log(`  ✅ JS:  ${file} → ${minName} (${saved}% smaller)`);
      }
    }
  }

  console.log('\n🎉 Build complete!');
}

build().catch(console.error);
