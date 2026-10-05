(() => {
  const root = document.querySelector('.ga-media-library');
  const tablist = root?.querySelector('.ga-media-tabs');
  if (!tablist) return;
  const tabs = [...tablist.querySelectorAll('[role="tab"]')];
  const panel = root.querySelector('.ga-media-grid');
  const featured = [...panel.querySelectorAll('.ga-media-testimony, .ga-media-films')];
  const tiles = [...panel.querySelectorAll('[data-media-category]')];
  const list = panel.querySelector('.ga-media-explore-links');
  const heading = panel.querySelector('.ga-media-explore-heading');
  const dots = panel.querySelector('.ga-media-explore-dots');
  const dotButtons = [...dots.querySelectorAll('button')];
  const mobile = window.matchMedia('(max-width: 767px)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  function select(value) {
    root.dataset.mediaView = value;
    tabs.forEach(tab => {
      const active = tab.dataset.mediaView === value;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    featured.forEach(tile => { tile.hidden = mobile.matches && value !== 'featured'; });
    tiles.forEach(tile => { tile.hidden = mobile.matches && value !== 'featured' && tile.dataset.mediaCategory !== value; });
    heading.hidden = dots.hidden = !mobile.matches || value !== 'featured';
    if (mobile.matches) {
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', tabs.find(tab => tab.dataset.mediaView === value).id);
      panel.tabIndex = 0;
    } else {
      panel.removeAttribute('role');
      panel.removeAttribute('aria-labelledby');
      panel.removeAttribute('tabindex');
    }
    list.scrollLeft = 0;
    updateDots();
  }
  function updateDots() {
    const last = list.scrollWidth - list.clientWidth;
    const selected = last > 0 && list.scrollLeft > last / 2 ? 1 : 0;
    dotButtons.forEach((button, index) => button.setAttribute('aria-pressed', String(index === selected)));
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => select(tab.dataset.mediaView));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next === undefined) return;
      event.preventDefault();
      tabs[next].focus();
      select(tabs[next].dataset.mediaView);
    });
  });
  dotButtons.forEach((button, index) => button.addEventListener('click', () => {
    list.scrollTo({ left: index ? list.scrollWidth - list.clientWidth : 0, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
  }));
  list.addEventListener('scroll', updateDots, { passive: true });
  const syncLayout = () => { tablist.hidden = !mobile.matches; select('featured'); };
  mobile.addEventListener('change', syncLayout);
  syncLayout();
})();
