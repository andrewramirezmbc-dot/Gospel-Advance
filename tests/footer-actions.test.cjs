const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('public pages expose three working participation inquiries in the footer', () => {
  for (const page of ['index.html', 'articles.html', 'sermons.html', 'preachers-guide.html', 'seven-components.html', 'discipleship.html', 'problem-of-evil.html', 'when-you-cant-trace-his-hand.html']) {
    const html = fs.readFileSync(path.join(__dirname, '..', page), 'utf8');
    const row = html.match(/<nav class="ga-footer-actions"[\s\S]*?<\/nav>/)?.[0];
    assert.ok(row, page);
    for (const [interest, label] of [['Financial partnership', 'Give'], ['Ministry partnership', 'Invite Andrew'], ['Campus connection', 'Connect Us With a Campus']]) {
      assert.ok(row.includes('href="/#contact" data-interest="' + interest + '">' + label), page + ': ' + label);
    }
  }
});
