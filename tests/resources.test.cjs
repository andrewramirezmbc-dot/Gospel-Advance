const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

test('resources omits the homepage media section and retains sermons', () => {
  const html = read('resources.html');
  assert.match(read('index.html'), /assets\/media-library.css/);
  assert.doesNotMatch(html, /resource-watch ga-media-library|Faith worth sharing\./);
  for (const script of ['media-config', 'resource-sermons', 'site']) {
    assert(html.includes(`assets/${script}.js`));
  }
  assert.match(html, /id="mediaDialog"/);
  assert.match(html, /resource-sermons-title/);
  assert.match(html, /href="\/sermons.html"/);
  assert.doesNotMatch(html, /resource-watch-feature/);
});

test('flagship resource has a real PDF download and a separate preview', () => {
  const html = read('resources.html');
  assert.match(html, /href="\/assets\/downloads\/share-jesus-without-fear.pdf" download="Gospel-Advance-Share-Jesus-Without-Fear.pdf"/);
  assert.match(html, /href="\/assets\/downloads\/share-jesus-without-fear.pdf#page=1" target="_blank" rel="noopener">Preview guide/);
  assert.match(html, /src="assets\/images\/share-jesus-cover.jpg"/);
  const pdf = fs.readFileSync(path.join(root, 'assets/downloads/share-jesus-without-fear.pdf'));
  assert.equal(pdf.subarray(0, 5).toString(), '%PDF-');
  assert(pdf.length > 100000);
});

test('resource library places Academy directly after the flagship guide', () => {
  const html = read('resources.html');
  let previous = -1;
  for (const section of ['resource-flagship', 'resource-academy', 'resource-articles', 'resource-sermons']) {
    const index = html.indexOf(`<section class="${section}`);
    assert(index > previous, section);
    previous = index;
  }
  for (const href of ['https://101bible.org/', 'https://101bible.org/bible-101-course.html', 'https://101bible.org/growing-in-grace.html']) {
    assert(html.includes(`href="${href}"`));
  }
  assert.match(html, /Gospel Advance<br \/><em>Academy/);
  for (const image of ['academy-bible.png', 'academy-grace.png']) {
    assert(html.includes(`assets/images/${image}`));
    assert(fs.existsSync(path.join(root, 'assets/images', image)));
  }
});

test('Resources opens a dedicated page from desktop and mobile on every full-page shell', () => {
  for (const file of ['index.html', 'resources.html', 'articles.html', 'sermons.html', 'preachers-guide.html', 'seven-components.html', 'discipleship.html', 'problem-of-evil.html', 'when-you-cant-trace-his-hand.html']) {
    const html = read(file);
    const header = html.match(/<header\b[\s\S]*?<\/header>/)[0];
    const mobile = html.match(/<dialog class="ga-mobile-menu"[\s\S]*?<\/dialog>/)[0];
    for (const nav of [header, mobile]) {
      assert.match(nav, /href="\/resources.html">Resources<\/a>/, file);
      assert.match(nav, /href="https:\/\/101bible.org\/">Gospel Advance Academy<\/a>/, file);
      assert.doesNotMatch(nav, /preachers-guide.html|gaResourcesMenu|gaMobileResources/, file);
    }
  }
});

test('resource hub and search list existing content without the preparation guide', () => {
  const html = read('resources.html');
  assert.doesNotMatch(html, /preachers-guide.html|Preachers_Preparation_Guide/);
  for (const href of ['/sermons.html', '/articles.html', '/seven-components.html', '/discipleship.html', '/problem-of-evil.html', '/when-you-cant-trace-his-hand.html']) {
    assert(html.includes(`href="${href}"`), href);
    assert(fs.existsSync(path.join(root, href.slice(1))));
  }
  const script = read('assets/site.js');
  assert.match(script, /\['Resources', '\/resources.html'/);
  assert.doesNotMatch(script, /preachers-guide.html/);
  assert.match(read('index.html'), /ga-media-resources" href="\/resources.html"/);
});
