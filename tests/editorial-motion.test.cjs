const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const source = fs.readFileSync(require('node:path').join(__dirname, '../assets/editorial-motion.js'), 'utf8');
function fixture(pathname = '/', reduced = false) {
  let callback, options, observed = 0, cancelled = 0;
  const listeners = {};
  const preference = { matches: reduced, addEventListener: (_, fn) => listeners.motion = fn };
  const element = {
    closest: () => null, querySelector: () => null, matches: () => false,
    parentElement: { closest: () => null },
    animate: (_, opts) => { options = opts; return { cancel() { cancelled++; this.oncancel(); } }; }
  };
  class Observer {
    constructor(fn) { callback = fn; }
    observe() { observed++; }
    unobserve() {}
  }
  vm.runInNewContext(source, {
    location: { pathname }, matchMedia: () => preference,
    window: { IntersectionObserver: Observer, addEventListener() {} },
    IntersectionObserver: Observer, Element: { prototype: { animate() {} } },
    document: { querySelector: () => null, querySelectorAll: () => [element],
      addEventListener: (name, fn) => listeners[name] = fn }
  });
  return { enter: () => callback([{ isIntersecting: true, target: element }]),
    observed: () => observed, options: () => options, cancelled: () => cancelled, listeners };
}
test('arrivals use 600ms motion and keyboard focus cancels it', () => {
  const f = fixture(); f.enter();
  assert.equal(f.options().duration, 600);
  f.listeners.focusin(); assert.equal(f.cancelled(), 1);
});
test('reduced motion does not animate', () => {
  const f = fixture('/', true); f.enter(); assert.equal(f.options(), undefined);
});
test('My Learning dashboards are excluded before observation', () => {
  for (const path of ['/bible-101-dashboard.html', '/growing-in-grace-dashboard', '/my-learning']) {
    assert.equal(fixture(path).observed(), 0);
  }
});
