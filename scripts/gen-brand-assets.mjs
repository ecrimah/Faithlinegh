/**
 * Generate the full brand asset set (favicon, PWA icons, Apple touch icon,
 * logo variants, OG/Twitter share images) from a single source logo.
 *
 * Usage: node scripts/gen-brand-assets.mjs
 */
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// Master source logo lives in the repo so assets can always be regenerated.
// Replace brand/logo-source.png with a new logo and re-run this script.
const SRC = process.env.BRAND_LOGO_SRC || 'brand/logo-source.png';

const PUB = 'public';
const ICONS = path.join(PUB, 'icons');
fs.mkdirSync(ICONS, { recursive: true });

const WHITE = { r: 255, g: 255, b: 255, alpha: 1 };
const CREAM = { r: 251, g: 248, b: 241, alpha: 1 };

if (!fs.existsSync(SRC)) {
  console.error('Source image not found:', SRC);
  process.exit(1);
}

/** Square icon with solid background and optional safe-zone padding. */
async function squareIcon(size, file, { padRatio = 0.06, bg = WHITE } = {}) {
  const inner = Math.max(1, Math.round(size * (1 - padRatio * 2)));
  const logo = await sharp(SRC)
    .resize(inner, inner, { fit: 'contain', background: { r: bg.r, g: bg.g, b: bg.b, alpha: 0 } })
    .png()
    .toBuffer();
  const pad = Math.round((size - inner) / 2);
  await sharp({ create: { width: size, height: size, channels: 4, background: bg } })
    .composite([{ input: logo, top: pad, left: pad }])
    .png()
    .toFile(file);
  console.log('  ✓', file);
}

/** Rounded-corner white badge logo (for dark backgrounds e.g. footer). */
async function whiteBadge(file, width = 560) {
  const meta = await sharp(SRC).metadata();
  const ratio = (meta.height || width) / (meta.width || width);
  const height = Math.round(width * ratio);
  const radius = Math.round(Math.min(width, height) * 0.08);
  const padded = await sharp(SRC)
    .resize(Math.round(width * 0.92), Math.round(height * 0.92), {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 0 },
    })
    .extend({
      top: Math.round(height * 0.04),
      bottom: Math.round(height * 0.04),
      left: Math.round(width * 0.04),
      right: Math.round(width * 0.04),
      background: { r: 255, g: 255, b: 255, alpha: 0 },
    })
    .flatten({ background: WHITE })
    .png()
    .toBuffer();
  const mask = Buffer.from(
    `<svg width="${width}" height="${height}"><rect x="0" y="0" width="${width}" height="${height}" rx="${radius}" ry="${radius}" fill="#fff"/></svg>`
  );
  await sharp(padded)
    .resize(width, height, { fit: 'fill' })
    .composite([{ input: mask, blend: 'dest-in' }])
    .png()
    .toFile(file);
  console.log('  ✓', file);
}

/** Transparent-friendly primary logo (for light backgrounds e.g. header). */
async function primaryLogo(file, width = 560) {
  const meta = await sharp(SRC).metadata();
  const ratio = (meta.height || width) / (meta.width || width);
  await sharp(SRC)
    .resize(width, Math.round(width * ratio), { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(file);
  console.log('  ✓', file);
}

/** Social share card (Open Graph / Twitter), 1200x630. */
async function shareCard(file) {
  const W = 1200;
  const H = 630;
  const logo = await sharp(SRC)
    .resize(560, 520, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  const meta = await sharp(logo).metadata();
  const left = Math.round((W - (meta.width || 560)) / 2);
  const top = Math.round((H - (meta.height || 520)) / 2);
  await sharp({ create: { width: W, height: H, channels: 4, background: CREAM } })
    .composite([{ input: logo, top, left }])
    .png()
    .toFile(file);
  console.log('  ✓', file);
}

/** Minimal ICO encoder embedding PNG frames (supported by modern browsers). */
async function favicon(file, sizes = [16, 32, 48]) {
  const pngs = [];
  for (const s of sizes) {
    const buf = await sharp(SRC)
      .resize(s, s, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .flatten({ background: WHITE })
      .png()
      .toBuffer();
    pngs.push({ size: s, buf });
  }
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(pngs.length, 4);

  const entries = [];
  let offset = 6 + pngs.length * 16;
  for (const { size, buf } of pngs) {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0);
    e.writeUInt8(size >= 256 ? 0 : size, 1);
    e.writeUInt8(0, 2);
    e.writeUInt8(0, 3);
    e.writeUInt16LE(1, 4);
    e.writeUInt16LE(32, 6);
    e.writeUInt32LE(buf.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += buf.length;
    entries.push(e);
  }
  fs.writeFileSync(file, Buffer.concat([header, ...entries, ...pngs.map((p) => p.buf)]));
  console.log('  ✓', file);
}

async function main() {
  const meta = await sharp(SRC).metadata();
  console.log(`Source: ${meta.width}x${meta.height}, alpha=${meta.hasAlpha}`);

  console.log('Logos:');
  await primaryLogo(path.join(PUB, 'logo.png'));
  await whiteBadge(path.join(PUB, 'logo-white.png'));

  console.log('Favicons:');
  await favicon(path.join(PUB, 'favicon.ico'));
  await squareIcon(64, path.join(PUB, 'favicon.png'), { padRatio: 0.04 });
  await squareIcon(180, path.join(PUB, 'apple-touch-icon.png'), { padRatio: 0.08 });

  console.log('PWA icons:');
  for (const s of [72, 96, 128, 144, 152, 192, 384, 512]) {
    await squareIcon(s, path.join(ICONS, `icon-${s}x${s}.png`), { padRatio: 0.06 });
  }
  for (const s of [192, 512]) {
    await squareIcon(s, path.join(ICONS, `icon-maskable-${s}x${s}.png`), { padRatio: 0.2 });
  }

  console.log('Share cards:');
  await shareCard(path.join(PUB, 'og-image.png'));
  await shareCard(path.join(PUB, 'twitter-image.png'));

  console.log('Done.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
