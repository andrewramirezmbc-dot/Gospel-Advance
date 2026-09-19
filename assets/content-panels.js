(() => {
  const panels = { '#contact': document.getElementById('contactPanel'), '#gospel': document.getElementById('gospelPanel') };
  function openPanel(hash) {
    const panel = panels[hash];
    if (!panel) return;
    Object.values(panels).forEach(other => { if (other !== panel && other.open) other.close(); });
    if (!panel.open) panel.showModal();
    const details = panel.querySelector('details');
    if (details) details.open = true;
  }
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (!link) return;
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin || !['/', '/index.html', '/gospel-advance-website.html'].includes(url.pathname) || !panels[url.hash]) return;
    event.preventDefault();
    openPanel(url.hash);
  });
  Object.values(panels).forEach(panel => {
    panel.querySelector('.ga-panel-close').addEventListener('click', () => panel.close());
  });
  window.addEventListener('hashchange', () => openPanel(location.hash));
  openPanel(location.hash);
})();
