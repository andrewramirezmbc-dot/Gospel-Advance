const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');

test('testimony has a playable local web copy and an accessible trigger', () => {
  const context = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(root, 'assets/media-config.js'), 'utf8'), context);
  const source = context.window.GOSPEL_ADVANCE_MEDIA.testimony;
  const size = fs.statSync(path.join(root, source)).size;
  assert(size > 0 && size < 100 * 1024 * 1024);
  const home = fs.readFileSync(path.join(root, 'gospel-advance-website.html'), 'utf8');
  assert.match(home, /<button[^>]*type="button"[^>]*data-media="testimony"/);
  assert.match(home, /Watch testimony/);
  assert.equal(home, fs.readFileSync(path.join(root, 'index.html'), 'utf8'));
});
