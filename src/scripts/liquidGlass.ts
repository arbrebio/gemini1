/**
 * Behaviour for the liquid glass theme (styles/liquid-glass.css):
 *
 *  1. Scroll reveal — headings and grid items fade and rise into place the
 *     first time they enter the viewport, slightly staggered.
 *  2. Pointer light — the highlight on a glass card follows the cursor.
 *
 * Both are progressive: the page is fully usable if this never runs. The
 * `lg-anim` class that hides not-yet-revealed elements is only added here,
 * after confirming the browser can reveal them again.
 */

const CARD = '.bg-white[class*="rounded"][class*="shadow"], .lg-glass';
const REVEAL = 'h2, .grid > *';
const STAGGER_MS = 80;
const MAX_STAGGER = 5;

function setupReveal() {
  if (!('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const sections = document.querySelectorAll<HTMLElement>('body.lg-site main section:not([aria-label="Hero section"])');
  const targets: HTMLElement[] = [];
  sections.forEach((section) => {
    section.querySelectorAll<HTMLElement>(REVEAL).forEach((el) => {
      // One animation per branch: skip anything inside an element already chosen,
      // and never animate form controls' containers out from under the user.
      if (el.parentElement?.closest('[data-lg-reveal]')) return;
      if (el.closest('form')) return;
      const siblings = Array.from(el.parentElement?.children ?? []);
      const order = Math.min(MAX_STAGGER, Math.max(0, siblings.indexOf(el)));
      el.dataset.lgReveal = '';
      el.style.setProperty('--lg-delay', `${order * STAGGER_MS}ms`);
      targets.push(el);
    });
  });
  if (targets.length === 0) return;

  const reveal = (el: HTMLElement) => {
    el.classList.add('is-revealed');
    const delay = parseInt(el.style.getPropertyValue('--lg-delay') || '0', 10);
    window.setTimeout(() => el.classList.add('is-settled'), 1000 + delay);
  };

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      reveal(entry.target as HTMLElement);
      observer.unobserve(entry.target);
    }
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

  document.documentElement.classList.add('lg-anim');
  targets.forEach((el) => observer.observe(el));

  // Anchor links and in-page search can land past elements that never
  // intersected; make sure nothing stays hidden above the viewport.
  const revealPassed = () => {
    for (const el of targets) {
      if (!el.classList.contains('is-revealed') && el.getBoundingClientRect().bottom < 0) reveal(el);
    }
  };
  window.addEventListener('scroll', revealPassed, { passive: true });
  window.addEventListener('hashchange', revealPassed);
}

function setupPointerLight() {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  let frame = 0;
  document.addEventListener('pointermove', (event) => {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      const card = (event.target as Element | null)?.closest?.<HTMLElement>(CARD);
      if (!card || !card.closest('body.lg-site main')) return;
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${(((event.clientX - rect.left) / rect.width) * 100).toFixed(1)}%`);
      card.style.setProperty('--my', `${(((event.clientY - rect.top) / rect.height) * 100).toFixed(1)}%`);
    });
  }, { passive: true });
}

export function initLiquidGlass() {
  if (!document.body.classList.contains('lg-site')) return;
  setupReveal();
  setupPointerLight();
}
