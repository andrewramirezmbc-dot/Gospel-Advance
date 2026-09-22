const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('public pages expose a focused giving invitation in the footer', () => {
  for (const page of ['index.html', 'articles.html', 'sermons.html', 'preachers-guide.html', 'seven-components.html', 'discipleship.html', 'problem-of-evil.html', 'when-you-cant-trace-his-hand.html']) {
    const html = fs.readFileSync(path.join(__dirname, '..', page), 'utf8');
    const row = html.match(/<section class="ga-footer-giving"[\s\S]*?<\/section>/)?.[0];
    if (page === 'index.html') {
      assert.equal(row, undefined);
      assert.match(html, /id="fuel-the-mission"/);
      continue;
    }
    assert.ok(row, page);
    assert.ok(row.includes('href="/#contact" data-interest="Financial partnership">Support the mission'), page);
    assert.doesNotMatch(html, /class="ga-footer-actions"/);
  }
});
