// Helpers for OptimizedImage.astro, backed by the manifest produced by
// scripts/generate-image-variants.mjs. Every srcset URL returned here points
// at a real .webp file committed in public/images/content.
import manifest from '../data/image-manifest.json';

export interface ImageManifestEntry {
  width: number;
  height: number;
  variants: number[];
}

const imageManifest = manifest as Record<string, ImageManifestEntry>;

/**
 * Look up intrinsic dimensions and available WebP widths for a public image
 * path (e.g. "/images/content/Aab6e6c.jpg"). Returns undefined for images
 * outside the generated set — OptimizedImage falls back to a plain <img>.
 */
export function getImageEntry(src: string): ImageManifestEntry | undefined {
  return imageManifest[src];
}

/**
 * Build a WebP srcset string from the manifest variants of an image.
 */
export function getWebPSrcSet(src: string, entry: ImageManifestEntry): string {
  const extension = src.split('.').pop();
  const baseName = src.slice(0, -(extension!.length + 1));
  return entry.variants.map((w) => `${baseName}-${w}w.webp ${w}w`).join(', ');
}
