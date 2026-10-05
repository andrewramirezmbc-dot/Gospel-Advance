const assert = require('node:assert/strict');
const { chromium, webkit } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.SITE_URL || 'http://127.0.0.1:4178';
const engine = process.env.BROWSER_ENGINE || 'chromium';
async function settle(page) {
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}
async function showSection(page, selector) {
  await page.locator(selector).scrollIntoViewIfNeeded();
  await settle(page);
  await page.evaluate(selector => {
    const header = document.querySelector('.ga-header').getBoundingClientRect().height;
    window.scrollTo(0, scrollY + document.querySelector(selector).getBoundingClientRect().top - header - 12);
  }, selector);
  await settle(page);
}
(async () => {
  const browser = engine === 'webkit' ? await webkit.launch() : await chromium.launch({ channel: 'chrome' });
  try {
    for (const width of [320, 390, 430, 767, 768, 1100, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: 1000 }, reducedMotion: 'reduce' });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(base, { waitUntil: 'load' });
      await settle(page);
      for (const section of ['#about', '#fuel-the-mission', '#strategy', '#media', '#bring-the-mission', '#mission-questions']) {
        await showSection(page, section);
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${section}: overflow at ${width}`);
        const failures = await page.locator(`${section} h2, ${section} h3, ${section} h4, ${section} p`).evaluateAll(elements => elements
          .filter(el => el.getBoundingClientRect().width > 0 && getComputedStyle(el).display !== 'none')
          .filter(el => el.scrollWidth > el.clientWidth + 1).map(el => el.textContent));
        assert.deepEqual(failures, [], `${section}: text overflow at ${width}`);
        await page.screenshot({ path: `/tmp/north-star-${engine}-${width}-${section.slice(1)}.png` });
      }
      const tabs = page.locator('.ga-media-tabs');
      assert.equal(await page.locator('#follow-mission').isVisible(), width > 1100, 'full social section should appear only beside the desktop rail');
      if (width < 768) {
        const invitation = page.locator('.ga-campus-offerings > div');
        assert.equal(await invitation.count(), 3);
        assert(await page.locator('.ga-campus-photo img').evaluate(el => el.complete && el.naturalWidth > 0));
        const help = page.locator('.ga-faq-mobile-help');
        assert(await help.isVisible());
        const answers = page.locator('.ga-faq-items details');
        assert.equal(await answers.count(), 5);
        for (let index = 0; index < 5; index++) {
          const item = answers.nth(index);
          const summary = item.locator('summary');
          await summary.focus();
          await page.keyboard.press('Enter');
          assert(await item.evaluate(el => el.open));
          assert(await item.locator('p').isVisible());
          assert(await item.locator('.ga-faq-mobile-symbol').evaluate(el => getComputedStyle(el, '::before').content.includes('\u2212')));
          await page.keyboard.press('Enter');
          assert(!await item.evaluate(el => el.open));
        }
        if (width === 390) {
          await help.locator('a').click();
          assert(await page.locator('#contactPanel').evaluate(el => el.open));
          await page.locator('#contactPanel .ga-panel-close').click();
          await page.locator('.ga-campus-connect').click();
          assert(await page.locator('#contactPanel').evaluate(el => el.open));
          assert.equal(await page.locator('#contactInterest').inputValue(), 'Ministry partnership');
          await page.locator('#contactPanel .ga-panel-close').click();
        }
        assert(await tabs.isVisible());
        const photo = await page.locator('.ga-andrew-frame').boundingBox();
        const message = await page.locator('.ga-about .ga-section-copy').boundingBox();
        assert(photo.y + photo.height < message.y, 'photo should precede personal message');
        assert.equal(await page.locator('.ga-approach-arrow').count(), 3);
        await page.locator('#ga-media-conversations').click();
        assert(!await page.locator('.ga-media-testimony').isVisible());
        assert(!await page.locator('.ga-media-films').isVisible());
        assert(await page.locator('.ga-media-conversations').isVisible());
        assert(!await page.locator('.ga-media-resources').isVisible());
        await page.keyboard.press('ArrowRight');
        assert.equal(await page.locator('#ga-media-resources').getAttribute('aria-selected'), 'true');
        assert(await page.locator('.ga-media-resources').isVisible());
        await page.keyboard.press('Home');
        assert.equal(await page.locator('#ga-media-featured').getAttribute('aria-selected'), 'true');
        assert(await page.locator('.ga-media-films').isVisible());
        await page.locator('.ga-film-preview').click();
        assert(await page.locator('.ga-film-slide').nth(1).isVisible());
        await page.locator('.ga-film-preview').click();
        assert(await page.locator('.ga-film-slide').nth(0).isVisible());
        await page.locator('.ga-film-slide').nth(0).locator('.ga-film-play').focus();
        await page.keyboard.press('ArrowRight');
        assert(await page.locator('.ga-film-preview').evaluate(el => el === document.activeElement));
        await page.keyboard.press('ArrowLeft');
        if (width === 390) {
          await page.locator('.ga-media-status').click();
          assert(await page.locator('#mediaDialog').evaluate(el => el.open));
          await page.locator('#mediaClose').click();
          assert(!await page.locator('#mediaDialog').evaluate(el => el.open));
        }
        await page.locator('.ga-media-explore-dots button').nth(1).click();
        await page.waitForFunction(() => document.querySelector('.ga-media-explore-dots button:last-child').getAttribute('aria-pressed') === 'true');
        assert(await page.locator('.ga-media-explore-links').evaluate(el => el.scrollLeft > 0));
        if (width === 390) {
          await page.setViewportSize({ width: 1440, height: 1000 });
          await settle(page);
          assert(!await tabs.isVisible());
          assert(await page.locator('.ga-media-testimony').isVisible());
          assert(await page.locator('.ga-media-resources').isVisible());
        }
      } else {
        assert(!await page.locator('.ga-faq-mobile-help').isVisible());
        assert(await page.locator('.ga-faq-desktop-contact').isVisible());
        assert(!await tabs.isVisible());
        assert(await page.locator('.ga-media-testimony').isVisible());
        assert(await page.locator('.ga-message-desktop-prose').isVisible());
        assert(!await page.locator('.ga-message-mobile-prose').isVisible());
      }
      assert.deepEqual(errors, []);
      console.log(`PASS ${engine}: ${width}px layouts, filters, and controls`);
      await page.close();
    }
    const resource = await browser.newPage({ viewport: { width: 390, height: 1000 }, reducedMotion: 'reduce' });
    await resource.goto(`${base}/resources.html`, { waitUntil: 'load' });
    await resource.locator('#ga-media-resources').click();
    assert(await resource.locator('.ga-media-resources').isVisible());
    assert(!await resource.locator('.ga-media-testimony').isVisible());
    assert.equal(await resource.locator('#follow-mission').count(), 0);
    console.log('PASS shared resource media');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
