// Issue #14 browser check (Playwright): phone/browser Back walks the app's own return path,
// the closed menu is unreachable, Escape closes it, focus follows navigation, 44px targets, no overflow.
// Run with: node tests/navigation-a11y.browser.cjs
const fs = require('fs'), path = require('path'), http = require('http'), assert = require('assert/strict');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');
const port = 8768;
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
const back = async page => { await page.goBack({ waitUntil: 'commit', timeout: 3000 }).catch(() => {}); await page.waitForTimeout(150); };

(async () => {
  await new Promise(r => server.listen(port, '127.0.0.1', r));
  const browser = await chromium.launch();
  const failures = [];
  try {
    for (const width of [360, 390, 768, 1024, 1280]) {
      const ctx = await browser.newContext({ viewport: { width, height: width < 600 ? 800 : 900 }, reducedMotion: 'reduce' });
      const page = await ctx.newPage();
      const errors = []; page.on('pageerror', e => errors.push(e.message));
      const check = async (name, fn) => { try { await fn(); } catch (e) { failures.push(`${width}px ${name}: ${e.message.replace(/\s+/g, ' ').slice(0, 220)}`); } };
      await page.goto(BASE);

      await check('closed menu is not keyboard reachable', async () => {
        const reachable = await page.evaluate(() => [...document.querySelectorAll('#menuOverlay button')].filter(b => { b.focus(); return document.activeElement === b; }).length);
        assert.equal(reachable, 0);
      });
      await check('menu opens with focus inside, Escape closes and returns focus', async () => {
        await page.locator('#menuBtn').click();
        assert.ok(await page.evaluate(() => !!document.activeElement.closest('#menuOverlay')));
        assert.equal(await page.locator('#menuBtn').getAttribute('aria-expanded'), 'true');
        await page.keyboard.press('Escape');
        assert.equal(await page.evaluate(() => document.getElementById('menuOverlay').classList.contains('open')), false);
        assert.equal(await page.evaluate(() => document.activeElement.id), 'menuBtn');
      });
      await check('Back with menu open closes the menu and stays on Home', async () => {
        await page.locator('#menuBtn').click();
        await back(page);
        assert.equal(await page.evaluate(() => document.getElementById('menuOverlay').classList.contains('open')), false);
        assert.ok(page.url().startsWith(BASE));
        assert.equal(await view(page), 'home');
      });

      // Reset to a known state so a failure above cannot cascade into a crash below.
      if (!page.url().startsWith(BASE)) await page.goto(BASE);
      await page.evaluate(() => { closeMenu(); go('home'); });

      // Walk forward: Home → Reading hub → one-card table → reading → card detail
      await page.locator('.home-actions [data-go="reading"]').click();
      await check('focus moves to the new page heading', async () => assert.equal(await page.evaluate(() => document.activeElement.tagName), 'H1'));
      await page.locator('[data-spread="guidance"]').click();
      await page.locator('#stageDrawBtn').click();
      await page.waitForFunction(() => state.drawSettled === true);
      const drawn = await page.evaluate(() => [...state.drawnCardIds]);
      await page.locator('.reading-card').first().click();
      assert.equal(await view(page), 'detail');

      // Walk back with the phone/browser Back button, one press at a time.
      await check('Back from card detail returns to the same reading', async () => {
        await back(page);
        assert.equal(await view(page), 'draw');
        assert.deepEqual(await page.evaluate(() => [...state.drawnCardIds]), drawn);
      });
      await check('Back from the reading returns to the spread choice', async () => { await back(page); assert.equal(await view(page), 'reading'); });
      await check('Back from the spread choice returns Home', async () => { await back(page); assert.equal(await view(page), 'home'); assert.ok(page.url().startsWith(BASE)); });

      // Learn path
      if (!page.url().startsWith(BASE)) await page.goto(BASE);
      await page.evaluate(() => go('home'));
      await page.locator('.home-actions [data-go="learn"]').click();
      await page.locator('[data-card]').nth(13).click();
      await check('Back from a Learn card returns to Learn, then Home', async () => {
        await back(page); assert.equal(await view(page), 'learn');
        await back(page); assert.equal(await view(page), 'home');
      });
      await check('Back on Home leaves the app normally', async () => { if (page.url().startsWith(BASE)) await back(page); assert.ok(!page.url().startsWith(BASE), page.url()); });
      await page.goto(BASE);

      // Fit and touch targets on the main screens
      const screens = [['home', () => {}], ['learn', () => page.evaluate(() => go('learn'))], ['reading', () => page.evaluate(() => go('reading'))], ['saved', () => page.evaluate(() => go('saved'))]];
      for (const [name, open] of screens) {
        await open(); await page.waitForTimeout(120);
        await check(`${name}: no horizontal overflow`, async () => assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1), false));
        await check(`${name}: header and back controls are at least 44px`, async () => {
          const small = await page.evaluate(() => [...document.querySelectorAll('#menuBtn,.brand-home,.back-link,#clearSearch:not(:empty),.chip')].filter(el => { const r = el.getBoundingClientRect(); return r.width && (r.width < 44 || r.height < 44); }).map(el => el.textContent.trim().slice(0, 20) || el.id));
          assert.deepEqual(small, []);
        });
      }
      await check('no page errors', async () => assert.deepEqual(errors, []));
      await ctx.close();
    }
  } finally { await browser.close(); server.close(); }
  if (failures.length) { console.error(failures.join('\n')); console.error(`FAIL ${failures.length}`); process.exit(1); }
  console.log('PASS navigation, Back button, menu keyboard, focus and touch-target checks (5 widths)');
})();
