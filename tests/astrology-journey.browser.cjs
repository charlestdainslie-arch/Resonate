// Astrology entry journey, button by button (Playwright). Chas's 28 Oct UAT: only Sun sign and birth year,
// both optional; an obvious way on to the cards; spread buttons always answer; nothing stale reaches a reading.
// Runs at two phone sizes and one desktop width. Writes test-results/astrology-journey.json.
// Run with: node tests/astrology-journey.browser.cjs
const fs = require('fs'), path = require('path'), http = require('http'), assert = require('assert/strict');
const { chromium, devices } = require('playwright');
const root = path.resolve(__dirname, '..');
const out = path.resolve(process.env.UAT_OUTPUT_DIR || path.join(root, 'test-results'));
fs.mkdirSync(out, { recursive: true });
const port = 8777;
const types = { js: 'text/javascript', css: 'text/css', html: 'text/html', json: 'application/json', jpg: 'image/jpeg', png: 'image/png' };
const server = http.createServer((req, res) => {
  const rel = decodeURIComponent(req.url.split('?')[0]);
  const file = path.join(root, rel === '/' ? '/index.html' : rel);
  if (!file.startsWith(root)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (e, b) => { if (e) { res.writeHead(404); return res.end(); } res.setHeader('Content-Type', types[path.extname(file).slice(1)] || 'application/octet-stream'); res.end(b); });
});
// Built without a literal URL so email/chat relays cannot rewrite it.
const BASE = process.env.ASTRO_BASE_URL || ['http:', '', '127.0.0.1:' + port, ''].join('/');
// The malformed spark icon path in app.js predates this work; everything else counts.
const KNOWN_CONSOLE = /<path> attribute d: Expected number/;
const configs = [
  ['Pixel 7', { ...devices['Pixel 7'] }],
  ['360px', { ...devices['Pixel 7'], viewport: { width: 360, height: 740 } }],
  ['1280px', { viewport: { width: 1280, height: 900 } }],
];
const results = [];

