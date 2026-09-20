(() => {
  const carousel = document.querySelector('.ga-film-carousel');
  if (!carousel) return;
  const slides = [...carousel.querySelectorAll('.ga-film-slide')];
  const preview = carousel.querySelector('.ga-film-preview');
  const counter = carousel.querySelector('.ga-film-counter');
  let current = 0;
  function select(offset) {
    current = (current + offset + slides.length) % slides.length;
    slides.forEach((slide, index) => { slide.hidden = index !== current; });
    const next = slides[(current + 1) % slides.length];
    const title = next.querySelector('p').textContent;
    preview.querySelector('img').src = next.querySelector('.ga-film-backdrop').src;
    preview.querySelector('img').alt = next.querySelector('.ga-film-backdrop').alt;
    preview.querySelector('span').textContent = title;
    preview.setAttribute('aria-label', `Select ${title}`);
    counter.textContent = `${String(current + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
    carousel.setAttribute('data-active-film', String(current));
  }
  carousel.querySelector('.ga-film-prev').addEventListener('click', () => select(-1));
  carousel.querySelector('.ga-film-next').addEventListener('click', () => select(1));
  preview.addEventListener('click', () => select(1));
  carousel.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    if (event.target.closest('.ga-film-slide')) carousel.querySelector('.ga-film-next').focus();
    select(event.key === 'ArrowRight' ? 1 : -1);
  });
})();
