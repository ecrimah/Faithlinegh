/**
 * Optimize generated store imagery in public/ for fast web delivery.
 * Resizes to sensible max dimensions and re-encodes with compression.
 *
 * Usage: node scripts/optimize-images.mjs
 */
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const PUB = 'public';

const TARGETS = [
  { file: 'hero-1.png', w: 1600, format: 'png' },
  { file: 'hero-2.png', w: 1600, format: 'png' },
  { file: 'category-bags.png', w: 900, format: 'png' },
  { file: 'category-dresses.png', w: 900, format: 'png' },
  { file: 'category-basics.png', w: 900, format: 'png' },
  { file: 'wishlist.jpeg', w: 1600, format: 'jpeg' },
];

async function optimize({ file, w, format }) {
  const p = path.join(PUB, file);
  if (!fs.existsSync(p)) {
    console.warn(`skip (missing): ${file}`);
    return;
  }
  const before = fs.statSync(p).size;
  const buf = fs.readFileSync(p);
  let pipeline = sharp(buf).resize({ width: w, withoutEnlargement: true });

  if (format === 'jpeg') {
    pipeline = pipeline.jpeg({ quality: 82, mozjpeg: true });
  } else {
    pipeline = pipeline.png({ quality: 80, compressionLevel: 9, palette: true });
  }

  const out = await pipeline.toBuffer();
  fs.writeFileSync(p, out);
  const after = fs.statSync(p).size;
  console.log(
    `${file}: ${Math.round(before / 1024)}KB -> ${Math.round(after / 1024)}KB`
  );
}

for (const t of TARGETS) {
  await optimize(t);
}
console.log('Done.');
