const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'assets/statistics.js'), 'utf8');

function fixture({ reduced = false, supported = true, values = ['37', '33', '24', '2.7'] } = {}) {
  const frames = new Map();
  const observed = new Set();
  let callback, frameId = 0;
  const cards = values.map(value => {
    const classes = new Set();
    const number = { textContent: value, dataset: { count: value, decimals: value.includes('.') ? '1' : '0' } };
    return { classes, number, querySelector: () => number,
      classList: { add: name => classes.add(name), remove: name => classes.delete(name) } };
  });
  const motion = { matches: reduced, addEventListener: (name, fn) => { motion.change = fn; } };
  const document = { hidden: false, querySelectorAll: () => cards,
    addEventListener: (name, fn) => { document[name] = fn; } };
  class Observer {
    constructor(fn) { callback = fn; }
    observe(card) { observed.add(card); }
    unobserve(card) { observed.delete(card); }
    disconnect() { observed.clear(); }
  }
  vm.runInNewContext(source, {
    document, window: { matchMedia: () => motion, ...(supported ? { IntersectionObserver: Observer } : {}) },
    IntersectionObserver: Observer,
    requestAnimationFrame: fn => { frames.set(++frameId, fn); return frameId; },
    cancelAnimationFrame: id => frames.delete(id),
  });
  return { cards, frames, motion, document, observed,
    enter(card) { callback([{ target: card, isIntersecting: true }]); },
    tick(time) { const pending = [...frames.values()]; frames.clear(); pending.forEach(fn => fn(time)); },
  };
}

test('statistics appear and count once, reaching their exact sourced values', () => {
  const f = fixture();
  const card = f.cards[0];
  assert(card.classes.has('ga-stat-waiting'));
  f.enter(card);
  assert(!card.classes.has('ga-stat-waiting'));
  assert.equal(card.number.textContent, '0');
  f.tick(0);
  f.tick(700);
  assert(Number(card.number.textContent) > 0 && Number(card.number.textContent) < 37);
  f.tick(1400);
  assert.equal(card.number.textContent, '37');
  assert.equal(f.frames.size, 0);
  f.enter(card);
  assert.equal(card.number.textContent, '37');
  assert.equal(f.frames.size, 0);
});

test('decimal values retain their precision', () => {
  const f = fixture();
  f.enter(f.cards[3]);
  f.tick(0);
  f.tick(1400);
  assert.equal(f.cards[3].number.textContent, '2.7');
});

test('reduced motion and missing observer support preserve static final values', () => {
  for (const options of [{ reduced: true }, { supported: false }]) {
    const f = fixture(options);
    assert.equal(f.observed.size, 0);
    assert.deepEqual(f.cards.map(card => card.number.textContent), ['37', '33', '24', '2.7']);
    assert(f.cards.every(card => !card.classes.has('ga-stat-waiting')));
  }
});

test('enabling reduced motion settles running and unseen statistics', () => {
  const f = fixture();
  f.enter(f.cards[0]);
  f.tick(0);
  f.motion.matches = true;
  f.motion.change();
  assert.equal(f.frames.size, 0);
  assert.equal(f.observed.size, 0);
  assert.deepEqual(f.cards.map(card => card.number.textContent), ['37', '33', '24', '2.7']);
  assert(f.cards.every(card => !card.classes.has('ga-stat-waiting')));
});

test('hidden tabs finish active counters but do not consume unseen reveals', () => {
  const f = fixture();
  f.enter(f.cards[0]);
  f.tick(0);
  f.document.hidden = true;
  f.document.visibilitychange();
  assert.equal(f.cards[0].number.textContent, '37');
  assert.equal(f.frames.size, 0);
  assert(f.observed.has(f.cards[1]));
});

test('invalid statistics remain static instead of animating fabricated values', () => {
  const f = fixture({ values: ['NaN', '-1', '9007199254740992'] });
  assert.equal(f.observed.size, 0);
});

test('statistics precede Andrew, with accessible values and research preserved in project notes', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  assert(html.indexOf('id="generation"') < html.indexOf('id="about"'));
  assert.match(html, /src="assets\/statistics.js" defer/);
  for (const value of ['66', '3810', '3400000']) {
    assert(html.includes(`data-count="${value}"`));
  }
  const notes = fs.readFileSync(path.join(root, 'assets/STATISTICS.md'), 'utf8');
  assert.match(notes, /Young-Adult-Church-Dropout-Report-2017.pdf/);
  assert.match(notes, /cdc.gov\/nchs\/products\/databriefs\/db549.htm/);
  assert.match(notes, /2025-nsduh-annual-national-report.pdf/);
  assert(!html.includes('class="ga-stat-sources"'));
  assert.match(html, /href="assets\/pressure.css"/);
  for (const name of ['church', 'pressure', 'care']) {
    assert(html.includes(`assets/images/generation-${name}.jpg`));
    assert(fs.existsSync(path.join(root, `assets/images/generation-${name}.jpg`)));
  }
});

test('large counts finish with readable grouping', () => {
  const f = fixture({ values: ['3810', '3400000'] });
  f.cards.forEach(card => f.enter(card)); f.tick(0); f.tick(1400);
  assert.deepEqual(f.cards.map(card => card.number.textContent), ['3,810', '3,400,000']);
});
