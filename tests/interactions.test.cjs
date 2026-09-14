const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'assets/site.js'), 'utf8');

// Small DOM doubles exercise state transitions; browser checks cover native focus and rendering.
function fixture({ video = false, reducedMotion = false } = {}) {
  const elements = new Map();
  const timers = new Map();
  let timerId = 0;
  let focused;
  class Element {
    constructor(id) {
      this.id = id;
      this.events = {};
      this.attrs = {};
      this.style = {};
      this.dataset = {};
      this.children = [];
      this.queries = {};
      this.hidden = false;
      this.open = false;
      const classes = new Set();
      this.classList = {
        add: name => classes.add(name), remove: name => classes.delete(name),
        contains: name => classes.has(name),
        toggle(name, force) { if (force) classes.add(name); else classes.delete(name); },
      };
      elements.set(id, this);
    }
    addEventListener(name, fn) { (this.events[name] ||= []).push(fn); }
    emit(name, event = {}) { for (const fn of this.events[name] || []) fn({ target: this, preventDefault() {}, ...event }); }
    setAttribute(name, value) { this.attrs[name] = value; }
    getAttribute(name) { return this.attrs[name]; }
    removeAttribute(name) { delete this.attrs[name]; }
    querySelectorAll(selector) { return this.queries[selector] || []; }
    querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
    focus() { focused = this; }
    contains(element) { return element === this || this.children.includes(element); }
    showModal() { this.open = true; }
    close() { this.open = false; this.emit('close'); }
    replaceChildren() { this.children = []; }
    append(...children) { this.children.push(...children); }
    getBoundingClientRect() { return { left: 0, right: 100, top: 0, bottom: 100 }; }
  }
  const make = id => new Element(id);
  const header = make('gaHeader');
  const mission = make('missionTrigger');
  const resources = make('resourcesTrigger');
  const missionPanel = make('gaMissionMenu');
  const resourcesPanel = make('gaResourcesMenu');
  mission.setAttribute('aria-controls', missionPanel.id);
  resources.setAttribute('aria-controls', resourcesPanel.id);
  missionPanel.hidden = resourcesPanel.hidden = true;
  const firstLink = make('firstMissionLink');
  missionPanel.queries.a = [firstLink];
  header.queries['.ga-nav-trigger'] = [mission, resources];
  header.children = [mission, resources, firstLink];
  const backdrop = make('gaMenuBackdrop');
  const menu = make('gaMobileNav');
  const mobileRoot = make('gaMobileRoot');
  const mobileTrigger = make('mobileResourcesTrigger');
  mobileTrigger.dataset.mobilePanel = 'gaMobileResources';
  const mobilePanel = make('gaMobileResources');
  const mobileBack = make('mobileBack');
  mobilePanel.queries['[data-mobile-back]'] = [mobileBack];
  menu.queries['[data-mobile-panel]'] = [mobileTrigger];
  menu.queries['.ga-mobile-panel'] = [mobilePanel];
  menu.queries['[data-mobile-back]'] = [mobileBack];
  make('gaMenuToggle');
  make('gaMenuClose');
  const search = make('gaSearchDialog');
  const input = make('gaSearchInput');
  input.value = '';
  const results = make('gaSearchResults');
  make('gaSearchStatus');
  make('gaSearchForm');
  make('gaSearchClose');
  const searchOpen = make('searchOpen');
  const document = make('document');
  document.body = { style: {} };
  document.hidden = false;
  Object.defineProperty(document, 'activeElement', { get: () => focused });
  document.getElementById = id => elements.get(id) || null;
  document.createElement = tag => make(`${tag}-${elements.size}`);
  document.queries['[data-search-open]'] = [searchOpen];
  const mediaQueries = new Map();
  const window = make('window');
  window.scrollY = 0;
  window.matchMedia = query => {
    if (!mediaQueries.has(query)) { const result = make(query); result.matches = query.includes('reduced-motion') ? reducedMotion : false; mediaQueries.set(query, result); }
    return mediaQueries.get(query);
  };
  const observers = [];
  if (video) {
    const dialog = make('mediaDialog');
    const dialogPlayer = make('dialogPlayer');
    make('mediaEmpty');
    make('mediaEmptyCopy');
    make('mediaTitle');
    make('mediaClose');
    dialog.queries['[data-close-media]'] = [make('mediaEmptyClose')];
    const hero = make('heroVideo');
    hero.paused = true;
    hero.parentElement = { offsetHeight: 700 };
    hero.play = () => { hero.paused = false; hero.emit('play'); return Promise.resolve(); };
    hero.pause = () => { hero.paused = true; hero.emit('pause'); };
    make('heroFilmTools');
    make('heroFilmLabel');
    make('heroFilmProgress');
    for (const id of ['heroPlay', 'heroMute']) make(id).queries.img = [make(`${id}Icon`)];
    const watch = make('watchTrailer');
    watch.dataset.media = 'trailer';
    document.queries['[data-media]'] = [watch];
    window.GOSPEL_ADVANCE_MEDIA = { heroPreview: 'https://example.test/campus.mp4' };
    dialogPlayer.queries.video = [];
  }
  vm.runInNewContext(source, {
    document, window, location: { href: 'https://example.test/', hash: '' }, URL,
    setTimeout: callback => { timers.set(++timerId, callback); return timerId; },
    clearTimeout: id => timers.delete(id),
    requestAnimationFrame: callback => callback(),
    IntersectionObserver: class { constructor(callback) { this.callback = callback; observers.push(this); } observe() {} },
  });
  return { elements, header, mission, resources, missionPanel, resourcesPanel, firstLink, backdrop, menu, mobileRoot, mobileTrigger, mobilePanel, mobileBack, search, input, results, searchOpen, document, window, mediaQueries, observers, focused: () => focused, flushTimers: () => { const callbacks = [...timers.values()]; timers.clear(); callbacks.forEach(fn => fn()); } };
}

