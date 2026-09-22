const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'gospel-advance-website.html'), 'utf8');

test('campus invitation has one Connect action, split image and three ministry offerings', () => {
  const section = html.match(/<section class="ga-campus-invite"[\s\S]*?<\/section>/)[0];
  assert.equal((section.match(/href="#contact"/g) || []).length, 1);
  assert.match(section, /class="ga-campus-connect"/);
  assert.match(section, /class="ga-campus-split"/);
  assert.match(section, /class="ga-campus-photo"/);
  assert.match(section, /class="ga-campus-offerings-band"/);
  assert.doesNotMatch(section, /<h3>Students|Pastors &amp; ministry leaders/);
  for (const heading of ['Gospel workshops', 'Evangelism engagements', 'Speaking']) {
    assert(section.includes(`<h3>${heading}</h3>`));
  }
  assert.match(section, /data-interest="Ministry partnership"/);
});

test('working homepage and published entry point remain identical', () => {
  assert.equal(html, fs.readFileSync(path.join(root, 'index.html'), 'utf8'));
});

test('homepage follows the approved mission and partnership sequence', () => {
  const markers = ['class="ga-hero"', 'id="mission"', 'id="generation"', 'id="about"', 'id="fuel-the-mission"', 'id="strategy"', 'id="media"', 'id="follow-mission"', 'id="bring-the-mission"', 'id="mission-questions"', 'class="ga-footer-top"'];
  const positions = markers.map(marker => html.indexOf(marker));
  assert(positions.every((position, index) => position >= 0 && (!index || position > positions[index - 1])));
  assert.match(html, /Your gift puts<br \/>the gospel on the/);
  assert.match(html, /<em>community\.<\/em>/);
  assert.match(html, /your campus, church, or town/);
});

test('homepage follow block is part of the media section', () => {
  const media = html.match(/<section class="ga-media-library"[\s\S]*?<\/section>/)[0];
  assert.match(media, /<div id="follow-mission"/);
  assert.equal((html.match(/id="follow-mission"/g) || []).length, 1);
});
