// Google Analytics 4 and tracking utilities
export interface AnalyticsEvent {
  event: string;
  category?: string;
  action?: string;
  label?: string;
  value?: number;
  [key: string]: any;
}

export class AnalyticsTracker {
  private static instance: AnalyticsTracker;
  private gaId: string = 'G-XXXXXXXXXX'; // Replace with actual GA4 ID

  private constructor() {
    if (typeof window !== 'undefined') {
      this.initializeGoogleAnalytics();
    }
  }

  static getInstance(): AnalyticsTracker {
    if (!AnalyticsTracker.instance) {
      AnalyticsTracker.instance = new AnalyticsTracker();
    }
    return AnalyticsTracker.instance;
  }

  private initializeGoogleAnalytics() {
    // Load Google Analytics
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.gaId}`;
    document.head.appendChild(script);

    // Initialize gtag
    (window as any).dataLayer = (window as any).dataLayer || [];
    function gtag(...args: any[]) {
      (window as any).dataLayer.push(arguments);
    }
    (window as any).gtag = gtag;

    gtag('js', new Date());
    gtag('config', this.gaId, {
      page_path: window.location.pathname,
      send_page_view: true
    });
  }

  trackPageView(path: string) {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('config', this.gaId, {
        page_path: path
      });
    }
  }

  trackEvent(event: AnalyticsEvent) {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', event.event, {
        event_category: event.category,
        event_label: event.label,
        value: event.value,
        ...event
      });
    }
  }

  trackConversion(type: 'quote' | 'contact' | 'newsletter' | 'whatsapp', value?: number) {
    this.trackEvent({
      event: 'conversion',
      category: 'engagement',
      action: type,
      value: value || 1
    });
  }

  trackScrollDepth(depth: number) {
    this.trackEvent({
      event: 'scroll',
      category: 'engagement',
      action: 'scroll_depth',
      label: `${depth}%`,
      value: depth
    });
  }

  trackFormStart(formName: string) {
    this.trackEvent({
      event: 'form_start',
      category: 'form',
      action: 'start',
      label: formName
    });
  }

  trackFormSubmit(formName: string, success: boolean) {
    this.trackEvent({
      event: success ? 'form_submit_success' : 'form_submit_error',
      category: 'form',
      action: 'submit',
      label: formName
    });
  }

  trackProductView(productName: string, category: string) {
    this.trackEvent({
      event: 'view_item',
      category: 'ecommerce',
      action: 'product_view',
      label: productName,
      item_category: category
    });
  }

  trackOutboundLink(url: string) {
    this.trackEvent({
      event: 'click',
      category: 'outbound',
      action: 'click',
      label: url
    });
  }
}

// Initialize scroll depth tracking
export function initScrollDepthTracking() {
  if (typeof window === 'undefined') return;

  const tracker = AnalyticsTracker.getInstance();
  const depths = [25, 50, 75, 100];
  const reached: Set<number> = new Set();

  const checkScrollDepth = () => {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.scrollY;
    const scrollPercent = ((scrollTop + windowHeight) / documentHeight) * 100;

    depths.forEach(depth => {
      if (scrollPercent >= depth && !reached.has(depth)) {
        reached.add(depth);
        tracker.trackScrollDepth(depth);
      }
    });
  };

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        checkScrollDepth();
        ticking = false;
      });
      ticking = true;
    }
  });
}

// Initialize form tracking
export function initFormTracking() {
  if (typeof window === 'undefined') return;

  const tracker = AnalyticsTracker.getInstance();
  const trackedForms = new Set<HTMLFormElement>();

  document.querySelectorAll('form').forEach((form) => {
    if (form instanceof HTMLFormElement && !trackedForms.has(form)) {
      trackedForms.add(form);

      const formName = form.id || form.getAttribute('name') || 'unknown_form';

      // Track form start
      const inputs = form.querySelectorAll('input, textarea, select');
      inputs.forEach(input => {
        input.addEventListener('focus', () => {
          tracker.trackFormStart(formName);
        }, { once: true });
      });

      // Track form submit
      form.addEventListener('submit', (e) => {
        tracker.trackFormSubmit(formName, true);
      });
    }
  });
}

// Initialize outbound link tracking
export function initOutboundLinkTracking() {
  if (typeof window === 'undefined') return;

  const tracker = AnalyticsTracker.getInstance();

  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const link = target.closest('a');

    if (link && link.hostname !== window.location.hostname) {
      tracker.trackOutboundLink(link.href);
    }
  });
}

// Initialize all tracking
export function initializeAnalytics() {
  if (typeof window === 'undefined') return;

  window.addEventListener('load', () => {
    initScrollDepthTracking();
    initFormTracking();
    initOutboundLinkTracking();
  });
}
