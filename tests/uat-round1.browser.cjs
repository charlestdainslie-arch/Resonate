// UAT round 1 browser check (Playwright), phone emulation: fixes for Chas's Android defects on 5fbdf9e.
// D1/D2 birth date and time are plain number-keyboard fields that convert to the model's YYYY-MM-DD / HH:MM.
// D3 "Repeated clock time" options fit the field at phone widths.
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
  await page.locator('.astro-full-birth summary').tap();
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

      await check('D1/D2 date and time use the number keyboard, not native pickers', async () => {
        for (const name of ['birthDate', 'birthTime']) {
          const attrs = await page.locator(`[name="${name}"]`).evaluate(el => [el.type, el.inputMode]);
          assert.deepEqual(attrs, ['text', 'numeric'], name);
        }
      });
      await check('D1/D2 typing digits formats as DD/MM/YYYY and HH:MM', async () => {
        await page.locator('[name="birthDate"]').tap(); await page.keyboard.type('15031968');
        assert.equal(await page.locator('[name="birthDate"]').inputValue(), '15/03/1968');
        await page.locator('[name="birthTime"]').tap(); await page.keyboard.type('0930');
        assert.equal(await page.locator('[name="birthTime"]').inputValue(), '09:30');
      });
      await check('D1/D2 entered details reach the calculation as YYYY-MM-DD and HH:MM', async () => {
        await page.locator('[name="timeZone"]').fill('Europe/London');
        await page.locator('[name="latitude"]').fill('56.11');
        await page.locator('[name="longitude"]').fill('-3.34');
        await page.getByRole('button', { name: 'Calculate my sky', exact: true }).tap();
        const profile = await page.evaluate(() => state.astrologyProfile);
        assert.equal(profile.birthDate, '1968-03-15');
        assert.equal(profile.birthTime, '09:30');
        assert.ok(await page.evaluate(() => !!state.astrologyPrelude?.natal?.moon), 'natal Moon calculated');
        assert.equal(await page.locator('#astroError').isVisible(), false);
      });
      await check('D1 an impossible date gives a clear message', async () => {
        await page.locator('[name="birthDate"]').fill('31/02/1968');
        await page.getByRole('button', { name: 'Calculate my sky', exact: true }).tap();
        assert.match(await page.locator('#astroError').innerText(), /does not exist.*DD\/MM\/YYYY/);
        assert.equal(await page.evaluate(() => state.astrologyPrelude), null);
      });
      await check('D3 repeated-clock-time options fit the field', async () => {
        const overflow = await page.locator('[name="disambiguation"]').evaluate(select => {
          const cs = getComputedStyle(select), ctx = document.createElement('canvas').getContext('2d');
          ctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
          const room = select.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight) - 20; // native arrow
          return [...select.options].filter(o => ctx.measureText(o.text).width > room).map(o => o.text);
        });
        assert.deepEqual(overflow, []);
      });
      await check('D6 Calculate with no details still shows feedback and the result', async () => {
        await page.locator('#astroSkip').tap();
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.getByRole('button', { name: 'Calculate my sky', exact: true }).tap();
        await page.waitForTimeout(200);
        const status = page.locator('#astroStatus');
        assert.ok(await status.isVisible(), 'status visible');
        assert.match(await status.innerText(), /Sky calculated at .*No birth details entered/);
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
  console.log('PASS UAT round 1: date/time entry, dropdown fit, Calculate feedback, Journal return (3 phone sizes)');
})();
