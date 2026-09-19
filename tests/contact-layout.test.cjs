const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
test('contact panel has audience selection and no resources column', () => {
  const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
  const panel = html.match(/<dialog[^>]*id="contactPanel"[\s\S]*?<\/dialog>/)[0];
  assert.doesNotMatch(panel, /ga-resources|Grow deeper/);
  assert.match(panel, /select id="contactType" name="contact_type" required/);
  for (const role of ['Student', 'Church', 'Organization', 'Individual']) assert.ok(panel.includes('value="' + role + '"'));
  assert.match(panel, /action="https:\/\/formspree.io\/f\/mvzbqgwq"/);
});