test('mega menus switch without leaving a second panel open, and Escape restores focus', () => {
  const f = fixture();
  f.mission.emit('click');
  assert.equal(f.missionPanel.inert, false);
  assert.equal(f.document.body.style.overflow, 'hidden');
  f.resources.emit('pointerenter', { pointerType: 'mouse' });
  assert.equal(f.missionPanel.inert, true);
  assert.equal(f.resourcesPanel.inert, false);
  f.document.emit('keydown', { key: 'Escape' });
  assert.equal(f.resourcesPanel.inert, true);
  assert.equal(f.header.classList.contains('menu-open'), false);
  assert.equal(f.document.body.style.overflow, '');
  assert.equal(f.focused(), f.resources);
});

test('first hover opens the menu; leaving closes it, while re-entry cancels dismissal', () => {
  const f = fixture();
  f.mission.emit('pointerenter', { pointerType: 'mouse' });
  assert.equal(f.missionPanel.inert, false);
  f.mission.emit('click', { detail: 1, pointerType: 'mouse' });
  assert.equal(f.missionPanel.inert, false, 'click must not undo the initial hover');
  f.header.emit('pointerleave', { pointerType: 'mouse' });
  f.header.emit('pointerenter', { pointerType: 'mouse' });
  f.flushTimers();
  assert.equal(f.missionPanel.inert, false);
  f.header.emit('pointerleave', { pointerType: 'mouse' });
  f.resources.emit('pointerenter', { pointerType: 'mouse' });
  f.flushTimers();
  assert.equal(f.resourcesPanel.inert, false, 'switching cancels a pending dismissal');
  f.header.emit('pointerleave', { pointerType: 'mouse' });
  f.flushTimers();
  assert.equal(f.missionPanel.inert, true);
  assert.equal(f.resourcesPanel.inert, true);
  assert.equal(f.backdrop.inert, true);
  assert.equal(f.document.body.style.overflow, '');
});

test('keyboard menus survive pointer exit and keyboard or touch activation can toggle', () => {
  const f = fixture();
  f.mission.emit('click', { detail: 0 });
  f.header.emit('pointerleave', { pointerType: 'mouse' });
  f.flushTimers();
  assert.equal(f.missionPanel.inert, false);
  f.mission.emit('click', { detail: 0 });
  assert.equal(f.missionPanel.inert, true);
  f.mission.emit('pointerenter', { pointerType: 'touch' });
  assert.equal(f.missionPanel.inert, true, 'touch must not open on pointer enter');
  f.mission.emit('click', { detail: 1, pointerType: 'touch' });
  assert.equal(f.missionPanel.inert, false);
  f.mission.emit('click', { detail: 1, pointerType: 'touch' });
  assert.equal(f.missionPanel.inert, true);
});

test('mobile submenus replace the root, restore focus on Back, and reset on close', () => {
  const f = fixture();
  f.elements.get('gaMenuToggle').emit('click');
  f.mobileTrigger.emit('click');
  assert.equal(f.mobileRoot.inert, true);
  assert.equal(f.mobilePanel.inert, false);
  assert.equal(f.focused(), f.mobileBack);
  f.mobileBack.emit('click');
  assert.equal(f.mobileRoot.inert, false);
  assert.equal(f.mobilePanel.inert, true);
  assert.equal(f.focused(), f.mobileTrigger);
  f.mobileTrigger.emit('click');
  let prevented = false;
  f.menu.emit('cancel', { preventDefault() { prevented = true; } });
  assert.equal(prevented, true);
  assert.equal(f.menu.open, true);
  assert.equal(f.mobileRoot.inert, false);
  f.mobileTrigger.emit('click');
  f.menu.close();
  assert.equal(f.mobilePanel.inert, true);
  assert.equal(f.mobileRoot.inert, false);
  assert.equal(f.mobileTrigger.getAttribute('aria-expanded'), 'false');
});

