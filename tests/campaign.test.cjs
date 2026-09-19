const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../assets/campaign.js'), 'utf8');

function fixture({ reduced = false, stored = false } = {}) {
  const classes = new Set();
  const events = {};
  const banner = { hidden: false };
  const close = { addEventListener: (name, cb) => { events.close = cb; } };
  const brand = { focus() { this.focused = true; } };
  const revealed = new Set();
  const target = { classList: { add: name => revealed.add(name) } };
  const observed = new Set();
  class Observer {
    constructor(callback) { events.intersect = callback; }
    observe(el) { observed.add(el); }
    unobserve(el) { observed.delete(el); }
  }
  const saved = new Map(stored ? [['ga-announcement-dismissed', 'yes']] : []);
  const root = { classList: {
    add: name => classes.add(name),
    toggle(name, on) { if (on) classes.add(name); else classes.delete(name); },
  } };
  const context = {
    document: {
      documentElement: root,
      getElementById: id => ({ gaAnnouncement: banner, gaAnnouncementClose: close })[id],
      querySelector: s => s === '.ga-header .ga-brand' ? brand : null,
      querySelectorAll: () => [target],
    },
    sessionStorage: { getItem: key => saved.get(key), setItem: (key, value) => saved.set(key, value) },
    matchMedia: () => ({ matches: reduced }),
    IntersectionObserver: Observer,
    window: { IntersectionObserver: Observer },
  };
  vm.runInNewContext(source, context);
  return { classes, events, banner, brand, saved, revealed, observed, target };
}

test('home leads into the newly titled film without the interactive arrow section', () => {
  const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
  assert.doesNotMatch(html + source, /ga-mission-scroll|ga-mission-arrow|ga-scroll-enabled/);
  assert.match(html, /id="mission-film-title">Watch the mission<\/h2>/);
  assert.match(html, /id="missionTrailer"/);
});

test('entrance reveals still work and respect reduced motion', () => {
  for (const reduced of [false, true]) {
    const f = fixture({ reduced });
    f.events.intersect([{ target: f.target, isIntersecting: false }]);
    assert(f.observed.has(f.target));
    assert.equal(f.revealed.size, 0);
    f.events.intersect([{ target: f.target, isIntersecting: true }]);
    assert.equal(f.revealed.has('ga-reveal-in'), !reduced);
    assert(!f.observed.has(f.target));
  }
});

test('heading sections omit supporting captions without removing body content', () => {
  const root = path.join(__dirname, '..');
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  for (const section of html.matchAll(/<div class="(?:ga-shell ga-film-intro|ga-campaign-heading)">([\s\S]*?)<\/div>/g)) {
    assert.doesNotMatch(section[1], /<p\b/);
  }
  assert.doesNotMatch(html, /class="ga-hero-corners"|class="ga-hero-bottom-note"/);
  assert.match(html, /<h1 class="ga-hero-mission"><span class="ga-sr-only">Reaching this generation with the hope of Christ\.<\/span>/);
  assert.match(html, /src="assets\/images\/hero-mission-artwork\.png"/);
  assert.doesNotMatch(html, /class="ga-wordmark ga-hero-wordmark"/);
  assert.match(html, /class="ga-hero-artwork-link" href="#mission"/);
  assert.match(html, /class="ga-letter-lead"/);
  assert.match(html, /src="assets\/images\/personal-lettering\.svg"/);
  assert.match(html, /class="ga-personal-lettering-text">I want college<br \/>students to know<br \/>the hope of<br \/><em>Jesus Christ\.<\/em>/);
  for (const file of ['articles.html', 'sermons.html', 'preachers-guide.html']) {
    const page = fs.readFileSync(path.join(root, file), 'utf8');
    const header = page.match(/<section class="(?:page-header|guide-hero)">([\s\S]*?)<\/section>/);
    assert(header, file);
    assert.doesNotMatch(header[1], /<p\b/);
  }
});

test('announcement dismissal restores focus and persists for the session', () => {
  const f = fixture();
  f.events.close();
  assert.equal(f.banner.hidden, true);
  assert.equal(f.brand.focused, true);
  assert(f.classes.has('ga-announcement-dismissed'));
  assert.equal(f.saved.get('ga-announcement-dismissed'), 'yes');
  assert.equal(fixture({ stored: true }).banner.hidden, true);
});

