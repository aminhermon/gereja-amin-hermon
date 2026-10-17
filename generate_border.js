const fs = require('fs');
const sharp = require('sharp');

function createNiasBorderSVG(unitCount = 3) {
  const period = 72;
  const width = period * unitCount;
  const height = 266;

  // Authentic Nias colors from user image
  const cYellow = '#FFDE00';
  const cRed = '#EE1C25';
  const cBlack = '#141414';
  const cOrange = '#E85B00';

  let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <!-- Single 4-petal flower with dark center dot (Ni'obowo) -->
    <g id="flower">
      <circle cx="0" cy="-2.5" r="2.1" fill="${cYellow}" />
      <circle cx="0" cy="2.5" r="2.1" fill="${cYellow}" />
      <circle cx="-2.5" cy="0" r="2.1" fill="${cYellow}" />
      <circle cx="2.5" cy="0" r="2.1" fill="${cYellow}" />
      <circle cx="0" cy="0" r="0.8" fill="${cBlack}" />
    </g>

    <!-- Cluster of 3 flowers in a V (upper notch) -->
    <g id="flower-v-upper">
      <use href="#flower" x="0" y="0"/>
      <use href="#flower" x="-5.5" y="-6.5"/>
      <use href="#flower" x="5.5" y="-6.5"/>
    </g>

    <!-- Cluster of 3 flowers in inverted V (lower notch) -->
    <g id="flower-v-lower">
      <use href="#flower" x="0" y="0"/>
      <use href="#flower" x="-5.5" y="6.5"/>
      <use href="#flower" x="5.5" y="6.5"/>
    </g>
  </defs>

  <!-- ==================== BAND 1: TOP WAVE ==================== -->
  <rect x="0" y="0" width="${width}" height="30" fill="${cYellow}"/>
`;

  // Place waves in Band 1
  for (let i = 0; i < unitCount * 3; i++) {
    const x = i * 24;
    const d = `
      M ${x} 20
      C ${x + 5} 21.5, ${x + 11} 20, ${x + 16} 14.5
      C ${x + 18.5} 11.5, ${x + 19.5} 8, ${x + 21.5} 8.5
      C ${x + 23} 9.2, ${x + 23} 11.5, ${x + 21} 13.5
      C ${x + 19} 15.5, ${x + 16.5} 15, ${x + 15} 13
      C ${x + 14} 11.5, ${x + 15} 9.5, ${x + 17} 9.5
      C ${x + 18.5} 9.5, ${x + 19} 10.8, ${x + 18} 11.8
      C ${x + 17} 12.5, ${x + 15.8} 12, ${x + 15.5} 11
      C ${x + 15} 9.5, ${x + 17} 7, ${x + 20} 7.5
      C ${x + 23} 8, ${x + 25} 12, ${x + 21.5} 15
      C ${x + 18} 18.5, ${x + 12} 21, ${x + 5} 21
      L ${x} 20.5 Z
      M ${x} 20
      C ${x + 6} 21.5, ${x + 14} 19.5, ${x + 18.5} 15.5
      C ${x + 21.5} 13, ${x + 23} 15, ${x + 24} 20
      L ${x + 24} 23.5
      C ${x + 22.5} 20, ${x + 20} 18, ${x + 17} 19.5
      C ${x + 13} 21.5, ${x + 6} 23.5, ${x} 23.5 Z
    `;
    svg += `  <path d="${d}" fill="${cRed}"/>\n`;
  }

  // Thin black divider line
  svg += `  <rect x="0" y="29.5" width="${width}" height="1" fill="${cBlack}"/>\n`;

  // ==================== BAND 2: UPPER DIAMOND BAND ====================
  svg += `  <!-- Band 2: Upper Diamond Band -->\n`;
  svg += `  <rect x="0" y="30" width="${width}" height="58" fill="${cBlack}"/>\n`;

  for (let i = -1; i <= unitCount; i++) {
    const cx = i * period + period / 2;
    const cy = 59;
    const rx = period / 2; // 36
    const ry = 27;

    svg += `  <polygon points="${cx-rx},${cy} ${cx},${cy-ry} ${cx+rx},${cy} ${cx},${cy+ry}" fill="${cRed}" stroke="${cYellow}" stroke-width="4.5" stroke-linejoin="miter"/>\n`;
    svg += `  <polygon points="${cx-rx+3.5},${cy} ${cx},${cy-ry+2.5} ${cx+rx-3.5},${cy} ${cx},${cy+ry-2.5}" fill="none" stroke="${cOrange}" stroke-width="0.8" opacity="0.6"/>\n`;

    const jx = cx + rx;
    svg += `  <use href="#flower-v-upper" x="${jx}" y="44"/>\n`;
    svg += `  <use href="#flower-v-lower" x="${jx}" y="74"/>\n`;
  }

  // ==================== BAND 3: RED SEPARATOR ====================
  svg += `  <!-- Band 3: Red Separator -->\n`;
  svg += `  <rect x="0" y="88" width="${width}" height="11" fill="${cRed}"/>\n`;

  // ==================== BAND 4: MIDDLE DIAMOND BAND ====================
  svg += `  <!-- Band 4: Middle Diamond Band -->\n`;
  svg += `  <rect x="0" y="99" width="${width}" height="68" fill="${cYellow}"/>\n`;

  for (let i = -1; i <= unitCount + 1; i++) {
    const cx = i * period;
    const cy = 133;
    const rx = period / 2; // 36
    const ry = 32;
    svg += `  <polygon points="${cx-rx},${cy} ${cx},${cy-ry} ${cx+rx},${cy} ${cx},${cy+ry}" fill="${cBlack}"/>\n`;
  }

  // ==================== BAND 5: RED SEPARATOR ====================
  svg += `  <!-- Band 5: Red Separator -->\n`;
  svg += `  <rect x="0" y="167" width="${width}" height="11" fill="${cRed}"/>\n`;

  // ==================== BAND 6: LOWER DIAMOND BAND ====================
  svg += `  <!-- Band 6: Lower Diamond Band -->\n`;
  svg += `  <rect x="0" y="178" width="${width}" height="58" fill="${cBlack}"/>\n`;

  for (let i = -1; i <= unitCount; i++) {
    const cx = i * period + period / 2;
    const cy = 207;
    const rx = period / 2;
    const ry = 27;

    svg += `  <polygon points="${cx-rx},${cy} ${cx},${cy-ry} ${cx+rx},${cy} ${cx},${cy+ry}" fill="${cRed}" stroke="${cYellow}" stroke-width="4.5" stroke-linejoin="miter"/>\n`;
    svg += `  <polygon points="${cx-rx+3.5},${cy} ${cx},${cy-ry+2.5} ${cx+rx-3.5},${cy} ${cx},${cy+ry-2.5}" fill="none" stroke="${cOrange}" stroke-width="0.8" opacity="0.6"/>\n`;

    const jx = cx + rx;
    svg += `  <use href="#flower-v-upper" x="${jx}" y="192"/>\n`;
    svg += `  <use href="#flower-v-lower" x="${jx}" y="222"/>\n`;
  }

  // ==================== BAND 7: BOTTOM WAVE ====================
  svg += `  <!-- Band 7: Bottom Wave -->\n`;
  svg += `  <rect x="0" y="235.5" width="${width}" height="1" fill="${cBlack}"/>\n`;
  svg += `  <rect x="0" y="236" width="${width}" height="30" fill="${cYellow}"/>\n`;

  const yBase = 236;
  for (let i = 0; i < unitCount * 3; i++) {
    const x = i * 24;
    const d = `
      M ${x} ${yBase + 20}
      C ${x + 5} ${yBase + 21.5}, ${x + 11} ${yBase + 20}, ${x + 16} ${yBase + 14.5}
      C ${x + 18.5} ${yBase + 11.5}, ${x + 19.5} ${yBase + 8}, ${x + 21.5} ${yBase + 8.5}
      C ${x + 23} ${yBase + 9.2}, ${x + 23} ${yBase + 11.5}, ${x + 21} ${yBase + 13.5}
      C ${x + 19} ${yBase + 15.5}, ${x + 16.5} ${yBase + 15}, ${x + 15} ${yBase + 13}
      C ${x + 14} ${yBase + 11.5}, ${x + 15} ${yBase + 9.5}, ${x + 17} ${yBase + 9.5}
      C ${x + 18.5} ${yBase + 9.5}, ${x + 19} ${yBase + 10.8}, ${x + 18} ${yBase + 11.8}
      C ${x + 17} ${yBase + 12.5}, ${x + 15.8} ${yBase + 12}, ${x + 15.5} ${yBase + 11}
      C ${x + 15} ${yBase + 9.5}, ${x + 17} ${yBase + 7}, ${x + 20} ${yBase + 7.5}
      C ${x + 23} ${yBase + 8}, ${x + 25} ${yBase + 12}, ${x + 21.5} ${yBase + 15}
      C ${x + 18} ${yBase + 18.5}, ${x + 12} ${yBase + 21}, ${x + 5} ${yBase + 21}
      L ${x} ${yBase + 20.5} Z
      M ${x} ${yBase + 20}
      C ${x + 6} ${yBase + 21.5}, ${x + 14} ${yBase + 19.5}, ${x + 18.5} ${yBase + 15.5}
      C ${x + 21.5} ${yBase + 13}, ${x + 23} ${yBase + 15}, ${x + 24} ${yBase + 20}
      L ${x + 24} ${yBase + 23.5}
      C ${x + 22.5} ${yBase + 20}, ${x + 20} ${yBase + 18}, ${x + 17} ${yBase + 19.5}
      C ${x + 13} ${yBase + 21.5}, ${x + 6} ${yBase + 23.5}, ${x} ${yBase + 23.5} Z
    `;
    svg += `  <path d="${d}" fill="${cRed}"/>\n`;
  }

  svg += '</svg>\n';
  return svg;
}

// 1-unit seamless repeat (width 72, height 266)
const svgTile = createNiasBorderSVG(1);
// 12-unit full horizontal strip (width 864, height 266)
const svgWide = createNiasBorderSVG(12);

fs.writeFileSync('public/assets/images/nias-border.svg', svgTile);
fs.writeFileSync('public/assets/images/nias-border-full.svg', svgWide);

// Render an 800px wide ribbon at height 48px to test real-world rendering
sharp(Buffer.from(svgWide))
  .resize({ width: 864, height: 48, fit: 'fill' })
  .png()
  .toFile('C:/Users/LENOVO/.gemini/antigravity-ide/scratch/test_ribbon_48px.png')
  .then(() => console.log('Successfully generated wide ribbon test!'));
