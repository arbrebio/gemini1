// Image optimization utilities for responsive images and modern formats
export interface ImageConfig {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  loading?: 'lazy' | 'eager';
  fetchpriority?: 'high' | 'low' | 'auto';
  sizes?: string;
  className?: string;
}

export interface ResponsiveImageSizes {
  small: number;
  medium: number;
  large: number;
  xlarge: number;
}

const defaultSizes: ResponsiveImageSizes = {
  small: 400,
  medium: 800,
  large: 1200,
  xlarge: 1920
};

/**
 * Generate srcset for responsive images
 */
export function generateSrcSet(baseUrl: string, sizes: ResponsiveImageSizes = defaultSizes): string {
  const srcsetEntries = Object.entries(sizes).map(([key, width]) => {
    // For external URLs (like Imgur), we can't generate different sizes
    // In a real implementation, you'd use an image CDN or pre-generated sizes
    if (baseUrl.includes('imgur.com') || baseUrl.includes('unsplash.com')) {
      return `${baseUrl} ${width}w`;
    }
    
    // For local images, assume different sizes exist
    const extension = baseUrl.split('.').pop();
    const baseName = baseUrl.replace(`.${extension}`, '');
    return `${baseName}-${width}w.${extension} ${width}w`;
  });
  
  return srcsetEntries.join(', ');
}

/**
 * Generate sizes attribute for responsive images
 */
export function generateSizes(breakpoints?: string[]): string {
  const defaultBreakpoints = [
    '(max-width: 640px) 100vw',
    '(max-width: 1024px) 80vw',
    '(max-width: 1280px) 60vw',
    '1200px'
  ];
  
  return (breakpoints || defaultBreakpoints).join(', ');
}

/**
 * Optimize image URL for better performance
 */
export function optimizeImageUrl(url: string, width?: number, quality: number = 85): string {
  if (!url) return '';
  
  // Handle Unsplash images
  if (url.includes('unsplash.com')) {
    const urlObj = new URL(url);
    if (width) urlObj.searchParams.set('w', width.toString());
    urlObj.searchParams.set('q', quality.toString());
    urlObj.searchParams.set('auto', 'format');
    return urlObj.toString();
  }
  
  // Handle Imgur images (limited optimization options)
  if (url.includes('imgur.com')) {
    // Imgur has some size modifiers, but limited
    return url;
  }
  
  return url;
}

/**
 * Check if image URL is valid and accessible
 */
export async function validateImageUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Generate WebP alternative URL
 */
export function getWebPUrl(url: string): string {
  if (url.includes('unsplash.com')) {
    const urlObj = new URL(url);
    urlObj.searchParams.set('fm', 'webp');
    return urlObj.toString();
  }
  
  // For other sources, assume WebP version exists
  return url.replace(/\.(jpg|jpeg|png)$/i, '.webp');
}

/**
 * Create picture element markup for modern image formats
 */
export function createPictureMarkup(config: ImageConfig): string {
  const webpUrl = getWebPUrl(config.src);
  const srcset = config.sizes ? generateSrcSet(config.src) : undefined;
  
  return `
    <picture>
      <source srcset="${webpUrl}" type="image/webp" ${srcset ? `sizes="${config.sizes}"` : ''} />
      <img
        src="${config.src}"
        ${srcset ? `srcset="${srcset}"` : ''}
        ${config.sizes ? `sizes="${config.sizes}"` : ''}
        alt="${config.alt}"
        ${config.width ? `width="${config.width}"` : ''}
        ${config.height ? `height="${config.height}"` : ''}
        ${config.loading ? `loading="${config.loading}"` : ''}
        ${config.fetchpriority ? `fetchpriority="${config.fetchpriority}"` : ''}
        ${config.className ? `class="${config.className}"` : ''}
      />
    </picture>
  `.trim();
}