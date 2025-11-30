export function initParallax() {
  // Parallax Effect
  const parallaxElements = document.querySelectorAll('.parallax-bg');
  
  if (parallaxElements.length === 0) return;
  
  const handleScroll = () => {
    const scrolled = window.scrollY;
    
    parallaxElements.forEach((element) => {
      const offset = scrolled * 0.5;
      (element as HTMLElement).style.setProperty('--scroll-offset', `${offset}px`);
    });
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  
  // Return cleanup function
  return () => {
    window.removeEventListener('scroll', handleScroll);
  };
}

export function initCounters() {
  const counters = document.querySelectorAll('.counter');
  
  if (counters.length === 0) return;
  
  const animateCounter = (counter: Element) => {
    const target = parseInt(counter.getAttribute('data-target')?.replace(/\D/g, '') || '0');
    let current = 0;
    const increment = target / 50;
    
    const updateCounter = () => {
      if (current < target) {
        current += increment;
        counter.textContent = Math.ceil(current).toString();
        requestAnimationFrame(updateCounter);
      } else {
        counter.textContent = counter.getAttribute('data-target') || '0';
      }
    };
    
    updateCounter();
  };

  // Intersection Observer for counters
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => observer.observe(counter));
  
  // Return cleanup function
  return () => {
    observer.disconnect();
  };
}