test('Arrow Down enters the panel and outside click or focus dismisses it', () => {
  const f = fixture();
  f.mission.emit('keydown', { key: 'ArrowDown' });
  assert.equal(f.focused(), f.firstLink);
  f.backdrop.emit('click');
  assert.equal(f.focused(), f.mission);
  f.mission.emit('click');
  f.document.emit('focusin', { target: {} });
  assert.equal(f.missionPanel.inert, true);
});

test('responsive transitions close the obsolete menu and unlock scrolling', () => {
  const f = fixture();
  f.mission.emit('click');
  f.mediaQueries.get('(max-width: 1099px)').emit('change', { matches: true });
  assert.equal(f.missionPanel.inert, true);
  f.elements.get('gaMenuToggle').emit('click');
  assert.equal(f.menu.open, true);
  f.mediaQueries.get('(min-width: 1100px)').emit('change', { matches: true });
  assert.equal(f.menu.open, false);
  assert.equal(f.document.body.style.overflow, '');
});

test('search closes navigation, matches topics, and safely handles unmatched input', () => {
  const f = fixture();
  f.mission.emit('click');
  f.searchOpen.emit('click');
  assert.equal(f.missionPanel.inert, true);
  assert.equal(f.search.open, true);
  assert.equal(f.focused(), f.input);
  f.input.value = 'EVIL';
  f.input.emit('input');
  assert.equal(f.results.children.length, 1);
  assert.equal(f.results.children[0].children[0].href, 'problem-of-evil.html');
  f.input.value = '<img src=x onerror=alert(1)>';
  f.input.emit('input');
  assert.match(f.elements.get('gaSearchStatus').textContent, /No results/);
  assert.equal(f.results.children[0].children[0].href, 'index.html#contact');
  f.search.close();
  assert.equal(f.document.body.style.overflow, '');
});

test('hero pauses behind dialogs and offscreen, while preserving explicit pause', () => {
  const f = fixture({ video: true });
  const hero = f.elements.get('heroVideo');
  hero.emit('loadedmetadata');
  assert.equal(hero.paused, false);
  assert.equal(hero.muted, true);
  f.elements.get('watchTrailer').emit('click');
  assert.equal(hero.paused, true);
  f.elements.get('mediaDialog').close();
  assert.equal(hero.paused, false);
  f.observers[0].callback([{ isIntersecting: false }]);
  assert.equal(hero.paused, true);
  f.observers[0].callback([{ isIntersecting: true }]);
  assert.equal(hero.paused, false);
  f.document.hidden = true;
  f.document.emit('visibilitychange');
  assert.equal(hero.paused, true);
  f.document.hidden = false;
  f.document.emit('visibilitychange');
  assert.equal(hero.paused, false);
  f.mission.emit('click');
  assert.equal(hero.paused, true);
  f.backdrop.emit('click');
  assert.equal(hero.paused, false);
  f.elements.get('heroPlay').emit('click');
  f.searchOpen.emit('click');
  f.search.close();
  assert.equal(hero.paused, true);
});

test('reduced-motion hero starts paused, permits an explicit play, and has an error fallback', () => {
  const f = fixture({ video: true, reducedMotion: true });
  const hero = f.elements.get('heroVideo');
  hero.emit('loadedmetadata');
  assert.equal(hero.paused, true);
  f.elements.get('heroPlay').emit('click');
  assert.equal(hero.paused, false);
  hero.emit('error');
  assert.equal(hero.hidden, true);
  assert.equal(f.elements.get('heroFilmTools').hidden, true);
  assert.match(f.elements.get('heroFilmLabel').textContent, /unavailable/);
});

test('shared navigation stays identical on all public pages', () => {
  const home = fs.readFileSync(path.join(root, 'gospel-advance-website.html'), 'utf8');
  const shared = html => html.slice(html.indexOf('<header class="ga-header"'), html.indexOf('</dialog>', html.indexOf('id="gaSearchDialog"')) + 9);
  for (const file of ['index.html', 'sermons.html', 'articles.html', 'preachers-guide.html', 'seven-components.html', 'discipleship.html', 'problem-of-evil.html', 'when-you-cant-trace-his-hand.html']) {
    assert.equal(shared(fs.readFileSync(path.join(root, file), 'utf8')), shared(home), file);
  }
});
