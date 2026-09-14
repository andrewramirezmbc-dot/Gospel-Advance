const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../assets/site.js'), 'utf8');

function fixture(fetchResult) {
  const elements = new Map();
  const requests = [];
  function element(id) {
    const e = {
      id, value: '', hidden: true, disabled: false, dataset: {}, events: {},
      innerHTML: "Let's Connect", style: {},
      addEventListener(name, callback) { this.events[name] = callback; },
      setAttribute(name, value) { this[name] = value; },
      removeAttribute(name) { delete this[name]; },
      focus() { this.focused = true; },
    };
    elements.set(id, e);
    return e;
  }
  const form = element('contactForm');
  form.action = 'https://formspree.io/f/mvzbqgwq';
  form.reportValidity = () => true;
  form.reset = () => { form.resetCalled = true; };
  for (const id of ['contactBtn','contactInterest','contactInterestNote','contactName','formStatus']) element(id);
  const partner = element('partner');
  partner.dataset.interest = 'Financial partnership';
  const document = {
    body: { style: {} },
    getElementById: id => elements.get(id) || null,
    querySelector: () => null,
    querySelectorAll: selector => selector === '[data-interest]' ? [partner] : [],
  };
  const context = {
    document,
    location: { hash: '', href: 'https://example.test/' },
    window: { scrollY: 0, addEventListener() {}, matchMedia: () => ({ matches: false, addEventListener() {} }) },
    requestAnimationFrame: callback => callback(),
    setTimeout, clearTimeout, AbortController, URL,
    FormData: class { constructor() { this.interest = elements.get('contactInterest').value; } },
    fetch: async (...args) => {
      requests.push(args);
      if (fetchResult instanceof Error) throw fetchResult;
      return fetchResult;
    },
  };
  vm.runInNewContext(source, context);
  const submit = () => form.events.submit({ preventDefault() {} });
  return { elements, form, partner, requests, submit };
}

test('partnership choice reaches the submitted form data', async () => {
  const f = fixture({ ok: true });
  f.partner.events.click();
  assert.equal(f.elements.get('contactInterest').value, 'Financial partnership');
  assert.equal(f.elements.get('contactName').focused, true);
  await f.submit();
  assert.equal(f.requests[0][0], 'https://formspree.io/f/mvzbqgwq');
  assert.equal(f.requests[0][1].body.interest, 'Financial partnership');
  assert.equal(f.requests[0][1].method, 'POST');
  assert.equal(f.elements.get('formStatus').dataset.state, 'success');
  assert.equal(f.form.resetCalled, true);
  assert.equal(f.elements.get('contactBtn').disabled, false);
});

test('server errors retain the inquiry and restore the submit button', async () => {
  const f = fixture({ ok: false });
  await f.submit();
  assert.equal(f.form.resetCalled, undefined);
  assert.equal(f.elements.get('formStatus').dataset.state, 'error');
  assert.equal(f.elements.get('formStatus').hidden, false);
  assert.equal(f.elements.get('contactBtn').disabled, false);
});

test('network failures allow a retry without clearing the form', async () => {
  const f = fixture(new Error('offline'));
  await f.submit();
  assert.equal(f.form.resetCalled, undefined);
  assert.equal(f.elements.get('formStatus').dataset.state, 'error');
  assert.equal(f.elements.get('contactBtn').innerHTML, "Let's Connect");
});

test('invalid forms and in-flight submissions do not send a request', async () => {
  const f = fixture({ ok: true });
  f.form.reportValidity = () => false;
  await f.submit();
  assert.equal(f.requests.length, 0);
  f.form.reportValidity = () => true;
  f.elements.get('contactBtn').disabled = true;
  await f.submit();
  assert.equal(f.requests.length, 0);
});

test('homepage working and published copies stay identical', () => {
  const root = path.join(__dirname, '..');
  assert.equal(fs.readFileSync(path.join(root, 'index.html'), 'utf8'), fs.readFileSync(path.join(root, 'gospel-advance-website.html'), 'utf8'));
});

test('interviews use real source frames and retain a separate mission trailer', () => {
  const root = path.join(__dirname, '..');
  const home = fs.readFileSync(path.join(root, 'gospel-advance-website.html'), 'utf8');
  const css = fs.readFileSync(path.join(root, 'assets/site.css'), 'utf8');
  assert.doesNotMatch(home + css, /campus-hero(?:-approved)?\.jpg|campus-scenes\.jpg|illustrative preview/i);
  for (const name of ['campus-conversation-hero', 'campus-conversation-listening', 'campus-conversation-student', 'studio-conversation', 'studio-host', 'studio-guest']) {
    assert(fs.statSync(path.join(root, `assets/images/${name}.jpg`)).size > 0);
  }
  const context = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(root, 'assets/media-config.js'), 'utf8'), context);
  const media = context.window.GOSPEL_ADVANCE_MEDIA;
  assert.match(media.conversation1, /kb5IJw_TKBM/);
  assert.match(media.conversation2, /K_fDMT9DLFo/);
  assert.equal(media.trailer, '');
  assert.equal(media.heroHasAudio, false);
  for (const file of [media.heroPreview, media.heroPreviewMobile]) {
    assert.match(file, /^assets\/video\/hero-campus-(desktop|mobile)\.mp4$/);
    assert(fs.statSync(path.join(root, file)).size > 100000);
  }
  const hero = home.match(/<section class="ga-hero"[\s\S]*?<\/section>/)[0];
  assert.match(hero, /<video id="heroVideo"[^>]*muted playsinline loop/);
  assert.doesNotMatch(hero, /ga-hero-image|poster=|assets\/images\//);
  assert.match(hero, /hero-campus-desktop\.jpg/);
  assert.match(hero, /hero-campus-mobile\.jpg/);
  assert.doesNotMatch(home, /rel="preload"[^>]*campus-conversation/);
});

test('process illustrations stay scoped and About uses the original preaching photo', () => {
  const root = path.join(__dirname, '..');
  const home = fs.readFileSync(path.join(root, 'gospel-advance-website.html'), 'utf8');
  for (const name of ['process-engage', 'process-share-christ', 'process-connect']) {
    assert(home.includes(`assets/images/${name}.jpg`));
    assert(fs.statSync(path.join(root, `assets/images/${name}.jpg`)).size > 0);
  }
  assert.doesNotMatch(home, /ga-resource-photo/);
  assert.doesNotMatch(home, /andrew-portrait-refined/);
  assert.match(home, /class="ga-andrew-photo" src="andrew-ramirez.jpg"[^>]*width="600" height="800"/);
  assert(fs.existsSync(path.join(root, 'andrew-ramirez.jpg')));
});

test('mission section is an image-free statement of campus evangelism and connection', () => {
  const home = fs.readFileSync(path.join(__dirname, '../gospel-advance-website.html'), 'utf8');
  const mission = home.match(/<section[^>]*id="mission"[\s\S]*?<\/section>/)[0];
  assert.doesNotMatch(mission, /<img|role="img"|ga-scene|ga-calling-photo/);
  assert.match(mission, /Reaching college students/);
  assert.match(mission, /the gospel of Jesus Christ/);
  assert.match(mission, /invite them to follow Christ/);
  assert.match(mission, /existing Christian ministries on their campus/);
});
