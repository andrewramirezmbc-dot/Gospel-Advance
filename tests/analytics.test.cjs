const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const config = JSON.parse(fs.readFileSync(path.join(root, 'seo-config.json'), 'utf8'));
const file = config.hostname === '101bible.org' ? 'js/analytics.js' : 'assets/analytics.js';
const source = fs.readFileSync(path.join(root, file), 'utf8');

test('Search Console tokens are statically emitted, idempotent, and removable', () => {
  const os = require('node:os');
  const { execFileSync } = require('node:child_process');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'seo-verification-'));
  try {
    fs.mkdirSync(path.join(dir, 'scripts'));
    fs.copyFileSync(path.join(root, 'scripts/configure-search-console.cjs'), path.join(dir, 'scripts/configure-search-console.cjs'));
    fs.writeFileSync(path.join(dir, 'index.html'), '<head><!-- search-console-verification --></head>');
    execFileSync('git', ['init', '-q'], { cwd: dir });
    execFileSync('git', ['add', 'index.html'], { cwd: dir });
    function render(token) {
      fs.writeFileSync(path.join(dir, 'seo-config.json'), JSON.stringify({ searchConsoleVerification: token }));
      execFileSync(process.execPath, ['scripts/configure-search-console.cjs'], { cwd: dir });
      return fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
    }
    const first = render('test-token_123');
    assert(first.includes('name="google-site-verification" content="test-token_123"'));
    assert.equal(render('test-token_123'), first);
    assert(!render('').includes('name="google-site-verification"'));
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

async function run({ host = config.hostname, id = 'G-TEST1234', robots = '', dnt = '0' } = {}) {
  const appended = [], window = {};
  const context = { window, navigator: { doNotTrack: dnt },
    location: { hostname: host, origin: 'https://' + host, pathname: '/about', search: '?email=private', hash: '#access_token=private' },
    document: { title: 'About', referrer: 'https://example.com/from?private=yes#secret',
      querySelector: () => ({ content: robots }), createElement: () => ({}),
      head: { append: element => appended.push(element) } },
    fetch: async () => ({ ok: true, json: async () => ({ ...config, measurementId: id }) }), URL, Date };
  vm.runInNewContext(source, context);
  await new Promise(resolve => setImmediate(resolve));
  return { appended, window, context };
}
test('analytics ignores previews, placeholder IDs, private pages, and DNT', async () => {
  for (const options of [{ host: 'localhost' }, { host: 'deploy-preview.netlify.app' }, { id: 'G-XXXXXXXX' }, { robots: 'noindex,nofollow' }, { dnt: '1' }]) {
    assert.equal((await run(options)).appended.length, 0);
  }
});
test('analytics loads once and never includes query strings or fragments', async () => {
  const result = await run();
  vm.runInNewContext(source, result.context);
  assert.equal(result.appended.length, 1);
  const events = result.window.dataLayer.map(item => [...item]);
  assert.equal(events.filter(event => event[0] === 'event').length, 1);
  assert.equal(events[2][2].page_location, 'https://' + config.hostname + '/about');
  assert.equal(events[2][2].page_referrer, 'https://example.com/from');
  assert(!JSON.stringify(events).includes('private'));
});
