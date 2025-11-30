export interface PerformanceMetrics {
  lcp?: number;
  fid?: number;
  cls?: number;
  fcp?: number;
  ttfb?: number;
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();
  private marks: Map<string, number> = new Map();

  private constructor() {
    if (typeof window !== 'undefined') {
      this.observePageLoad();
      this.observeLCP();
      this.observeFID();
      this.observeCLS();
      this.observeINP();
    }
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  private observePageLoad() {
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

      this.recordMetric('DNS', navigation.domainLookupEnd - navigation.domainLookupStart);
      this.recordMetric('TCP', navigation.connectEnd - navigation.connectStart);
      this.recordMetric('TTFB', navigation.responseStart - navigation.requestStart);
      this.recordMetric('DOMComplete', navigation.domComplete - navigation.domInteractive);
      this.recordMetric('LoadComplete', navigation.loadEventEnd - navigation.startTime);
      this.recordMetric('FCP', this.getFCP());
    }, { passive: true });
  }

  private observeLCP() {
    if (typeof PerformanceObserver !== 'undefined') {
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.recordMetric('LCP', lastEntry.startTime);
      }).observe({ entryTypes: ['largest-contentful-paint'] });
    }
  }

  private observeFID() {
    if (typeof PerformanceObserver !== 'undefined') {
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach(entry => {
          if (entry instanceof PerformanceEventTiming) {
            this.recordMetric('FID', entry.processingStart - entry.startTime);
          }
        });
      }).observe({ entryTypes: ['first-input'] });
    }
  }

  private observeCLS() {
    if (typeof PerformanceObserver !== 'undefined') {
      let clsValue = 0;
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if ('hadRecentInput' in entry && 'value' in entry) {
            const hadRecentInput = entry.hadRecentInput as boolean;
            const value = entry.value as number;

            if (hadRecentInput === false) {
              clsValue += value || 0;
            }
          }
        }
        this.recordMetric('CLS', clsValue);
      }).observe({ entryTypes: ['layout-shift'] });
    }
  }

  private observeINP() {
    if (typeof PerformanceObserver !== 'undefined') {
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach((entry) => {
          if ('processingEnd' in entry && 'startTime' in entry) {
            const processingEnd = entry.processingEnd as number;
            const startTime = entry.startTime;
            const inp = processingEnd - startTime;
            this.recordMetric('INP', inp);
          }
        });
      }).observe({ entryTypes: ['event'] });
    }
  }

  private getFCP(): number {
    const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0];
    return fcpEntry ? fcpEntry.startTime : 0;
  }

  private recordMetric(name: string, value: number) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)?.push(value);
  }

  startMeasure(name: string) {
    this.marks.set(name, performance.now());
  }

  endMeasure(name: string): number | undefined {
    const startTime = this.marks.get(name);
    if (startTime) {
      const duration = performance.now() - startTime;
      this.recordMetric(name, duration);
      this.marks.delete(name);
      return duration;
    }
    return undefined;
  }

  getMetrics(): Record<string, { avg: number; min: number; max: number }> {
    const result: Record<string, { avg: number; min: number; max: number }> = {};

    this.metrics.forEach((values, name) => {
      if (values.length > 0) {
        result[name] = {
          avg: values.reduce((a, b) => a + b) / values.length,
          min: Math.min(...values),
          max: Math.max(...values)
        };
      }
    });

    return result;
  }

  reportToAnalytics() {
    const metrics = this.getMetrics();
  }
}

export function optimizeImages() {
  if (typeof window === 'undefined') return;

  if ('loading' in HTMLImageElement.prototype) {
    document.querySelectorAll('img[loading="lazy"]').forEach(img => {
      if (img instanceof HTMLImageElement && img.dataset.src) {
        img.src = img.dataset.src;
      }
    });
  } else {
    if (!('IntersectionObserver' in window)) {
      import('intersection-observer').then(() => {
        setupImageObserver();
      });
    } else {
      setupImageObserver();
    }

    function setupImageObserver() {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.classList.remove('lazy');
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

export function preloadCriticalResources(): void {
  if (typeof document === 'undefined') return;

  const criticalResources = [
    { href: 'https://i.imgur.com/79cS79J.png', as: 'image' },
  ];

  criticalResources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource.href;
    link.as = resource.as;
    if (resource.as === 'image') {
      link.crossOrigin = 'anonymous';
    }
    document.head.appendChild(link);
  });
}

export function registerServiceWorker(): void {
  if ('serviceWorker' in navigator && 'caches' in window) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }
}

export function deferNonCriticalResources(): void {
  if (typeof document === 'undefined') return;

  const fontAwesome = document.createElement('link');
  fontAwesome.rel = 'stylesheet';
  fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css';
  fontAwesome.crossOrigin = 'anonymous';
  fontAwesome.media = 'print';
  fontAwesome.addEventListener('load', () => {
    fontAwesome.media = 'all';
  });
  document.head.appendChild(fontAwesome);
}

export function initializePerformanceOptimizations(): void {
  if (typeof window === 'undefined') return;

  window.addEventListener('load', () => {
    optimizeImages();
    registerServiceWorker();
    deferNonCriticalResources();

    const monitor = PerformanceMonitor.getInstance();
    setTimeout(() => {
      monitor.reportToAnalytics();
    }, 5000);
  }, { passive: true });
}
