/**
 * One-off asset pipeline: converts the raw AI-generated PNGs (source dir
 * passed as argv[2]) into web-optimized assets in public/assets.
 *
 *   node scripts/optimize-images.mjs <source-dir>
 */
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const src = process.argv[2];
if (!src) {
  console.error('Usage: node scripts/optimize-images.mjs <source-dir>');
  process.exit(1);
}

const out = path.resolve('public/assets');
await mkdir(out, { recursive: true });

const jobs = [
  // hero backdrop + video poster + og fallback
  { in: 'hero.png', out: 'hero.webp', width: 2560, format: 'webp', quality: 80 },
  { in: 'hero.png', out: 'hero-sm.webp', width: 1080, format: 'webp', quality: 76 },
  { in: 'hero.png', out: 'hero-poster.jpg', width: 1600, format: 'jpeg', quality: 72 },
  // who we are — portrait lobby
  { in: 'about.png', out: 'about.webp', width: 1200, format: 'webp', quality: 80 },
  // oversight — guilloché macro texture
  { in: 'guilloche.png', out: 'guilloche.webp', width: 1600, format: 'webp', quality: 76 },
  // reach us — office at dusk
  { in: 'office.png', out: 'office.webp', width: 1600, format: 'webp', quality: 80 },
  // social card (1200×630 centre crop)
  { in: 'abstract.png', out: 'og.jpg', width: 1200, height: 630, format: 'jpeg', quality: 80 },
];

for (const j of jobs) {
  const pipe = sharp(path.join(src, j.in)).resize({
    width: j.width,
    height: j.height,
    fit: j.height ? 'cover' : 'inside',
    position: 'attention',
  });
  const done =
    j.format === 'webp'
      ? pipe.webp({ quality: j.quality })
      : pipe.jpeg({ quality: j.quality, mozjpeg: true });
  const info = await done.toFile(path.join(out, j.out));
  console.log(`${j.out}  ${info.width}x${info.height}  ${(info.size / 1024).toFixed(0)} KB`);
}
console.log('done');
