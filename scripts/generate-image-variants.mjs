// Generates WebP variants of every JPG/PNG in public/images/content at a set
// of responsive widths, plus a manifest (src/data/image-manifest.json) that
// OptimizedImage.astro reads to build <picture> markup with real srcset URLs.
//
// Idempotent: variants are skipped when they already exist and are newer than
// the source image. Run manually via `npm run images:generate` after adding
// new images, and commit the generated .webp files alongside the originals.
import { readdir, stat, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const CONTENT_DIR = 'public/images/content';
const MANIFEST_PATH = 'src/data/image-manifest.json';
const PUBLIC_PREFIX = '/images/content';
const CANDIDATE_WIDTHS = [480, 960, 1440, 1920];
const WEBP_QUALITY = 80;

const files = (await readdir(CONTENT_DIR)).filter((f) => /\.(jpe?g|png)$/i.test(f));
files.sort();

const manifest = {};
let generated = 0;
let skipped = 0;

for (const file of files) {
  const srcPath = path.join(CONTENT_DIR, file);
  const image = sharp(srcPath);
  const meta = await image.metadata();
  const { width, height } = meta;
  if (!width || !height) {
    console.warn(`skip (no dimensions): ${file}`);
    continue;
  }

  // Only downscale — never upscale past the intrinsic width.
  let widths = CANDIDATE_WIDTHS.filter((w) => w <= width);
  if (widths.length === 0) widths = [width];

  const base = file.replace(/\.(jpe?g|png)$/i, '');
  const srcStat = await stat(srcPath);
  const variants = [];

  for (const w of widths) {
    const variantFile = `${base}-${w}w.webp`;
    const variantPath = path.join(CONTENT_DIR, variantFile);
    let needsBuild = true;
    try {
      const vStat = await stat(variantPath);
      needsBuild = vStat.mtimeMs < srcStat.mtimeMs;
    } catch {
      needsBuild = true;
    }
    if (needsBuild) {
      await sharp(srcPath)
        .resize({ width: w, withoutEnlargement: true })
        .webp({ quality: WEBP_QUALITY })
        .toFile(variantPath);
      generated++;
    } else {
      skipped++;
    }
    variants.push(w);
  }

  manifest[`${PUBLIC_PREFIX}/${file}`] = { width, height, variants };
}

await mkdir(path.dirname(MANIFEST_PATH), { recursive: true });
await writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n');
console.log(
  `${files.length} images, ${generated} variants generated, ${skipped} up to date. Manifest: ${MANIFEST_PATH}`
);
