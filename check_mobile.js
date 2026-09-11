/**
 * Diagnostic script: Check all possible causes of images not showing on mobile
 */
const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'public', 'css', 'style.css');
const css = fs.readFileSync(cssPath, 'utf8');

console.log('=== MOBILE IMAGE VISIBILITY DIAGNOSTIC ===\n');

// 1. Check for any CSS that hides images within media queries
console.log('--- 1. Checking for image-hiding CSS in mobile media queries ---');
const mediaBlocks = [];
let depth = 0;
let blockStart = -1;
for (let i = 0; i < css.length; i++) {
  if (css.substring(i, i + 6) === '@media') {
    const lineStart = css.lastIndexOf('\n', i) + 1;
    const lineEnd = css.indexOf('\n', i);
    const mediaLine = css.substring(lineStart, lineEnd).trim();
    if (/max-width:\s*(768|480|576|360)/i.test(mediaLine)) {
      // Find the opening brace
      const braceIdx = css.indexOf('{', i);
      let braceDepth = 1;
      let j = braceIdx + 1;
      while (j < css.length && braceDepth > 0) {
        if (css[j] === '{') braceDepth++;
        if (css[j] === '}') braceDepth--;
        j++;
      }
      const block = css.substring(braceIdx + 1, j - 1);
      // Check for anything that could hide images
      if (/img|image|photo|\.hero__bg|\.carousel|\.leader|\.gallery/i.test(block)) {
        // Check for hiding rules
        const lines = block.split('\n');
        lines.forEach((line, idx) => {
          if (/display\s*:\s*none|visibility\s*:\s*hidden|height\s*:\s*0|max-height\s*:\s*0|overflow\s*:\s*hidden/i.test(line)) {
            // Get context (the selector)
            let selector = '';
            for (let k = idx - 1; k >= 0; k--) {
              if (lines[k].includes('{')) {
                selector = lines[k].trim();
                break;
              }
            }
            if (/img|image|photo|hero|carousel|leader|gallery/i.test(selector) || /img|image|photo|hero|carousel|leader|gallery/i.test(line)) {
              console.log(`  ⚠️  ${mediaLine}`);
              console.log(`      Selector: ${selector}`);
              console.log(`      Rule: ${line.trim()}`);
            }
          }
        });
      }
    }
  }
}

// 2. Check image dimensions and file sizes  
console.log('\n--- 2. Image file sizes (large files may not load on mobile) ---');
const imgDirs = [
  path.join(__dirname, 'public', 'assets', 'images'),
  path.join(__dirname, 'uploads')
];
imgDirs.forEach(dir => {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir).filter(f => /\.(png|jpg|jpeg|webp|gif)$/i.test(f));
  files.forEach(f => {
    const stats = fs.statSync(path.join(dir, f));
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    const icon = stats.size > 500 * 1024 ? '⚠️ ' : '✅';
    console.log(`  ${icon} ${path.relative(__dirname, path.join(dir, f))} — ${sizeMB} MB`);
  });
});

// 3. Check carousel img height conflict
console.log('\n--- 3. CSS height conflicts on img ---');
const globalImgMatch = css.match(/^img\s*\{[^}]+\}/m);
if (globalImgMatch) {
  console.log('  Global img rule:', globalImgMatch[0].replace(/\s+/g, ' '));
}
const carouselImgMatch = css.match(/\.carousel__list\s+\.carousel__item\s+img\s*\{[^}]+\}/);
if (carouselImgMatch) {
  console.log('  Carousel img rule:', carouselImgMatch[0].replace(/\s+/g, ' '));
}
const heroImgMatch = css.match(/\.hero__bg\s+img[^{]*\{[^}]+\}/);
if (heroImgMatch) {
  console.log('  Hero img rule:', heroImgMatch[0].replace(/\s+/g, ' '));
}

// 4. Check leader-card__img for missing height
console.log('\n--- 4. Leader card image container ---');
const leaderImgMatch = css.match(/\.leader-card__img\s*\{[^}]+\}/);
if (leaderImgMatch) {
  const rule = leaderImgMatch[0];
  const hasHeight = /height/i.test(rule);
  const hasAspect = /aspect-ratio/i.test(rule);
  console.log('  Rule:', rule.replace(/\s+/g, ' '));
  console.log('  Has height:', hasHeight, '| Has aspect-ratio:', hasAspect);
  if (!hasHeight && !hasAspect) {
    console.log('  ⚠️  Container has NO height/aspect-ratio — may collapse if image fails to load');
  }
}

// 5. Check loading attributes in EJS files
console.log('\n--- 5. Image loading attributes in EJS files ---');
const viewsDir = path.join(__dirname, 'views');
function scanDir(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  files.forEach(f => {
    if (f.isDirectory()) {
      scanDir(path.join(dir, f.name));
    } else if (f.name.endsWith('.ejs')) {
      const content = fs.readFileSync(path.join(dir, f.name), 'utf8');
      const imgMatches = content.match(/<img[^>]+>/g) || [];
      imgMatches.forEach(tag => {
        const loading = tag.match(/loading="([^"]+)"/);
        const src = tag.match(/src="([^"]+)"/);
        const loadVal = loading ? loading[1] : 'default';
        console.log(`  ${f.name}: loading="${loadVal}" src="${src ? src[1].substring(0, 50) : '?'}"`);
      });
    }
  });
}
scanDir(viewsDir);

// 6. Check for potential aspect-ratio browser support issues
console.log('\n--- 6. aspect-ratio usage (may not work on older mobile browsers) ---');
const aspectRatioMatches = css.match(/aspect-ratio[^;]+;/g) || [];
aspectRatioMatches.forEach(m => console.log('  Found:', m.trim()));

console.log('\n=== DIAGNOSTIC COMPLETE ===');
