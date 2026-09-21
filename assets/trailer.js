(() => {
  'use strict';
  const video = document.getElementById('missionTrailer');
  const stage = document.getElementById('trailerStage');
  if (!video || !stage) return;
  const frame = document.getElementById('trailerFrame');
  const watch = document.getElementById('trailerWatch');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const narrow = window.matchMedia('(max-width: 767px)');
  const heroTitle = document.getElementById('hero-title');
  let visible = false;
  let userPaused = false;
  let automaticPause = false;
  let failed = false;
  let started = false;
  let raf = 0;
  const blocked = () => document.hidden || !!document.querySelector('dialog[open], .ga-header.menu-open');
  const isFullscreen = () => document.fullscreenElement === video || document.webkitFullscreenElement === video || video.webkitDisplayingFullscreen;
  const enterFullscreen = () => {
    if (isFullscreen()) return;
    try {
      // Request during the click gesture; Safari on iPhone uses the video API.
      if (video.requestFullscreen) {
        const request = video.requestFullscreen();
        request?.catch(() => {});
      } else if (video.webkitEnterFullscreen) {
        video.webkitEnterFullscreen();
      }
    } catch (_) {
      // Keep inline playback available when fullscreen is unavailable.
    }
  };
  const pause = () => {
    if (!video.paused) {
      automaticPause = true;
      video.pause();
    }
  };
  const sync = () => {
    if ((!visible && !isFullscreen()) || blocked() || failed || userPaused || (motion.matches && !started)) {
      pause();
      return;
    }
  };
  const layout = () => {
    raf = 0;
    const progress = Math.max(0, Math.min(1, (innerHeight * .85 - stage.getBoundingClientRect().top) / (innerHeight * .75)));
    const still = motion.matches || narrow.matches;
    const scale = still ? 1 : .88 + .12 * progress;
    frame.style.transform = still ? 'scale(1)' : `translateY(${32 * (1 - progress)}px) scale(${scale})`;
    if (heroTitle) {
      const fade = still ? 0 : Math.max(0, Math.min(1, (innerHeight - stage.getBoundingClientRect().top) / (innerHeight * .8)));
      heroTitle.style.opacity = String(1 - fade);
      heroTitle.style.transform = `translateY(${-48 * fade}px)`;
    }
  };
  const scheduleLayout = () => { if (!raf) raf = requestAnimationFrame(layout); };
  watch.hidden = false;
  video.muted = true;
  watch.addEventListener('click', () => {
    userPaused = false;
    if (!started) video.currentTime = 0;
    started = true;
    video.muted = false;
    watch.hidden = true;
    video.play().catch(() => { watch.hidden = false; });
    enterFullscreen();
  });
  video.addEventListener('play', () => {
    watch.hidden = true;
    userPaused = false;
    if (motion.matches || !video.muted) started = true;
  });
  video.addEventListener('pause', () => {
    watch.hidden = false;
    if (automaticPause) automaticPause = false;
    else userPaused = true;
  });
  video.addEventListener('volumechange', () => {
    if (!video.muted) started = true;
  });
  video.addEventListener('ended', () => { userPaused = true; started = false; watch.hidden = false; });
  video.addEventListener('error', () => {
    failed = true;
    watch.hidden = true;
    document.getElementById('trailerError').hidden = false;
  });
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting && entries[0].intersectionRatio >= .35;
    sync();
  }, { threshold: [0, .35] }).observe(video);
  // Menus and modal films must never compete with the inline trailer's audio.
  const observer = new MutationObserver(sync);
  document.querySelectorAll('dialog, .ga-header').forEach(el => observer.observe(el, { attributes: true, attributeFilter: ['open', 'class'] }));
  document.addEventListener('visibilitychange', sync);
  document.addEventListener('fullscreenchange', sync);
  document.addEventListener('webkitfullscreenchange', sync);
  video.addEventListener('webkitendfullscreen', sync);
  motion.addEventListener('change', () => {
    if (motion.matches) userPaused = true;
    layout();
    sync();
  });
  window.addEventListener('scroll', scheduleLayout, { passive: true });
  window.addEventListener('resize', scheduleLayout, { passive: true });
  layout();
})();