(async () => {
  if (!process.env.ASTRO_BASE_URL) await new Promise(r => server.listen(port, '127.0.0.1', r));
  const browser = await chromium.launch();
  for (const [label, device] of configs) {
    const touch = !!device.hasTouch;
    const press = locator => touch ? locator.tap() : locator.click();
    const fresh = async () => {
      const page = await browser.newPage(device);
      page.errors = [];
      page.on('pageerror', e => page.errors.push(e.message));
      page.on('console', m => { if (m.type() === 'error' && !KNOWN_CONSOLE.test(m.text())) page.errors.push(m.text()); });
      await page.goto(BASE);
      await press(page.locator('.home-actions [data-go="reading"]'));
      await page.waitForSelector('#astroProfileForm');
      return page;
    };
    const view = page => page.evaluate(() => state.view);
    const calc = page => press(page.getByRole('button', { name: 'Calculate my sky', exact: true }));
    const inView = (page, sel) => page.locator(sel).evaluate(el => { const r = el.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; });
    const check = async (id, button, expected, fn) => {
      const page = await fresh();
      try { await fn(page); assert.deepEqual(page.errors, []); results.push({ label, id, button, expected, pass: true }); console.log(`PASS ${label} ${id} ${button}`); }
      catch (e) { results.push({ label, id, button, expected, pass: false, error: e.message.split('\n')[0] }); console.log(`FAIL ${label} ${id} ${button}: ${e.message.split('\n')[0]}`); }
      await page.close();
    };

    await check('A0', 'Form contents', 'Only Sun sign and birth year; no date, time, place, time zone or coordinates', async page => {
      for (const name of ['birthDate', 'birthTime', 'timeZone', 'latitude', 'longitude', 'disambiguation']) assert.equal(await page.locator(`[name="${name}"]`).count(), 0, name);
      assert.equal(await page.locator('#astroProfileForm select, #astroProfileForm input').count(), 2);
      assert.deepEqual(await page.locator('[name="birthYear"]').evaluate(el => [el.inputMode, el.getAttribute('enterkeyhint')]), ['numeric', 'done']);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    });
    await check('A1', 'Continue to tarot without astrology (top)', 'Astrology off, spreads brought into view, reading drawn with no astrology', async page => {
      await press(page.locator('#astroContinue'));
      assert.equal(await page.evaluate(() => state.astrologyOff && state.astrologyPrelude === null), true);
      assert.match(await page.locator('#astroStatus').innerText(), /Astrology is off/);
      await page.waitForTimeout(400);
      assert.ok(await inView(page, '.spread-picker'), 'spreads in view');
      await press(page.locator('[data-spread="three"]'));
      assert.equal(await view(page), 'stage');
      await press(page.locator('#stageDrawBtn'));
      assert.equal(await view(page), 'draw');
      assert.equal(await page.evaluate(() => state.readingAstrology), null);
      assert.equal(await page.locator('.astro-reading-summary').count(), 0);
    });
    await check('A2', 'Calculate my sky (nothing entered)', 'Sky right now only, with visible feedback', async page => {
      await calc(page);
      assert.match(await page.locator('#astroStatus').innerText(), /Sky calculated at .*No details entered/);
      assert.equal(await page.evaluate(() => !!state.astrologyPrelude && !state.astrologyPrelude.natal.sunSign), true);
    });
    await check('A3', 'Calculate my sky (sign and year)', 'Sign and year used; Chinese sign shown; no Moon or Rising; reaches the reading', async page => {
      await page.locator('[name="sunSign"]').selectOption('Pisces');
      await press(page.locator('[name="birthYear"]')); await page.keyboard.type('1968');
      await calc(page);
      assert.deepEqual(await page.evaluate(() => state.astrologyProfile), { sunSign: 'Pisces', birthYear: '1968' });
      const text = await page.locator('#astroResult').innerText();
      assert.match(text, /Pisces/); assert.match(text, /CHINESE/); assert.doesNotMatch(text, /NATAL MOON|RISING/);
      await press(page.locator('[data-spread="guidance"]'));
      await press(page.locator('#stageDrawBtn'));
      assert.equal(await page.evaluate(() => state.readingAstrology?.natal?.sunSign), 'Pisces');
      assert.equal(await page.locator('.astro-reading-summary').count(), 1);
    });
    await check('A4', 'Calculate my sky (bad year "68")', 'Message beside the year; error box offers a way on; no snapshot kept', async page => {
      await calc(page);
      await page.locator('[name="birthYear"]').fill('68');
      await calc(page);
      assert.match(await page.locator('#astroMsg-birthYear').innerText(), /four-digit year/);
      assert.equal(await page.locator('[name="birthYear"]').getAttribute('aria-invalid'), 'true');
      assert.equal(await page.evaluate(() => state.astrologyPrelude), null);
      assert.ok(await page.locator('#astroError [data-astro-continue]').isVisible());
    });
    await check('A5', 'Continue to tarot without astrology (in error box)', 'Clears the bad year and turns astrology off', async page => {
      await page.locator('[name="birthYear"]').fill('2300');
      await calc(page);
      await press(page.locator('#astroError [data-astro-continue]'));
      assert.equal(await page.locator('[name="birthYear"]').inputValue(), '');
      assert.equal(await page.locator('#astroError').isVisible(), false);
      assert.equal(await page.evaluate(() => state.astrologyOff), true);
      await press(page.locator('[data-spread="seven"]'));
      assert.equal(await view(page), 'stage');
    });
    await check('A6', 'Clear my details', 'Fields emptied; sky right now only', async page => {
      await page.locator('[name="sunSign"]').selectOption('Leo');
      await page.locator('[name="birthYear"]').fill('1990');
      await calc(page);
      await press(page.locator('#astroSkip'));
      assert.deepEqual([await page.locator('[name="sunSign"]').inputValue(), await page.locator('[name="birthYear"]').inputValue()], ['', '']);
      assert.equal(await page.evaluate(() => !!state.astrologyPrelude && !state.astrologyPrelude.natal.sunSign && !state.astrologyOff), true);
      assert.match(await page.locator('#astroStatus').innerText(), /cleared/);
    });
    await check('A7', 'Show an example', 'Example shown and labelled; your own snapshot unchanged', async page => {
      const before = await page.evaluate(() => JSON.stringify(state.astrologyPrelude?.natal));
      await press(page.locator('#astroDemo'));
      assert.match(await page.locator('#astroExampleResult').innerText(), /Example only/);
      assert.equal(await page.evaluate(() => JSON.stringify(state.astrologyPrelude?.natal)), before);
    });
    await check('A8', 'Spread button (nothing entered)', 'Goes straight to the table', async page => {
      await press(page.locator('[data-spread="celtic"]'));
      assert.equal(await view(page), 'stage');
      assert.equal(await page.evaluate(() => state.spreadId), 'celtic');
    });
    await check('A9', 'Spread button after a bad year', 'Explains beside the spreads, without jumping away', async page => {
      await page.locator('[name="birthYear"]').fill('19');
      await calc(page);
      await page.locator('[data-spread="three"]').scrollIntoViewIfNeeded();
      await press(page.locator('[data-spread="three"]'));
      assert.equal(await view(page), 'reading');
      assert.match(await page.locator('#astroGate').innerText(), /can’t be used yet/);
      assert.ok(await inView(page, '#astroGate'), 'message visible where the person tapped');
    });
    await check('A10', 'Fix my birth year (beside spreads)', 'Takes you to the year field with its message', async page => {
      await page.locator('[name="birthYear"]').fill('19');
      await calc(page);
      await press(page.locator('[data-spread="three"]'));
      await press(page.locator('#astroGate [data-gate="calc"]'));
      assert.equal(await page.evaluate(() => document.activeElement?.name), 'birthYear');
      assert.ok(await inView(page, '[name="birthYear"]'));
    });
    await check('A11', 'Continue without astrology (beside spreads)', 'Opens the spread that was tapped, with no astrology', async page => {
      await page.locator('[name="birthYear"]').fill('19');
      await calc(page);
      await press(page.locator('[data-spread="relationship"]'));
      await press(page.locator('#astroGate [data-gate="skip"]'));
      assert.deepEqual(await page.evaluate(() => [state.view, state.spreadId, state.astrologyPrelude]), ['stage', 'relationship', null]);
    });
    await check('A12', 'Spread button after changing details without calculating', 'Asks; Calculate and continue uses the new details', async page => {
      await page.locator('[name="sunSign"]').selectOption('Leo');
      await calc(page);
      await page.locator('[name="sunSign"]').selectOption('Virgo');
      await press(page.locator('[data-spread="guidance"]'));
      assert.match(await page.locator('#astroGate').innerText(), /haven’t calculated/);
      await press(page.locator('#astroGate [data-gate="calc"]'));
      assert.equal(await view(page), 'stage');
      assert.equal(await page.evaluate(() => state.astrologyPrelude.natal.sunSign), 'Virgo');
      await press(page.locator('#stageDrawBtn'));
      assert.equal(await page.evaluate(() => state.readingAstrology.natal.sunSign), 'Virgo');
    });
    await check('A13', 'Back to spreads (table) and Home (spreads)', 'Return to spreads with details kept, then Home', async page => {
      await page.locator('[name="sunSign"]').selectOption('Leo');
      await calc(page);
      await press(page.locator('[data-spread="three"]'));
      await press(page.locator('[data-back]'));
      assert.equal(await view(page), 'reading');
      assert.equal(await page.locator('[name="sunSign"]').inputValue(), 'Leo');
      await press(page.locator('[data-back]'));
      assert.equal(await view(page), 'home');
    });
    await check('A14', 'Browser/phone Back from the table', 'Returns to spreads; astrology-off choice kept', async page => {
      await press(page.locator('#astroContinue'));
      await press(page.locator('[data-spread="three"]'));
      await page.goBack();
      await page.waitForTimeout(200);
      assert.equal(await view(page), 'reading');
      assert.match(await page.locator('#astroStatus').innerText(), /Astrology is off/);
    });
    await check('A15', 'Roll two dice after Calculate', 'Opening numbers still roll; recalculating resets them', async page => {
      await calc(page);
      await press(page.locator('#rollOpeningDice'));
      await page.waitForFunction(() => !!state.openingDice, null, { timeout: 4000 });
      await calc(page);
      assert.equal(await page.evaluate(() => state.openingDice), null);
    });
  }
  await browser.close();
  server.close();
  const failed = results.filter(r => !r.pass);
  fs.writeFileSync(path.join(out, 'astrology-journey.json'), JSON.stringify({ base: BASE, results }, null, 2));
  console.log(`\n${results.length - failed.length}/${results.length} PASS`);
  process.exit(failed.length ? 1 : 0);
})();
