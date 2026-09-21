(() => {
  const section = document.querySelector('.resource-sermons');
  if (!section) return;
  const track = section.querySelector('.resource-sermon-track');
  const cards = [...track.children];
  const previous = section.querySelector('[data-sermon-prev]');
  const next = section.querySelector('[data-sermon-next]');
  const counter = section.querySelector('.resource-sermon-counter');
  const progress = section.querySelector('.resource-sermon-progress span');
  function update() {
    const step = cards[1].offsetLeft - cards[0].offsetLeft;
    const index = Math.round(track.scrollLeft / step);
    previous.disabled = track.scrollLeft < 2;
    next.disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 2;
    counter.textContent = `${String(index + 1).padStart(2, '0')} / ${String(cards.length).padStart(2, '0')}`;
    progress.style.width = `${100 * (track.scrollLeft + track.clientWidth) / track.scrollWidth}%`;
  }
  function move(direction) {
    track.scrollBy({ left: direction * (cards[1].offsetLeft - cards[0].offsetLeft), behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }
  previous.addEventListener('click', () => move(-1));
  next.addEventListener('click', () => move(1));
  track.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    move(event.key === 'ArrowRight' ? 1 : -1);
  });
  track.addEventListener('scroll', update, { passive: true });
  new ResizeObserver(update).observe(track);
  update();
})();
