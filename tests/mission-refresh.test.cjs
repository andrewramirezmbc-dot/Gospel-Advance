const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const pages = ['index.html', 'resources.html', 'articles.html', 'sermons.html', 'preachers-guide.html', 'seven-components.html', 'discipleship.html', 'problem-of-evil.html', 'when-you-cant-trace-his-hand.html', 'about.html', 'on-campus.html', 'get-involved.html'];
test('only the homepage has a follow section and public pages retain the social rail', () => {
  for (const file of pages) {
    const html = fs.readFileSync(path.join(root, file), 'utf8');
    const main = html.slice(html.indexOf('<main'), html.indexOf('</main>'));
    if (file !== 'index.html') {
      assert.doesNotMatch(main, /id="follow-mission"|class="ga-follow-strip/);
      assert.match(html, /class="mission-social-rail"/);
      continue;
    }
    assert.match(main, /class="ga-follow-strip mission-social"/, file);
    assert.match(html, /class="mission-social-rail"/, file);
    for (const platform of ['YouTube', 'Instagram', 'TikTok', 'Facebook', 'X']) {
      assert(main.includes('<strong>' + platform + '</strong>'), file + ': ' + platform);
    }
    assert.equal((main.match(/class="mission-social-card" aria-disabled="true"/g) || []).length, 3, file);
    assert.match(main, /youtube.com\/@gospeladvance\?sub_confirmation=1/, file);
    assert.match(main, /instagram.com\/andrewpramirez\//, file);
    assert.doesNotMatch(main, /facebook.com|tiktok.com/, file);
    assert.match(html, /href="\/get-involved.html">Get Involved/, file);
    assert.match(html, /href="\/on-campus.html">On Campus/, file);
  }
});
test('participation includes nonfinancial paths without promising official chapters', () => {
  const html = fs.readFileSync(path.join(root, 'get-involved.html'), 'utf8');
  for (const label of ['Get equipped', 'Host Gospel Advance', 'Explore local outreach', '<h3>Pray</h3>', 'Follow &amp; Share', 'Give Today', 'Partner With Us']) assert(html.includes(label));
  assert.match(html, /not an official chapter application/);
  assert.match(html, /id="contactCity" name="location"/);
  assert.match(html, /<option value="Community">Local outreach in my town/);
  assert.match(fs.readFileSync(path.join(root, 'assets/site.js'), 'utf8'), /'Host Gospel Advance', 'Local outreach interest'/);
});
test('every public page includes the sticky follow label and keeps unconfirmed socials inactive', () => {
  for (const file of [...pages, '404.html']) {
    const html = fs.readFileSync(path.join(root, file), 'utf8');
    const rail = html.match(/<aside class="mission-social-rail"[\s\S]*?<\/aside>/)?.[0];
    assert(rail, file);
    assert.match(rail, /class="mission-social-rail-label">Follow<br \/>Along<\/span>/, file);
    assert.match(rail, /assets\/icons\/brand-youtube.svg/, file);
    assert.equal((rail.match(/<a /g) || []).length, 2, file);
    for (const platform of ['tiktok', 'facebook', 'brand-x']) {
      assert.match(rail, new RegExp('class="mission-rail-placeholder mission-rail-' + platform + '"'), file);
    }
  }
});
test('home copies stay identical and the stats remain at their approved values', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  assert.equal(html, fs.readFileSync(path.join(root, 'gospel-advance-website.html'), 'utf8'));
  assert.deepEqual([...html.matchAll(/data-count="(\d+)"/g)].map(m => m[1]), ['66', '3810', '40']);
  assert.match(html, /gospel-advance-trailer-poster.jpg/);
});
