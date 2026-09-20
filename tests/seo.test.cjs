const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');

const publicPages = [
  'index.html',
  'gospel-advance-website.html',
  'resources.html',
  'articles.html',
  'sermons.html',
  'preachers-guide.html',
  'seven-components.html',
  'discipleship.html',
  'problem-of-evil.html',
  'when-you-cant-trace-his-hand.html',
];
const articlePages = [
  'seven-components.html',
  'discipleship.html',
  'problem-of-evil.html',
  'when-you-cant-trace-his-hand.html',
];

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

function meta(html, key, kind = 'name') {
  const re = new RegExp(`<meta[^>]+${kind}="${key}"[^>]+content="([^"]*)"`, 'i');
  const match = html.match(re);
  return match ? match[1] : null;
}

function title(html) {
  const match = html.match(/<title>([^<]+)<\/title>/);
  return match ? match[1] : null;
}

function jsonLd(html) {
  const match = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  assert(match, 'missing JSON-LD');
  return JSON.parse(match[1]);
}

test('robots.txt allows crawl and points to the apex sitemap', () => {
  const robots = read('robots.txt');
  assert.match(robots, /User-agent:\s*\*/);
  assert.match(robots, /Allow:\s*\//);
  assert.match(robots, /Sitemap:\s*https:\/\/thegospeladvance\.org\/sitemap\.xml/);
});

test('sitemap lists every public HTML page except the working copy and 404', () => {
  const sitemap = read('sitemap.xml');
  const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
  assert.deepEqual(locs, [
    'https://thegospeladvance.org/',
    'https://thegospeladvance.org/resources.html',
    'https://thegospeladvance.org/articles.html',
    'https://thegospeladvance.org/sermons.html',
    'https://thegospeladvance.org/preachers-guide.html',
    'https://thegospeladvance.org/seven-components.html',
    'https://thegospeladvance.org/discipleship.html',
    'https://thegospeladvance.org/problem-of-evil.html',
    'https://thegospeladvance.org/when-you-cant-trace-his-hand.html',
  ]);
  assert.doesNotMatch(sitemap, /index\.html|gospel-advance-website|404\.html/);
  assert.match(sitemap, /<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/);
});

test('every public page has unique title, description, canonical, social tags, and JSON-LD', () => {
  const titles = new Set();
  const descriptions = new Set();
  const canonicals = new Set();
  for (const file of publicPages) {
    const html = read(file);
    const pageTitle = title(html);
    const description = meta(html, 'description');
    const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
    assert(pageTitle, `${file}: missing title`);
    assert(pageTitle.length <= 60, `${file}: title is ${pageTitle.length} chars`);
    assert(description, `${file}: missing description`);
    assert(description.length >= 150 && description.length <= 160, `${file}: description is ${description.length} chars`);
    assert(canonical, `${file}: missing canonical`);
    assert.match(canonical, /^https:\/\/thegospeladvance\.org\//);
    assert.doesNotMatch(canonical, /index\.html/);
    assert.equal(meta(html, 'theme-color'), '#171717', file);
    assert.equal(meta(html, 'og:title', 'property'), pageTitle, file);
    assert.equal(meta(html, 'og:description', 'property'), description, file);
    assert.equal(meta(html, 'og:url', 'property'), canonical, file);
    assert.match(meta(html, 'og:type', 'property') || '', /website|article/);
    assert.equal(meta(html, 'og:image', 'property'), 'https://thegospeladvance.org/assets/images/campus-conversation-hero.jpg', file);
    assert.equal(meta(html, 'twitter:card'), 'summary_large_image', file);
    assert.equal(meta(html, 'twitter:title'), pageTitle, file);
    assert.equal(meta(html, 'twitter:description'), description, file);
    assert.match(html, /rel="icon" href="\/favicon\.svg"/);
    assert.match(html, /rel="apple-touch-icon" href="\/apple-touch-icon\.png"/);
    const data = jsonLd(html);
    const types = (data['@graph'] || []).map(node => node['@type']);
    assert(types.includes('Organization'), file);
    assert(types.includes('Person'), file);
    assert(types.includes('WebSite'), file);
    assert.ok(!types.includes('SearchAction') && !JSON.stringify(data).includes('SearchAction'), file);
    titles.add(pageTitle);
    descriptions.add(description);
    canonicals.add(canonical);
  }
  assert.equal(titles.size, 9);
  assert.equal(descriptions.size, 9);
  assert.equal(canonicals.size, 9);
  assert.equal(title(read('index.html')), title(read('gospel-advance-website.html')));
  assert.equal(meta(read('index.html'), 'description'), meta(read('gospel-advance-website.html'), 'description'));
});

test('article pages expose Article JSON-LD without invented ministry claims', () => {
  for (const file of articlePages) {
    const html = read(file);
    assert.equal(meta(html, 'og:type', 'property'), 'article', file);
    const data = jsonLd(html);
    const article = (data['@graph'] || []).find(node => node['@type'] === 'Article');
    assert(article, file);
    assert.equal(article.author['@id'], 'https://thegospeladvance.org/#andrew');
    assert.equal(article.datePublished, undefined, 'Month-only bylines must not invent a publication day');
    assert.equal(meta(html, 'article:published_time', 'property'), null);
    assert.equal(meta(html, 'article:author', 'property'), 'https://thegospeladvance.org/#andrew');
    assert.doesNotMatch(html, /testimonial|nonprofit status|501\(c\)/i);
  }
});

test('internal links prefer clean paths and drop the Netlify staging URL', () => {
  const files = [...publicPages, '404.html', 'assets/site.js'];
  for (const file of files) {
    const source = read(file);
    assert.doesNotMatch(source, /stirring-babka|netlify\.app/, file);
    assert.doesNotMatch(source, /href="index\.html/, file);
  }
});

test('each public page has one H1 and homepage chrome is not extra H2s', () => {
  for (const file of publicPages) {
    const html = read(file);
    assert.equal((html.match(/<h1\b/g) || []).length, 1, file);
  }
  const home = read('gospel-advance-website.html');
  const header = home.slice(home.indexOf('<header class="ga-header"'), home.indexOf('</header>') + 9);
  const mobile = home.slice(home.indexOf('<dialog class="ga-mobile-menu"'), home.indexOf('</dialog>', home.indexOf('id="gaMobileNav"')) + 9);
  assert.doesNotMatch(header + mobile, /<h2\b/);
  assert.match(home, /<h2 id="gaSearchTitle">/);
  assert.match(header, /ga-mega-heading/);
  assert.match(mobile, /ga-mobile-heading/);
  assert.match(header, /href="\/#gospel">The gospel we share/);
});

test('favicon assets exist and 404 is present with a home link', () => {
  for (const file of ['favicon.svg', 'favicon.ico', 'apple-touch-icon.png', 'robots.txt', 'sitemap.xml', '404.html']) {
    assert(fs.statSync(path.join(root, file)).size > 0, file);
  }
  const notFound = read('404.html');
  assert.match(notFound, /<h1>Page not found<\/h1>/);
  assert.match(notFound, /href="\/"/);
  assert.equal(meta(notFound, 'robots'), 'noindex, follow');
});

test('local links, fragments, and social images resolve to real files', () => {
  for (const file of [...publicPages, '404.html']) {
    const html = read(file);
    for (const [, href] of html.matchAll(/href="([^"]+)"/g)) {
      if (/^(https?:|mailto:)/.test(href)) continue;
      const url = new URL(href, `https://thegospeladvance.org/${file}`);
      const target = decodeURIComponent(url.pathname.slice(1)) || 'index.html';
      assert(fs.existsSync(path.join(root, target)), `${file}: missing ${target}`);
      if (url.hash && target.endsWith('.html')) {
        assert(read(target).includes(`id="${decodeURIComponent(url.hash.slice(1))}"`), `${file}: missing ${href}`);
      }
      assert(!/^[^/#]+\.html/.test(href), `${file}: use root-relative page links`);
    }
    const image = meta(html, 'og:image', 'property');
    assert.equal(meta(html, 'twitter:image'), image, file);
    assert(fs.existsSync(path.join(root, new URL(image).pathname)), `${file}: missing social image`);
    assert(!jsonLd(html)['@graph'].some(entity => entity.founder || entity['@type'] === 'NonprofitOrganization'), file);
    for (const [tag] of html.matchAll(/<img\b[^>]*>/g)) {
      assert(/\balt="[^"]+"/.test(tag) || /src="assets\/icons\//.test(tag) || /src="assets\/video\/hero-campus-desktop.jpg"/.test(tag), `${file}: meaningful image needs alt: ${tag}`);
    }
  }
  assert.match(read('robots.txt'), /Disallow: \/gospel-advance-website\.html/);
});

test('404 assets use root paths even when the missing URL is nested', () => {
  const html = read('404.html');
  for (const [, asset] of html.matchAll(/(?:href|src)="([^"]*assets\/[^" ]+)"/g)) {
    assert(asset.startsWith('/assets/'), asset);
  }
});
