export interface PerformanceMetrics {
  lcp?: number;
  fid?: number;
  cls?: number;
  fcp?: number;
  ttfb?: number;
}

const MAX_METRIC_SAMPLES = 50; // prevent unbounded growth

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();
  private marks: Map<string, number> = new Map();
  // Keep references so observers can be disconnected if needed
  private observers: PerformanceObserver[] = [];

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

  destroy(): void {
    this.observers.forEach(o => o.disconnect());
    this.observers = [];
    this.metrics.clear();
    this.marks.clear();
  }

  private makeObserver(cb: PerformanceObserverCallback): PerformanceObserver {
    const obs = new PerformanceObserver(cb);
    this.observers.push(obs);
    return obs;
  }

  private observePageLoad() {
    window.addEventListener('load', () => {
      const entries = performance.getEntriesByType('navigation');
      if (!entries.length) return;
      const navigation = entries[0] as PerformanceNavigationTiming;
      this.recordMetric('DNS', navigation.domainLookupEnd - navigation.domainLookupStart);
      this.recordMetric('TCP', navigation.connectEnd - navigation.connectStart);
      this.recordMetric('TTFB', navigation.responseStart - navigation.requestStart);
      this.recordMetric('DOMComplete', navigation.domComplete - navigation.domInteractive);
      this.recordMetric('LoadComplete', navigation.loadEventEnd - navigation.startTime);
      this.recordMetric('FCP', this.getFCP());
    }, { passive: true });
  }

  private observeLCP() {
    if (typeof PerformanceObserver === 'undefined') return;
    try {
      this.makeObserver((entryList) => {
        const entries = entryList.getEntries();
        if (entries.length) {
          this.recordMetric('LCP', entries[entries.length - 1].startTime);
        }
      }).observe({ type: 'largest-contentful-paint', buffered: true });
    } catch {}
  }

  private observeFID() {
    if (typeof PerformanceObserver === 'undefined') return;
    try {
      this.makeObserver((entryList) => {
        entryList.getEntries().forEach(entry => {
          if ('processingStart' in entry) {
            this.recordMetric('FID', (entry as any).processingStart - entry.startTime);
          }
        });
      }).observe({ type: 'first-input', buffered: true });
    } catch {}
  }

  private observeCLS() {
    if (typeof PerformanceObserver === 'undefined') return;
    try {
      let clsValue = 0;
      this.makeObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if ('hadRecentInput' in entry && !(entry as any).hadRecentInput) {
            clsValue += (entry as any).value ?? 0;
          }
        }
        this.recordMetric('CLS', clsValue);
      }).observe({ type: 'layout-shift', buffered: true });
    } catch {}
  }

  private observeINP() {
    if (typeof PerformanceObserver === 'undefined') return;
    try {
      this.makeObserver((entryList) => {
        entryList.getEntries().forEach(entry => {
          if ('processingEnd' in entry) {
            this.recordMetric('INP', (entry as any).processingEnd - entry.startTime);
          }
        });
      }).observe({ type: 'event', buffered: true } as PerformanceObserverInit);
    } catch {}
  }

  private getFCP(): number {
    const entries = performance.getEntriesByName('first-contentful-paint');
    return entries.length ? entries[0].startTime : 0;
  }

  private recordMetric(name: string, value: number) {
    if (!this.metrics.has(name)) this.metrics.set(name, []);
    const arr = this.metrics.get(name)!;
    arr.push(value);
    // Cap sample size to prevent unbounded memory growth
    if (arr.length > MAX_METRIC_SAMPLES) arr.shift();
  }

  startMeasure(name: string) {
    this.marks.set(name, performance.now());
  }

  endMeasure(name: string): number | undefined {
    const startTime = this.marks.get(name);
    if (startTime !== undefined) {
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
      if (!values.length) return;
      const sum = values.reduce((a, b) => a + b, 0);
      result[name] = {
        avg: sum / values.length,
        min: Math.min(...values),
        max: Math.max(...values),
      };
    });
    return result;
  }

  reportToAnalytics() {
    // No-op until an analytics provider is wired up.
    // Metrics are available via getMetrics() for debugging.
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
      import('intersection-observer').then(() => setupImageObserver());
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
      }, { rootMargin: '50px 0px', threshold: 0.01 });

      document.querySelectorAll('img[loading="lazy"]').forEach(img => {
        imageObserver.observe(img);
      });
    }
  }
}

export function preloadCriticalResources(): void {
  // Preload any above-the-fold resources here as needed.
}

export function registerServiceWorker(): void {
  if ('serviceWorker' in navigator && 'caches' in window) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }
}

export function initializePerformanceOptimizations(): void {
  if (typeof window === 'undefined') return;

  window.addEventListener('load', () => {
    optimizeImages();
    registerServiceWorker();
    PerformanceMonitor.getInstance();
  }, { passive: true });
}
