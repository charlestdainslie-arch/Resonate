// UAT round 1 browser check (Playwright), phone emulation: fixes for Chas's Android defects on 5fbdf9e.
// Astrology asks only for Sun sign and birth year (D1/D2/D3 retired with the fields they covered, 28 Oct).
// D6 "Calculate my sky" always gives visible feedback and brings the result into view.
// D8 a reading opened from the Journal returns to the Journal (on-screen and phone Back); a new reading returns to spreads.
// Run with: node tests/uat-round1.browser.cjs
const fs = require('fs'), path = require('path'), http = require('http'), assert = require('assert/strict');
const { chromium, devices } = require('playwright');
const root = path.resolve(__dirname, '..');
const port = 8771;
const types = { js: 'text/javascript', css: 'text/css', html: 'text/html', json: 'application/json', jpg: 'image/jpeg', png: 'image/png' };
const server = http.createServer((req, res) => {
  const rel = decodeURIComponent(req.url.split('?')[0]);
  const file = path.join(root, rel === '/' ? '/index.html' : rel);
  if (!file.startsWith(root)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (e, b) => { if (e) { res.writeHead(404); return res.end(); } res.setHeader('Content-Type', types[path.extname(file).slice(1)] || 'application/octet-stream'); res.end(b); });
});
// Built without a literal URL so email/chat relays cannot rewrite it.
const BASE = ['http:', '', '127.0.0.1:' + port, ''].join('/');
const view = page => page.evaluate(() => state.view);

async function openForm(page) {
  await page.goto(BASE);
  await page.evaluate(() => go('reading'));
  await page.waitForSelector('#astroProfileForm');
}

