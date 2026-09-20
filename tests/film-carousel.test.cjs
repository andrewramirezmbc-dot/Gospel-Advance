const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
test('film carousel advances, wraps, previews, and supports arrow keys', () => {
  const node = () => ({ listeners: {}, addEventListener(k, fn) { this.listeners[k] = fn; }, setAttribute(k, v) { this[k] = v; } });
  const slides = ['Suffering', 'Christmas'].map((title, i) => ({ hidden: i !== 0, querySelector: key => key === 'p' ? { textContent: title } : { src: `film${i}.jpg`, alt: title } }));
  const preview = node(); const img = {}; const label = {};
  preview.querySelector = key => key === 'img' ? img : label;
  const prev = node(); const next = node(); const counter = {};
  const carousel = node();
  carousel.querySelectorAll = () => slides;
  carousel.querySelector = key => ({ '.ga-film-preview': preview, '.ga-film-counter': counter, '.ga-film-prev': prev, '.ga-film-next': next }[key]);
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../assets/film-carousel.js'), 'utf8'), { document: { querySelector: () => carousel } });
  next.listeners.click();
  assert.equal(slides[1].hidden, false); assert.equal(slides[0].hidden, true);
  assert.equal(counter.textContent, '02 / 02'); assert.equal(img.src, 'film0.jpg');
  assert.equal(carousel['data-active-film'], '1');
  preview.listeners.click(); assert.equal(counter.textContent, '01 / 02');
  prev.listeners.click(); assert.equal(counter.textContent, '02 / 02');
  carousel.listeners.keydown({ key: 'ArrowRight', preventDefault() {}, target: { closest: () => null } });
  assert.equal(counter.textContent, '01 / 02');
  assert.equal(carousel['data-active-film'], '0');
});

test('film artwork stays local and text-free with a labeled preview', () => {
  const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
  for (const file of ['film-darkness-artwork.jpg', 'film-christmas-artwork.jpg']) {
    assert(html.includes(`assets/images/${file}`));
    assert(fs.existsSync(path.join(__dirname, '../assets/images', file)));
  }
  assert.match(html, /class="ga-film-preview-label">Next film/);
  assert.match(html, /class="ga-film-progress" aria-hidden="true"/);
});
