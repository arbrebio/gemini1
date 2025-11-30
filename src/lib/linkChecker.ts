// Link validation and broken link detection utilities
export interface LinkCheckResult {
  url: string;
  status: 'valid' | 'broken' | 'redirect' | 'unknown';
  statusCode?: number;
  redirectUrl?: string;
  error?: string;
}

/**
 * Check if a URL is accessible
 */
export async function checkLink(url: string, timeout: number = 5000): Promise<LinkCheckResult> {
  try {
    // Skip checking certain URLs that are known to be valid
    if (url.startsWith('mailto:') || url.startsWith('tel:') || url.startsWith('#')) {
      return { url, status: 'valid' };
    }
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LinkChecker/1.0)'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      return { url, status: 'valid', statusCode: response.status };
    } else if (response.status >= 300 && response.status < 400) {
      const redirectUrl = response.headers.get('Location');
      return { 
        url, 
        status: 'redirect', 
        statusCode: response.status,
        redirectUrl: redirectUrl || undefined
      };
    } else {
      return { 
        url, 
        status: 'broken', 
        statusCode: response.status,
        error: `HTTP ${response.status}`
      };
    }
  } catch (error) {
    return { 
      url, 
      status: 'broken', 
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Extract all links from HTML content
 */
export function extractLinks(html: string): string[] {
  const linkRegex = /href=["']([^"']+)["']/gi;
  const links: string[] = [];
  let match;
  
  while ((match = linkRegex.exec(html)) !== null) {
    const url = match[1];
    if (url && !url.startsWith('javascript:') && !url.startsWith('data:')) {
      links.push(url);
    }
  }
  
  return [...new Set(links)]; // Remove duplicates
}

/**
 * Validate internal links
 */
export function validateInternalLink(path: string, availablePaths: string[]): boolean {
  // Remove query parameters and fragments
  const cleanPath = path.split('?')[0].split('#')[0];
  
  // Check if path exists in available paths
  return availablePaths.includes(cleanPath) || 
         availablePaths.some(p => p.startsWith(cleanPath + '/'));
}

/**
 * Generate link report
 */
export async function generateLinkReport(urls: string[]): Promise<{
  total: number;
  valid: number;
  broken: number;
  redirects: number;
  results: LinkCheckResult[];
}> {
  const results = await Promise.all(
    urls.map(url => checkLink(url))
  );
  
  const summary = results.reduce(
    (acc, result) => {
      acc.total++;
      switch (result.status) {
        case 'valid':
          acc.valid++;
          break;
        case 'broken':
          acc.broken++;
          break;
        case 'redirect':
          acc.redirects++;
          break;
      }
      return acc;
    },
    { total: 0, valid: 0, broken: 0, redirects: 0 }
  );
  
  return {
    ...summary,
    results
  };
}

/**
 * Common broken link patterns to fix
 */
export const commonLinkFixes: Record<string, string> = {
  'http://arbrebio.ci': 'https://arbrebio.com',
  'https://arbrebio.ci': 'https://arbrebio.com',
  '/en/': '/',
  '//': '/',
};

/**
 * Fix common link issues
 */
export function fixCommonLinkIssues(url: string): string {
  let fixedUrl = url;
  
  Object.entries(commonLinkFixes).forEach(([pattern, replacement]) => {
    fixedUrl = fixedUrl.replace(new RegExp(pattern, 'g'), replacement);
  });
  
  return fixedUrl;
}