(async () => {
  await new Promise(r => server.listen(port, '127.0.0.1', r));
  const browser = await chromium.launch();
  const failures = [];
  try {
    for (const [label, device] of [['Pixel 7', devices['Pixel 7']], ['Galaxy S9+', devices['Galaxy S9+']], ['360px', { ...devices['Pixel 7'], viewport: { width: 360, height: 760 } }]]) {
      const ctx = await browser.newContext({ ...device, reducedMotion: 'reduce' });
      const page = await ctx.newPage();
      const errors = []; page.on('pageerror', e => errors.push(e.message));
      const check = async (name, fn) => { try { await fn(); } catch (e) { failures.push(`${label} ${name}: ${e.message.replace(/\s+/g, ' ').slice(0, 240)}`); } };
      await openForm(page);

      // Chas, 28 Oct: birth date, time, time zone and coordinates were removed from the journey, which
      // retires D1/D2/D3 (their fields no longer exist). These checks replace them.
      await check('Astrology asks only for Sun sign and birth year; the year uses the number keyboard', async () => {
        for (const name of ['birthDate', 'birthTime', 'timeZone', 'latitude', 'longitude', 'disambiguation'])
          assert.equal(await page.locator(`[name="${name}"]`).count(), 0, name);
        assert.deepEqual(await page.locator('[name="birthYear"]').evaluate(el => [el.type, el.inputMode]), ['text', 'numeric']);
        assert.equal(await page.locator('[name="sunSign"]').count(), 1);
      });
      await check('Sun sign and year reach the calculation; no Moon or Rising is shown', async () => {
        await page.locator('[name="sunSign"]').selectOption('Pisces');
        await page.locator('[name="birthYear"]').tap(); await page.keyboard.type('1968');
        await page.getByRole('button', { name: 'Calculate my sky', exact: true }).tap();
        assert.deepEqual(await page.evaluate(() => state.astrologyProfile), { sunSign: 'Pisces', birthYear: '1968' });
        assert.equal(await page.evaluate(() => state.astrologyPrelude.natal.moon || state.astrologyPrelude.natal.rising), null);
        assert.doesNotMatch(await page.locator('#astroResult').innerText(), /NATAL MOON|RISING/);
        assert.equal(await page.locator('#astroError').isVisible(), false);
      });
      await check('A bad year is explained beside the field and Continue without astrology still reaches the cards', async () => {
        await page.locator('[name="birthYear"]').fill('68');
        await page.getByRole('button', { name: 'Calculate my sky', exact: true }).tap();
        assert.match(await page.locator('#astroMsg-birthYear').innerText(), /four-digit year/);
        assert.equal(await page.evaluate(() => state.astrologyPrelude), null);
        await page.locator('[data-spread="three"]').tap();
        assert.equal(await view(page), 'reading');
        assert.match(await page.locator('#astroGate').innerText(), /can’t be used yet/);
        await page.locator('#astroGate [data-gate="skip"]').tap();
        assert.equal(await view(page), 'stage');
        await page.locator('#stageDrawBtn').tap();
        assert.equal(await view(page), 'draw');
        assert.equal(await page.evaluate(() => state.readingAstrology), null);
        await page.evaluate(() => go('reading'));
      });
      await check('D6 Calculate with no details still shows feedback and the result', async () => {
        await page.locator('#astroSkip').tap();
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.getByRole('button', { name: 'Calculate my sky', exact: true }).tap();
        await page.waitForTimeout(200);
        const status = page.locator('#astroStatus');
        assert.ok(await status.isVisible(), 'status visible');
        assert.match(await status.innerText(), /Sky calculated at .*No details entered/);
        const top = await page.locator('#astroResult').evaluate(el => el.getBoundingClientRect().top);
        const height = await page.evaluate(() => innerHeight);
        assert.ok(top >= -2 && top < height * 0.5, `result top ${top} should be near the top of the screen`);
      });
      await check('D8 a reading opened from the Journal returns to the Journal', async () => {
        // Seed one saved reading with the app's own spread shape, then reload as a returning visitor would.
        await page.evaluate(() => {
          state.spreadSize = 1;
          const entry = { id: 'uat-round1', readingAt: new Date(Date.now() - 3600e3).toISOString(), savedAt: new Date().toISOString(), updatedAt: null,
            timeZone: 'Australia/Sydney', spreadId: state.spreadId, spread: JSON.parse(JSON.stringify(currentSpread())), cardIds: [cards[0].id],
            reflection: '', cardReflections: {}, clarifierLayers: [], astrology: null, openingDice: null };
          localStorage.setItem('resonate-reading-journal-v1', JSON.stringify([entry]));
        });
        await page.goto(BASE);
        await page.locator('#menuBtn').tap(); await page.waitForTimeout(150);
        await page.locator('#menuOverlay [data-go="saved"]').tap(); await page.waitForTimeout(250);
        assert.equal(await view(page), 'saved');
        await page.locator('[data-open-reading="uat-round1"]').first().tap(); await page.waitForTimeout(250);
        assert.equal(await view(page), 'draw');
        const backLink = page.locator('.back-link[data-back]').first();
        assert.match(await backLink.innerText(), /Back to Journal/);
        await backLink.tap(); await page.waitForTimeout(250);
        assert.equal(await view(page), 'saved', 'on-screen back');
        await page.locator('[data-open-reading="uat-round1"]').first().tap(); await page.waitForTimeout(250);
        await page.goBack({ waitUntil: 'commit', timeout: 3000 }).catch(() => {}); await page.waitForTimeout(250);
        assert.equal(await view(page), 'saved', 'phone Back');
      });
      await check('D8 a new reading still returns to the spreads', async () => {
        await page.evaluate(() => go('reading'));
        assert.equal(await page.evaluate(() => state.drawReturnView), null);
        await page.evaluate(() => { state.view = 'draw'; renderDraw(); });
        assert.match(await page.locator('.back-link[data-back]').first().innerText(), /Back to spreads/);
      });
      await check('no page errors', async () => assert.deepEqual(errors, []));
      await ctx.close();
    }
  } finally { await browser.close(); server.close(); }
  if (failures.length) { console.error('FAIL\n' + failures.join('\n')); process.exit(1); }
  console.log('PASS UAT round 1: sign-and-year form, bad-year recovery, Calculate feedback, Journal return (3 phone sizes)');
})();
