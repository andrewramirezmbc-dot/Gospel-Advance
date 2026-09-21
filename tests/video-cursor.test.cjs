const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.join(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'assets/video-cursor.js'), 'utf8');
function fixture({ fine = true, reduced = false, tile = false } = {}) {
  const element = () => {
    const classes = new Set(), events = {};
    return { classes, events, style: {}, setAttribute() {}, hasAttribute: () => false,
      classList: { add: name => classes.add(name), remove: name => classes.delete(name) },
      addEventListener: (name, fn) => {
        const previous = events[name];
        events[name] = previous ? event => { previous(event); fn(event); } : fn;
      } };
  };
  const target = element(), cursor = element(), document = element(), window = element();
  let plays = 0;
  target.hasAttribute = () => tile;
  target.querySelector = () => ({ click: () => plays++ });
  const pointer = { matches: fine, addEventListener(name, fn) { this.change = fn; } };
  const motion = { matches: reduced, addEventListener(name, fn) { this.change = fn; } };
  document.querySelectorAll = () => [target];
  document.querySelector = () => document.dialog ? {} : null;
  document.createElement = () => cursor;
  document.body = { append() {} };
  vm.runInNewContext(source, { document, window, matchMedia: query => query.includes('reduce') ? motion : pointer });
  return { target, cursor, document, window, pointer, motion, plays: () => plays,
    move(type = 'mouse') { target.events.pointermove({ clientX: 100, clientY: 200, pointerType: type }); } };
}
test('hover transforms cursor; leave, click, keyboard, scroll and blur restore it', () => {
  const f = fixture();
  for (const reset of [f.target.events.pointerleave, f.target.events.click, f.document.events.keydown, f.window.events.scroll, f.window.events.blur]) {
    f.move(); assert(f.target.classes.has('ga-cursor-active')); assert(f.cursor.classes.has('is-visible'));
    assert.equal(f.cursor.style.left, '100px'); reset();
    assert(!f.cursor.classes.has('is-visible')); assert(!f.target.classes.has('ga-cursor-active'));
  }
});
test('touch, reduced motion and dialogs retain native cursors', () => {
  for (const options of [{ fine: false }, { reduced: true }]) {
    const f = fixture(options); f.move(); assert(!f.cursor.classes.has('is-visible'));
  }
  const f = fixture(); f.move('touch'); assert(!f.cursor.classes.has('is-visible'));
  f.document.dialog = true; f.move(); assert(!f.cursor.classes.has('is-visible'));
  f.document.dialog = false; f.move(); f.motion.change(); assert(!f.cursor.classes.has('is-visible'));
});
test('removed campaign films and action cards stay absent', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  assert.doesNotMatch(html, /class="ga-campaign-film"|class="ga-strategy-card"|class="ga-belief/);
});
test('video tiles forward surface clicks once and preserve button clicks', () => {
  const f = fixture({ tile: true });
  f.target.events.click({ target: { closest: () => null } });
  assert.equal(f.plays(), 1);
  f.target.events.click({ target: { closest: () => ({}) } });
  assert.equal(f.plays(), 1);
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  assert.equal((html.match(/data-video-cursor-tile/g) || []).length, 3);
  assert.doesNotMatch(html, /class="ga-film-nav[^"]*"[^>]*data-video-cursor/);
});
