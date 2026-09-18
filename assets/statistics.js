(() => {
  'use strict';
  const cards = [...document.querySelectorAll('[data-stat]')];
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!cards.length || motion.matches || !('IntersectionObserver' in window)) return;

  const states = new Map();
  const finish = state => {
    cancelAnimationFrame(state.frame);
    state.number.textContent = state.format.format(state.value);
    state.card.classList.remove('ga-stat-waiting');
    state.done = true;
  };
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const state = states.get(entry.target);
      if (!state || state.started || state.done) return;
      observer.unobserve(state.card);
      state.started = true;
      state.card.classList.remove('ga-stat-waiting');
      if (document.hidden || motion.matches) { finish(state); return; }
      state.number.textContent = state.format.format(0);
      let start;
      const tick = time => {
        start ??= time;
        const progress = Math.min(1, (time - start) / 1400);
        const eased = 1 - Math.pow(1 - progress, 3);
        state.number.textContent = state.format.format(state.value * eased);
        if (progress < 1) state.frame = requestAnimationFrame(tick);
        else finish(state);
      };
      state.frame = requestAnimationFrame(tick);
    });
  }, { threshold: .2 });

  cards.forEach(card => {
    const number = card.querySelector('[data-count]');
    if (!number) return;
    const value = Number(number.dataset.count);
    const decimals = Number(number.dataset.decimals || 0);
    if (!Number.isFinite(value) || value < 0 || value > Number.MAX_SAFE_INTEGER || !Number.isInteger(decimals) || decimals < 0 || decimals > 2) return;
    const format = new Intl.NumberFormat('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    states.set(card, { card, number, value, format, frame: 0, started: false, done: false });
    card.classList.add('ga-stat-waiting');
    observer.observe(card);
  });
  // Static HTML and accessible text always contain the final, sourced values.
  motion.addEventListener('change', () => {
    if (!motion.matches) return;
    observer.disconnect();
    states.forEach(finish);
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) states.forEach(state => { if (state.started && !state.done) finish(state); });
  });
})();
