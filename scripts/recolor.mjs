/**
 * One-off codemod: replace the old dark-brown/gold brand hex values with the
 * new soft blush / nude palette across the source tree. Tailwind tokens are
 * updated separately in tailwind.config.js; this handles arbitrary classes
 * (e.g. bg-[#2C1D00]) and inline styles.
 *
 * Usage: node scripts/recolor.mjs
 */
import fs from 'fs';
import path from 'path';

const MAP = {
  '#2C1D00': '#3D2B21', // espresso (primary dark)
  '#3D2A00': '#5A4234', // espresso gradient end
  '#AB9462': '#A8826B', // mocha taupe (carton)
  '#FFCC00': '#C9A24B', // champagne gold
  '#9A1900': '#9A4A36', // terracotta red (sale)
  '#FFFFCC': '#FAF3EE', // pale blush tint
  '#996633': '#8C6A52', // deep taupe
  '#FF6666': '#D98E73', // muted terracotta (coral)
  '#FFCCCC': '#F3DBCF', // blush pink
  '#FF9999': '#E3B9A6', // dusty rose
};

const ROOTS = ['app', 'components', 'context', 'hooks', 'lib'];
const EXTS = new Set(['.ts', '.tsx', '.js', '.jsx', '.css', '.mjs']);

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (EXTS.has(path.extname(entry.name))) files.push(full);
  }
  return files;
}

// Build a single case-insensitive regex for all source hex codes.
const pattern = new RegExp(
  Object.keys(MAP)
    .map((h) => h.replace('#', '#'))
    .join('|'),
  'gi'
);
const lookup = Object.fromEntries(Object.entries(MAP).map(([k, v]) => [k.toUpperCase(), v]));

let totalFiles = 0;
let totalRepl = 0;
const perColor = {};

for (const root of ROOTS) {
  if (!fs.existsSync(root)) continue;
  for (const file of walk(root)) {
    const src = fs.readFileSync(file, 'utf8');
    let count = 0;
    const out = src.replace(pattern, (m) => {
      const rep = lookup[m.toUpperCase()];
      if (!rep) return m;
      count++;
      perColor[m.toUpperCase()] = (perColor[m.toUpperCase()] || 0) + 1;
      // Preserve original case style (new values are uppercase hex).
      return rep;
    });
    if (count > 0) {
      fs.writeFileSync(file, out);
      totalFiles++;
      totalRepl += count;
    }
  }
}

console.log('Replacements per color:');
for (const [k, v] of Object.entries(perColor).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${k} -> ${lookup[k]}  (${v})`);
}
console.log(`\nFiles changed: ${totalFiles}, total replacements: ${totalRepl}`);
