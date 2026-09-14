const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const pages = ['articles.html', 'sermons.html', 'preachers-guide.html', 'seven-components.html', 'discipleship.html', 'problem-of-evil.html', 'when-you-cant-trace-his-hand.html'];

test('all resource pages use the shared modern stylesheet and accessible content landmark', () => {
  for (const file of pages) {
    const html = fs.readFileSync(path.join(root, file), 'utf8');
    assert.match(html, /href="assets\/fonts.css"/);
    assert.match(html, /href="assets\/subpages.css"/);
    assert.match(html, /<main id="main">/);
    assert.match(html, /class="ga-skip" href="#main"/);
    assert.doesNotMatch(html, /<style>|fonts.googleapis.com/);
    assert.equal((html.match(/<main\b/g) || []).length, 1);
    for (const match of html.matchAll(/(?:src|href)="((?:assets\/)[^"#?]+)"/g)) {
      assert(fs.existsSync(path.join(root, match[1])), `${file}: missing ${match[1]}`);
    }
  }
});

test('guide downloads and the keyboard-operable sermon player remain available', () => {
  const guide = fs.readFileSync(path.join(root, 'preachers-guide.html'), 'utf8');
  for (const name of ['Preachers_Preparation_Guide', 'Sermon_Outline_Template']) {
    for (const ext of ['pdf', 'docx']) {
      assert(guide.includes(`${name}.${ext}`));
      assert(fs.statSync(path.join(root, `${name}.${ext}`)).size > 0);
    }
  }
  const sermons = fs.readFileSync(path.join(root, 'sermons.html'), 'utf8');
  assert.match(sermons, /<button class="sermon-play" type="button" aria-label="Play/);
  assert.match(sermons, /youtube.com\/embed\/-wMeu74tAxQ/);
});
