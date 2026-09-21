const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const html = fs.readFileSync(path.join(__dirname, '../on-campus.html'), 'utf8');

test('campus page presents the outreach journey with real configured media', () => {
  for (const section of ['campus-hero', 'campus-why', 'campus-approach', 'campus-visit', 'campus-stories', 'campus-closing']) {
    assert(html.includes('class="' + section + '"'));
  }
  for (const key of ['conversation1', 'conversation2', 'testimony']) assert(html.includes('data-media="' + key + '"'));
  assert.match(html, /Participation in a conversation or filmed interview is voluntary/);
  assert.match(html, /Our mission is not limited to college students/);
  assert.match(html, /href="\/get-involved.html#visit"/);
  assert.doesNotMatch(html, /19M|70%|I came to college with big questions/);
  assert.doesNotMatch(html, /campus-conversation-(hero|listening|student)\.jpg/);
});
