(() => {
  'use strict';
  const targets = [...document.querySelectorAll('[data-video-cursor]')];
  if (!targets.length) return;
  const pointer = matchMedia('(hover: hover) and (pointer: fine)');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const cursor = document.createElement('span');
  cursor.className = 'ga-video-cursor';
  cursor.textContent = 'PLAY';
  cursor.setAttribute('aria-hidden', 'true');
  document.body.append(cursor);
  let active;
  const hide = () => {
    active?.classList.remove('ga-cursor-active');
    active = null;
    cursor.classList.remove('is-visible');
  };
  targets.forEach(target => {
    target.addEventListener('pointermove', event => {
      if (!pointer.matches || motion.matches || event.pointerType === 'touch' || document.querySelector('dialog[open]')) { hide(); return; }
      if (active !== target) { hide(); active = target; }
      cursor.style.left = `${event.clientX}px`;
      cursor.style.top = `${event.clientY}px`;
      active.classList.add('ga-cursor-active');
      cursor.classList.add('is-visible');
    });
    target.addEventListener('pointerleave', hide);
    target.addEventListener('pointercancel', hide);
    target.addEventListener('click', hide);
  });
  // Never leave a detached play cursor over menus, dialogs, or keyboard navigation.
  document.addEventListener('keydown', hide);
  document.addEventListener('visibilitychange', hide);
  window.addEventListener('blur', hide);
  window.addEventListener('scroll', hide, { passive: true });
  pointer.addEventListener('change', hide);
  motion.addEventListener('change', hide);
})();