test('giving section ends the homepage content', () => {
  const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
  assert.match(html, /id="frontlines-title"/);
  assert.match(html, /href="#contact" data-interest="Financial partnership">Fuel the mission/);
  assert.doesNotMatch(html, /id="partner-title"|class="ga-strategy-card"|class="ga-belief/);
  assert.match(html, /<dialog class="ga-content-dialog" id="contactPanel"/);
});

test('hero and footer use white wordmarks', () => {
  const css = fs.readFileSync(path.join(__dirname, '../assets/campaign.css'), 'utf8');
  assert.match(css, /\.ga-hero-wordmark\s*\{[^}]*color: #fff;/);
  assert.match(css, /\.ga-footer \.ga-wordmark\s*\{[^}]*color: #fff;/);
});

test('all public pages share the adapted five-link header and two action buttons', () => {
  for (const file of ['index.html', 'articles.html', 'sermons.html', 'preachers-guide.html', 'seven-components.html', 'discipleship.html', 'problem-of-evil.html', 'when-you-cant-trace-his-hand.html']) {
    const html = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
    const header = html.match(/<header\b[\s\S]*?<\/header>/)[0];
    assert.match(header, /aria-controls="gaMissionMenu">About/);
    for (const label of ['On Campus', 'Take Action', 'Pastors &amp; Leaders', 'Resources', 'Give', 'Get Involved']) assert(header.includes(`>${label}`), `${file}: ${label}`);
    assert.match(header, /class="ga-button ga-header-donate" href="\/#contact" data-interest="Financial partnership"/);
    assert.doesNotMatch(header, /thesend\.org|ticketspice|tiktok|facebook/);
    assert.equal((header.match(/aria-controls="gaResourcesMenu"/g) || []).length, 1);
  }
});

test('angled hero transitions directly into the trailer with a locally hosted display font', () => {
  const root = path.join(__dirname, '..');
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const css = fs.readFileSync(path.join(root, 'assets/campaign.css'), 'utf8');
  const fonts = fs.readFileSync(path.join(root, 'assets/fonts.css'), 'utf8');
  assert.match(html, /id="heroFilmProgress"[\s\S]*?<\/section>\s*<section class="ga-trailer" id="mission"/);
  assert.match(css, /clip-path: polygon\(0 0,100% 0,100% calc\(100% - var\(--hero-notch\)\),50% 100%,0 calc\(100% - var\(--hero-notch\)\)\)/);
  assert.match(css, /--campaign-display: 'Vina Sans'/);
  assert.match(fonts, /url\(fonts\/vina-sans-regular.ttf\)/);
  assert(fs.statSync(path.join(root, 'assets/fonts/vina-sans-regular.ttf')).size > 1000);
  assert(fs.readFileSync(path.join(root, 'assets/fonts/vina-sans-OFL.txt'), 'utf8').includes('SIL OPEN FONT LICENSE'));
});

test('campaign assets are shared without importing reference-site integrations', () => {
  const root = path.join(__dirname, '..');
  for (const file of ['gospel-advance-website.html', 'index.html', 'articles.html', 'sermons.html', 'preachers-guide.html', 'seven-components.html', 'discipleship.html', 'problem-of-evil.html', 'when-you-cant-trace-his-hand.html']) {
    const html = fs.readFileSync(path.join(root, file), 'utf8');
    assert.equal((html.match(/href="assets\/campaign.css(?:\?[^" ]+)?"/g) || []).length, 1, file);
    assert.equal((html.match(/src="assets\/campaign.js"/g) || []).length, 1, file);
    assert.doesNotMatch(html, /thesend\.org|webflow|typekit|GTM-TS3K9XK5/);
  }
});

test('hero logo does not depend on luminance masks on mobile browsers', () => {
  const css = fs.readFileSync(path.join(__dirname, '../assets/campaign.css'), 'utf8');
  assert.match(css, /\.ga-hero \.ga-hero-wordmark\s*\{[^}]*-webkit-mask-image: none;[^}]*mask-image: none;[^}]*mix-blend-mode: screen;/);
});
