# Asset Replacement Guide

All original project images have been removed from this directory. Add your own
assets using the paths below — the code already references these filenames.

## Required Assets to Add

| File | Size | Purpose |
|------|------|---------|
| `/public/favicon.ico` | 32×32px | Browser tab icon |
| `/public/favicon.png` | 64×64px | PNG favicon |
| `/public/apple-touch-icon.png` | 180×180px | iOS home screen |
| `/public/icons/icon-72x72.png` … `icon-512x512.png` | various | PWA icons (see `manifest.json`) |
| `/public/icons/icon-maskable-192x192.png`, `icon-maskable-512x512.png` | 192 / 512px | Maskable PWA icons |
| `/public/logo.png` | ~ | Main brand logo (header, admin, PWA) |
| `/public/logo-white.png` | ~ | Logo for dark backgrounds (footer) |
| `/public/og-image.png` | 1200×630px | Social share preview (Open Graph) |
| `/public/twitter-image.png` | 1200×630px | Twitter card image |
| `/public/hero-1.png`, `/public/hero-2.png` | 1920×1080px | Homepage / about / hero sections |
| `/public/wishlist.jpeg` | banner | Wishlist page hero |
| `/public/category-bags.png`, `category-dresses.png`, `category-basics.png` | 800×800px | Homepage "Shop by category" fallback tiles |

A generic `placeholder-product.svg` is included and used by demo/sample data.
Replace it (and the demo data) with your real product images.

> Branded fashion imagery (hero, wishlist, category tiles) has been generated
> and is already in place. Regenerate or replace these files anytime to refresh
> the look; run `node scripts/optimize-images.mjs` afterwards to compress them.

## Tools
- Favicon generator: https://realfavicongenerator.net
- OG image creator: https://og-playground.vercel.app
- Image optimization: https://squoosh.app
