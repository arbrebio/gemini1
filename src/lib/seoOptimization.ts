// SEO optimization utilities
export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  type?: 'website' | 'article' | 'product';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
}

/**
 * Generate optimized meta title
 */
export function generateMetaTitle(title: string, siteName: string = 'Arbre Bio Africa'): string {
  if (title.includes(siteName)) {
    return title;
  }
  
  // Ensure title is under 60 characters for optimal display
  const maxLength = 60 - siteName.length - 3; // Account for " | " separator
  const truncatedTitle = title.length > maxLength ? title.substring(0, maxLength).trim() + '...' : title;
  
  return `${truncatedTitle} | ${siteName}`;
}

/**
 * Generate optimized meta description
 */
export function generateMetaDescription(description: string): string {
  const maxLength = 160;
  
  if (description.length <= maxLength) {
    return description;
  }
  
  // Truncate at word boundary
  const truncated = description.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  return truncated.substring(0, lastSpace) + '...';
}

/**
 * Generate canonical URL
 */
export function generateCanonicalUrl(pathname: string, baseUrl: string): string {
  // Remove trailing slash and ensure proper format
  const cleanPath = pathname.replace(/\/$/, '') || '/';
  return new URL(cleanPath, baseUrl).href;
}

/**
 * Generate hreflang links for multilingual sites
 */
export function generateHreflangLinks(pathname: string, baseUrl: string, languages: Record<string, string> = {}): Array<{ hreflang: string; href: string }> {
  const links = [];
  
  // Remove language prefix from pathname
  const cleanPath = pathname.replace(/^\/[a-z]{2}(\/|$)/, '/');
  
  Object.keys(languages).forEach(lang => {
    const href = lang === 'en' 
      ? new URL(cleanPath, baseUrl).href
      : new URL(`/${lang}${cleanPath}`, baseUrl).href;
    
    links.push({
      hreflang: lang,
      href
    });
  });
  
  // Add x-default for default language
  links.push({
    hreflang: 'x-default',
    href: new URL(cleanPath, baseUrl).href
  });
  
  return links;
}

/**
 * Generate structured data for different content types
 */
export function generateStructuredData(type: string, data: any, baseUrl: string): object {
  const baseSchema = {
    '@context': 'https://schema.org'
  };
  
  switch (type) {
    case 'Organization':
      return {
        ...baseSchema,
        '@type': 'Organization',
        name: data.name || 'Arbre Bio Africa',
        url: baseUrl,
        logo: data.logo || 'https://i.imgur.com/79cS79J.png',
        description: data.description || 'Leading provider of precision farming solutions in Africa',
        address: {
          '@type': 'PostalAddress',
          addressLocality: data.city || 'Abidjan',
          addressCountry: data.country || 'CI'
        },
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: data.phone || '+225 21 21 80 69 50',
          contactType: 'customer service'
        },
        sameAs: data.socialLinks || []
      };
      
    case 'WebPage':
      return {
        ...baseSchema,
        '@type': 'WebPage',
        name: data.title,
        description: data.description,
        url: data.url,
        inLanguage: data.language || 'en',
        isPartOf: {
          '@type': 'WebSite',
          name: 'Arbre Bio Africa',
          url: baseUrl
        }
      };
      
    case 'BlogPosting':
      return {
        ...baseSchema,
        '@type': 'BlogPosting',
        headline: data.title,
        description: data.description,
        image: data.image,
        datePublished: data.publishedTime,
        dateModified: data.modifiedTime || data.publishedTime,
        author: {
          '@type': 'Person',
          name: data.author
        },
        publisher: {
          '@type': 'Organization',
          name: 'Arbre Bio Africa',
          logo: {
            '@type': 'ImageObject',
            url: 'https://i.imgur.com/79cS79J.png'
          }
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': data.url
        },
        keywords: data.keywords || []
      };
      
    case 'Product':
      return {
        ...baseSchema,
        '@type': 'Product',
        name: data.name,
        description: data.description,
        image: data.image,
        brand: {
          '@type': 'Brand',
          name: 'Arbre Bio Africa'
        },
        manufacturer: {
          '@type': 'Organization',
          name: 'Arbre Bio Africa',
          url: baseUrl
        },
        offers: {
          '@type': 'Offer',
          priceCurrency: 'XOF',
          availability: 'https://schema.org/InStock'
        }
      };
      
    default:
      return baseSchema;
  }
}

/**
 * Validate and clean URLs
 */
export function validateAndCleanUrl(url: string): string | null {
  try {
    const cleanUrl = url.trim();
    if (!cleanUrl) return null;
    
    // Check if it's a valid URL
    new URL(cleanUrl);
    return cleanUrl;
  } catch {
    return null;
  }
}

/**
 * Generate breadcrumb structured data
 */
export function generateBreadcrumbSchema(pathname: string, baseUrl: string): object {
  const pathSegments = pathname.split('/').filter(Boolean);
  const breadcrumbItems = [];
  
  // Add home page
  breadcrumbItems.push({
    '@type': 'ListItem',
    position: 1,
    name: 'Home',
    item: baseUrl
  });
  
  // Add path segments
  let currentPath = '';
  pathSegments.forEach((segment, index) => {
    // Skip language code if it's the first segment
    if (index === 0 && ['en', 'fr', 'es', 'af'].includes(segment)) {
      return;
    }
    
    currentPath += `/${segment}`;
    breadcrumbItems.push({
      '@type': 'ListItem',
      position: breadcrumbItems.length + 1,
      name: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
      item: new URL(currentPath, baseUrl).href
    });
  });
  
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems
  };
}

/**
 * Generate product structured data
 */
export function generateProductSchema(product: any, baseUrl: string): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image,
    brand: {
      '@type': 'Brand',
      name: product.brand || 'Arbre Bio Africa'
    },
    manufacturer: {
      '@type': 'Organization',
      name: 'Arbre Bio Africa',
      url: baseUrl
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'XOF',
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: 'Arbre Bio Africa'
      }
    },
    aggregateRating: product.rating ? {
      '@type': 'AggregateRating',
      ratingValue: product.rating.value,
      reviewCount: product.rating.count
    } : undefined
  };
}

/**
 * Optimize meta tags for better SEO
 */
export function optimizeMetaTags(page: any): {
  title: string;
  description: string;
  keywords: string[];
} {
  const title = generateMetaTitle(page.title);
  const description = generateMetaDescription(page.description);
  
  // Generate relevant keywords based on content
  const keywords = [
    'agriculture',
    'farming',
    'Africa',
    'Côte d\'Ivoire',
    'greenhouse',
    'irrigation',
    'precision farming'
  ];
  
  if (page.category) {
    keywords.push(page.category);
  }
  
  if (page.tags) {
    keywords.push(...page.tags);
  }
  
  return {
    title,
    description,
    keywords: [...new Set(keywords)] // Remove duplicates
  };
}