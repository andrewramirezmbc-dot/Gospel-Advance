(() => {
  'use strict';
  if (/dashboard|my-learning|bible-101-admin/.test(location.pathname) ||
      document.querySelector('.academy-dashboard') ||
      !('IntersectionObserver' in window) || !Element.prototype.animate) return;
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const active = new Set();
  const groups = '.ga-media-card, .ga-approach-card, .article-card, .sermon-card, .resource-academy-card, .academy-course-card, .academy-course-poster';
  const selector = 'main h1, main h2, main h3, main .section-label, main .resource-label, main .academy-eyebrow, main .reveal, .ga-hero-artwork-image, .ga-frontlines-copy, .ga-frontlines-action, .ga-giving-collage, ' + groups;
  const stop = () => active.forEach(animation => animation.cancel());
  const observer = new IntersectionObserver(entries => {
    let order = 0;
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      const el = entry.target;
      if (preference.matches || el.matches(':focus-within')) return;
      // Content stays visible without JS; only an arriving element gets an animation.
      const animation = el.animate([
        { opacity: 0, translate: '0 20px' },
        { opacity: 1, translate: '0 0' }
      ], { duration: 600, delay: Math.min(order++, 3) * 80, easing: 'ease', fill: 'backwards' });
      active.add(animation);
      animation.onfinish = animation.oncancel = () => active.delete(animation);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -24px 0px' });
  document.querySelectorAll(selector).forEach(el => {
    if (el.closest('dialog, form, nav, .academy-dashboard, [hidden]') ||
        el.parentElement.closest(groups + ', .reveal') || el.querySelector('.ga-sr-only')) return;
    observer.observe(el);
  });
  preference.addEventListener('change', event => { if (event.matches) stop(); });
  document.addEventListener('focusin', stop);
  window.addEventListener('pagehide', stop);
})();

