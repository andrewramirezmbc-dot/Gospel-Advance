(() => {
  'use strict';
  const root = document.documentElement;
  const banner = document.getElementById('gaAnnouncement');
  const close = document.getElementById('gaAnnouncementClose');
  const dismiss = () => {
    if (!banner) return;
    banner.hidden = true;
    root.classList.add('ga-announcement-dismissed');
  };
  try { if (sessionStorage.getItem('ga-announcement-dismissed') === 'yes') dismiss(); } catch { /* Optional preference. */ }
  close?.addEventListener('click', () => {
    dismiss();
    document.querySelector('.ga-header .ga-brand')?.focus();
    try { sessionStorage.setItem('ga-announcement-dismissed', 'yes'); } catch { /* Optional preference. */ }
  });

  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  if ('IntersectionObserver' in window) {
    const reveals = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        if (!motion.matches) entry.target.classList.add('ga-reveal-in');
        reveals.unobserve(entry.target);
      });
    }, { threshold: .12 });
    document.querySelectorAll('.ga-campaign-heading, .ga-action-card, .ga-belief').forEach(el => reveals.observe(el));
  }
})();
