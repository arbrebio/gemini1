// Performance utilities
function throttle<T extends (...args: any[]) => void>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  let lastFunc: ReturnType<typeof setTimeout>;
  let lastRan: number;
  
  return function(this: unknown, ...args: Parameters<T>): void {
    if (!inThrottle) {
      func.apply(this, args);
      lastRan = Date.now();
      inThrottle = true;
      
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(() => {
        if (Date.now() - lastRan >= limit) {
          func.apply(this, args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
}

function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number,
  options: { leading?: boolean; trailing?: boolean } = {}
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<T> | null = null;
  let lastThis: unknown = null;

  const later = () => {
    timeout = null;
    if (lastArgs && options.trailing !== false) {
      func.apply(lastThis, lastArgs);
      lastArgs = lastThis = null;
    }
  };

  return function(this: unknown, ...args: Parameters<T>) {
    if (!timeout && options.leading !== false) {
      func.apply(this, args);
    }

    lastArgs = args;
    lastThis = this;

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

// Accessibility utilities
// Simplified focus trap implementation without the external dependency
function trapFocus(element: HTMLElement) {
  const focusableElements = Array.from(element.querySelectorAll(
    'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'));
  
  if (focusableElements.length === 0) return () => {};
  
  const firstFocusable = focusableElements[0] as HTMLElement;
  const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;

  function handleTabKey(e: KeyboardEvent) {
    const isTabPressed = e.key === 'Tab';
    if (!isTabPressed) return;

    if (e.shiftKey) {
      if (document.activeElement === firstFocusable) {
        e.preventDefault();
        (lastFocusable as HTMLElement).focus();
      }
    } else {
      if (document.activeElement === lastFocusable) {
        e.preventDefault();
        (firstFocusable as HTMLElement).focus();
      }
    }
  }

  element.addEventListener('keydown', handleTabKey);
  (firstFocusable as HTMLElement).focus();

  return function cleanup() {
    element.removeEventListener('keydown', handleTabKey);
  };
}

// Lazy loading utilities
export function lazyLoadImages() {
  if (typeof window === 'undefined') return;
  
  if ('loading' in HTMLImageElement.prototype) {
    document.querySelectorAll('img[loading="lazy"]').forEach((imgElement) => {
      if (imgElement instanceof HTMLImageElement && imgElement.dataset.src) {
        imgElement.src = imgElement.dataset.src;
      }
    });
  } else {
    // Fallback for browsers that don't support native lazy loading
    if (!('IntersectionObserver' in window)) {
      import('intersection-observer').then(() => {
        setupLazyLoading();
      });
    } else {
      setupLazyLoading();
    }
    
    function setupLazyLoading() {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              observer.unobserve(img);
            }
          }
        });
      }, {
        rootMargin: '50px 0px',
        threshold: 0.01
      });

      document.querySelectorAll('img[loading="lazy"]').forEach(img => {
        imageObserver.observe(img);
      });
    }
  }
}

// Error handling utilities
export class AppError extends Error {
  constructor(
    message: string,
    public code: string = 'UNKNOWN_ERROR',
    public statusCode: number = 500,
    public context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      context: this.context,
      stack: process.env.NODE_ENV === 'development' ? this.stack : undefined
    };
  }
}

function handleError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }
  
  if (error instanceof Error) {
    return new AppError(error.message, 'INTERNAL_ERROR', 500, {
      originalError: error.name,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
  
  return new AppError('An unexpected error occurred', 'UNKNOWN_ERROR', 500);
}

// Form validation utilities
const validators = {
  email: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  required: (value: string) => value.trim().length > 0,
  phone: (value: string) => /^\+?[\d\s-()]{10,}$/.test(value),
  url: (value: string) => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  }
};

// Animation utilities
function animate(
  element: HTMLElement,
  keyframes: Keyframe[],
  options: KeyframeAnimationOptions
): Animation {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // Skip animation for users who prefer reduced motion
    const lastKeyframe = keyframes[keyframes.length - 1];
    Object.assign(element.style, lastKeyframe);
    // Return a completed animation for reduced motion
    const anim = element.animate(keyframes, { duration: 0 });
    anim.finish();
    return anim;
  }

  return element.animate(keyframes, {
    easing: 'ease-in-out',
    fill: 'forwards',
    ...options
  });
}

// Image optimization utilities
function getOptimizedImageUrl(url: string, width: number = 800, quality: number = 80): string {
  if (!url) return '';
  
  // Handle Imgur images
  if (url.includes('imgur.com')) {
    // Imgur doesn't support direct resizing in the way we need
    return url;
  }
  
  // Handle Unsplash images
  if (url.includes('unsplash.com')) {
    const urlObj = new URL(url);
    urlObj.searchParams.set('w', width.toString());
    urlObj.searchParams.set('q', quality.toString());
    urlObj.searchParams.set('auto', 'format');
    return urlObj.toString();
  }
  
  // Return original for other sources
  return url;
}