const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

const base = process.env.SITE_URL || 'http://127.0.0.1:4178';
async function barLayout(page) {
  return page.locator('.mission-social-rail').evaluate(bar => {
    const rect = bar.getBoundingClientRect();
    const visible = el => getComputedStyle(el).display !== 'none';
    return {
      x: rect.x, y: rect.y, width: rect.width, height: rect.height,
      visibility: getComputedStyle(bar).visibility,
      position: getComputedStyle(bar).position,
      items: [...bar.querySelectorAll(':scope > a, :scope > .mission-rail-placeholder')]
        .filter(visible).map(el => ({
          label: el.getAttribute('aria-label'), href: el.getAttribute('href'),
          width: el.getBoundingClientRect().width, height: el.getBoundingClientRect().height,
        })),
      overflow: document.documentElement.scrollWidth > innerWidth,
    };
  });
}

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    for (const width of [320, 390, 768, 1100, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: 844 }, reducedMotion: 'reduce' });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(base, { waitUntil: 'domcontentloaded' });
      await page.evaluate(() => document.fonts.ready);
      const initial = await barLayout(page);
      assert.equal(initial.position, 'fixed');
      assert.equal(initial.visibility, 'visible');
      assert(!initial.overflow, `overflow at ${width}`);
      if (width <= 1100) {
        assert.equal(initial.items.length, 4);
        assert(initial.x >= 0 && initial.x + initial.width <= width);
        assert(initial.items.every(item => item.width >= 44 && item.height >= 44));
        assert(initial.y + initial.height <= 844 - 16);
        assert.match(initial.items[0].href, /instagram.com\/andrewpramirez/);
        assert.match(initial.items[1].href, /youtube.com\/@gospeladvance/);
        assert(initial.items.slice(2).every(item => item.href === null));
        await page.screenshot({ path: `/tmp/sticky-social-${width}.png` });
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        const scrolled = await barLayout(page);
        assert.equal(scrolled.y, initial.y, 'bar moves when scrolling');
        assert(await page.locator('.ga-footer-bottom').evaluate((footer, y) => footer.getBoundingClientRect().bottom <= y, initial.y));
        await page.locator('#gaMenuToggle').click();
        await page.waitForFunction(() => getComputedStyle(document.querySelector('.mission-social-rail')).visibility === 'hidden');
        assert.equal((await barLayout(page)).visibility, 'hidden', 'bar appears over menu');
        await page.keyboard.press('Escape');
        await page.waitForFunction(() => getComputedStyle(document.querySelector('.mission-social-rail')).visibility === 'visible');
        assert.equal((await barLayout(page)).visibility, 'visible');
        await page.evaluate(() => document.querySelector('#gaSearchDialog').showModal());
        await page.waitForFunction(() => getComputedStyle(document.querySelector('.mission-social-rail')).visibility === 'hidden');
        assert.equal((await barLayout(page)).visibility, 'hidden', 'bar appears over search');
        await page.evaluate(() => document.querySelector('#gaSearchDialog').close());
      } else {
        assert.equal(initial.items.length, 5);
        assert.equal(initial.x, 0);
        await page.screenshot({ path: '/tmp/sticky-social-desktop.png' });
      }
      assert.deepEqual(errors, []);
      console.log(`PASS home: ${width}px`);
      await page.close();
    }
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
    for (const file of ['about.html', 'resources.html', 'get-involved.html', 'discipleship.html', '404.html']) {
      await page.goto(`${base}/${file}`, { waitUntil: 'domcontentloaded' });
      assert.equal((await barLayout(page)).items.length, 4, file);
      if (file === 'get-involved.html') {
        await page.locator('#contactName').focus();
        await page.waitForFunction(() => getComputedStyle(document.querySelector('.mission-social-rail')).visibility === 'hidden');
        assert.equal((await barLayout(page)).visibility, 'hidden');
        await page.locator('#contactName').evaluate(input => input.blur());
        await page.waitForFunction(() => getComputedStyle(document.querySelector('.mission-social-rail')).visibility === 'visible');
        assert.equal((await barLayout(page)).visibility, 'visible');
      }
      console.log(`PASS page: ${file}`);
    }
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
