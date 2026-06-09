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

// Photographic assets: resize to a sensible max width and re-encode.
// `png` targets keep transparency where needed; photos use tuned PNG palette.
const TARGETS = [
  { file: 'hero-1.png', w: 1600, format: 'png' },
  { file: 'hero-2.png', w: 1600, format: 'png' },
  { file: 'category-bags.png', w: 900, format: 'png' },
  { file: 'category-dresses.png', w: 900, format: 'png' },
  { file: 'category-basics.png', w: 900, format: 'png' },
  { file: 'about-lifestyle.png', w: 1000, format: 'png' },
  { file: 'about-brand.png', w: 1000, format: 'png' },
  { file: 'about-founder.png', w: 1000, format: 'png' },
  { file: 'home-cta-brand.png', w: 1000, format: 'png' },
  { file: 'home-cta-fashion.png', w: 1000, format: 'png' },
  { file: 'og-image.png', w: 1200, format: 'png' },
  { file: 'twitter-image.png', w: 1200, format: 'png' },
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
    pipeline = pipeline.png({ quality: 78, compressionLevel: 9, palette: true, effort: 9 });
  }

  const out = await pipeline.toBuffer();
  // Only write if we actually saved bytes.
  if (out.length < before) {
    fs.writeFileSync(p, out);
  }
  const after = fs.statSync(p).size;
  console.log(
    `${file}: ${Math.round(before / 1024)}KB -> ${Math.round(after / 1024)}KB`
  );
}

for (const t of TARGETS) {
  await optimize(t);
}
console.log('Done.');
