const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

test('Resources opens a dedicated page from desktop and mobile on every full-page shell', () => {
  for (const file of ['index.html', 'resources.html', 'articles.html', 'sermons.html', 'preachers-guide.html', 'seven-components.html', 'discipleship.html', 'problem-of-evil.html', 'when-you-cant-trace-his-hand.html']) {
    const html = read(file);
    const header = html.match(/<header\b[\s\S]*?<\/header>/)[0];
    const mobile = html.match(/<dialog class="ga-mobile-menu"[\s\S]*?<\/dialog>/)[0];
    for (const nav of [header, mobile]) {
      assert.match(nav, /href="\/resources.html">Resources<\/a>/, file);
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
