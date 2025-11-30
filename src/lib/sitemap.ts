/**
 * Utility functions for sitemap generation
 */

/**
 * Format a date for sitemap lastmod
 * @param date Date to format
 * @returns ISO string date format
 */
export function formatDate(date: Date): string {
  return date.toISOString();
}

/**
 * Get the appropriate changefreq value for a page
 * @param path Page path
 * @returns Appropriate changefreq value
 */
export function getChangeFreq(path: string): string {
  if (path === '' || path === '/') {
    return 'daily';
  }
  
  if (path.includes('blog')) {
    return 'weekly';
  }
  
  return 'monthly';
}

/**
 * Get the appropriate priority value for a page
 * @param path Page path
 * @returns Priority value between 0.0 and 1.0
 */
export function getPriority(path: string): string {
  if (path === '' || path === '/') {
    return '1.0';
  }
  
  if (path.includes('blog')) {
    return '0.7';
  }
  
  if (path.includes('contact')) {
    return '0.8';
  }
  
  return '0.5';
}

/**
 * Clean a URL to remove double slashes
 * @param url URL to clean
 * @returns Cleaned URL
 */
export function cleanUrl(url: string): string {
  return url.replace(/([^:]\/)\/+/g, "$1");
}