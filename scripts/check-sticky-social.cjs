const assert = require('node:assert/strict');
const { chromium, webkit } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

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
  const browser = process.env.BROWSER_ENGINE === 'webkit'
    ? await webkit.launch({ headless: true })
    : await chromium.launch({ channel: 'chrome', headless: true });
  try {
    for (const width of [320, 390, 430, 768, 1100, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: 844 }, reducedMotion: 'reduce' });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(base, { waitUntil: 'load' });
      await page.evaluate(() => document.fonts.ready);
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      const initial = await barLayout(page);
      assert.equal(initial.position, 'fixed');
      assert.equal(initial.visibility, 'visible');
      assert(!initial.overflow, `overflow at ${width}`);
      const heroActions = page.locator('.ga-hero-social-actions');
      if (width < 768) {
        assert(await heroActions.isVisible());
        const links = heroActions.locator('a');
        assert.equal(await links.count(), 2);
        assert.match(await links.nth(0).getAttribute('href'), /instagram.com\/andrewpramirez\//);
        assert.match(await links.nth(1).getAttribute('href'), /youtube.com\/@gospeladvance\?sub_confirmation=1/);
        assert.deepEqual(await links.allTextContents(), ['Follow', 'Subscribe']);
        assert(await links.evaluateAll(items => items.every(el => el.scrollWidth <= el.clientWidth && el.getBoundingClientRect().height >= 44)));
        assert(!await page.locator('.ga-hero-desktop-action').isVisible());
      } else {
        assert(!await heroActions.isVisible());
        assert(await page.locator('.ga-hero-desktop-action').isVisible());
      }
      if (width <= 1100) {
        assert(!await page.locator('#follow-mission').isVisible(), 'full social section duplicates the mobile bar');
        const scrim = await page.locator('.mission-social-backdrop').evaluate(el => {
          const style = getComputedStyle(el);
          const rect = el.getBoundingClientRect();
          return { position: style.position, top: rect.top, bottom: rect.bottom, pointerEvents: style.pointerEvents };
        });
        assert.equal(scrim.position, 'fixed');
        assert.equal(scrim.pointerEvents, 'none');
        assert(scrim.top < initial.y);
        assert(scrim.bottom >= 844 + 160, 'backing must extend beneath browser chrome');
        assert.equal(initial.items.length, 4);
        assert(initial.x >= 0 && initial.x + initial.width <= width);
        assert(initial.items.every(item => item.width >= 44 && item.height >= 44));
        assert.equal(844 - (initial.y + initial.height), 6, 'bar should sit just above the bottom safe area');
        assert.match(initial.items[0].href, /instagram.com\/andrewpramirez/);
        assert.match(initial.items[1].href, /youtube.com\/@gospeladvance/);
        assert(initial.items.slice(2).every(item => item.href === null));
        await page.screenshot({ path: `/tmp/sticky-social-${width}.png` });
        // Contrasting content must produce identical pixels beneath the bar.
        await page.evaluate(() => {
          const probe = document.createElement('div');
          probe.id = 'social-backing-probe';
          probe.style.cssText = 'position:fixed;inset:auto 0 0;height:300px;background:#ff00ff;z-index:898;pointer-events:none';
          document.body.append(probe);
        });
        const clip = { x: 0, y: 840, width, height: 4 };
        const first = await page.screenshot({ clip });
        await page.evaluate(() => document.querySelector('#social-backing-probe').style.background = '#00ffff');
        const second = await page.screenshot({ clip });
        assert(first.equals(second), 'page colors bleed through beneath the bar');
        await page.evaluate(() => document.querySelector('#social-backing-probe').remove());
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        const scrolled = await barLayout(page);
        assert.equal(scrolled.y, initial.y, 'bar moves when scrolling');
        assert(await page.locator('.ga-footer-bottom').evaluate((footer, y) => footer.getBoundingClientRect().bottom <= y, scrim.top));
        await page.locator('#gaMenuToggle').click();
        await page.waitForFunction(() => getComputedStyle(document.querySelector('.mission-social-rail')).visibility === 'hidden');
        assert.equal((await barLayout(page)).visibility, 'hidden', 'bar appears over menu');
        assert.equal(await page.locator('.mission-social-backdrop').evaluate(el => getComputedStyle(el).visibility), 'hidden');
        await page.keyboard.press('Escape');
        await page.waitForFunction(() => getComputedStyle(document.querySelector('.mission-social-rail')).visibility === 'visible');
        assert.equal((await barLayout(page)).visibility, 'visible');
        await page.evaluate(() => document.querySelector('#gaSearchDialog').showModal());
        await page.waitForFunction(() => getComputedStyle(document.querySelector('.mission-social-rail')).visibility === 'hidden');
        assert.equal((await barLayout(page)).visibility, 'hidden', 'bar appears over search');
        await page.evaluate(() => document.querySelector('#gaSearchDialog').close());
      } else {
        assert(await page.locator('#follow-mission').isVisible());
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
