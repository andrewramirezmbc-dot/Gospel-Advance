(() => {
  const player = document.getElementById('featuredPlayer');
  // The existing player replaces its thumbnail on click; focus the newly loaded video.
  player?.addEventListener('click', () => {
    player.querySelector('iframe')?.focus();
  });
})();
