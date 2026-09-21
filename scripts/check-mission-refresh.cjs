const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const page = await browser.newPage({ reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const [name, url] of [
        ['home', 'http://127.0.0.1:4178/'],
        ['involved', 'http://127.0.0.1:4178/get-involved.html'],
        ['campus', 'http://127.0.0.1:4178/on-campus.html'],
        ['about', 'http://127.0.0.1:4178/about.html'],
        ['resources', 'http://127.0.0.1:4178/resources.html'],
        ['academy', 'http://127.0.0.1:4182/']
      ]) {
        await page.goto(url);
        await page.evaluate(() => document.fonts.ready);
        assert(await page.locator('main').innerText());
        assert.equal(await page.locator('main .ga-follow-strip, main .academy-follow').count(), name === 'home' ? 1 : 0);
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), name + ' overflow');
        await page.locator('img[loading="lazy"]').evaluateAll(images => images.forEach(img => img.loading = 'eager'));
        await page.waitForFunction(() => [...document.images].every(img => img.complete));
        assert.deepEqual(await page.evaluate(() => [...document.images].filter(img => !img.naturalWidth).map(img => img.src)), [], name + ' broken images');
        await page.screenshot({ path: '/tmp/mission-' + name + '-' + width + '.png', fullPage: name !== 'home' && name !== 'resources' && name !== 'academy' });
      }
    }
    await page.goto('http://127.0.0.1:4178/get-involved.html');
    await page.getByRole('link', { name: 'Bring us to your town' }).click();
    assert.equal(await page.locator('#contactInterest').inputValue(), 'Host Gospel Advance');
    await page.route('https://formspree.io/f/mvzbqgwq', route => route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' }));
    await page.locator('#contactName').fill('Preview Test');
    await page.locator('#contactEmail').fill('preview@example.com');
    await page.locator('#contactType').selectOption('Community');
    await page.locator('#contactCity').fill('Preview city, TX');
    await page.locator('#contactMessage').fill('Local preview test; intercepted, not sent.');
    await page.locator('#contactBtn').click();
    await page.waitForFunction(() => !document.querySelector('#formStatus').hidden && /thank|sent|received/i.test(document.querySelector('#formStatus').textContent));
    assert.deepEqual(errors, []);
    console.log('Desktop/mobile checks and mocked inquiry submission passed.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
