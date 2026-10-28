// Browser walk-through against the local server, memory store and fake providers (no real API calls).
// Run: NODE_PATH=$(npm root -g) node test/e2e.browser.cjs [screenshotDir]
'use strict';
const assert = require('node:assert/strict');
const { chromium, devices } = require('playwright');
const { fakeProviders, hubServer } = require('./helpers.cjs');
const store$ = require('../lib/store');

(async () => {
  const shots = process.argv[2];
  const fake = await fakeProviders(async name => { await new Promise(r => setTimeout(r, 250)); return name === 'Si Aye' ? `**Si Aye → All**\nTonight: phone UAT of #38. @Claude can you post the preview link?` : `**${name} → Chas**\nOn it. Draft PR only, no merge.`; });
  store$.setStore(store$.memoryStore());
  Object.assign(process.env, { HUB_PASSCODE: 'moonlit-tarot', DAILY_CAP_USD: '2', MONTHLY_CAP_USD: '20' });
  const { server, url } = await hubServer();
  const browser = await chromium.launch();
  const results = [];
  const check = async (label, fn) => { try { await fn(); results.push(['PASS', label]); } catch (e) { results.push(['FAIL', label + ' — ' + e.message.split('\n')[0]]); } };
  try {
    const page = await browser.newPage({ ...devices['Pixel 7'] });
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.goto(url);
    await check('sign-in screen first; wrong passcode refused', async () => {
      await page.fill('#pass', 'wrong'); await page.click('#login button');
      await page.waitForFunction(() => document.querySelector('#loginErr').textContent.includes('Wrong'));
    });
    await check('right passcode opens the chat', async () => {
      await page.fill('#pass', 'moonlit-tarot'); await page.click('#login button');
      await page.waitForSelector('#app:not(.hidden)');
    });
    await check('message to All: three replies plus a hand-off, each with a cost', async () => {
      await page.fill('#text', 'Evening lads, where are we?'); await page.click('#send');
      await page.waitForFunction(() => document.querySelectorAll('.msg.agent').length >= 3, null, { timeout: 15000 });
      await page.waitForTimeout(1500);
      const who = await page.$$eval('.msg.agent .who span:first-child', ns => ns.map(n => n.textContent));
      assert.deepEqual(who, ['Si Aye', 'Claude', 'Deep'], 'Si Aye called on Claude, who was already due: no duplicate reply');
      assert.ok(await page.$$eval('.msg.agent .cost', ns => ns.every(n => /^\$0\.\d+/.test(n.textContent))));
      if (shots) await page.screenshot({ path: shots + '/hub-chat.png' });
    });
    await check('spend pill shows today against the cap', async () => {
      assert.match(await page.textContent('#spendPill'), /^Today \$0\.\d+ \/ \$2\.00$/);
    });
    await check('chips pick one agent', async () => {
      const before = await page.$$eval('.msg.agent', n => n.length);
      await page.click('.chip[data-to=deep]'); await page.fill('#text', 'Deep only'); await page.click('#send');
      await page.waitForFunction(n => document.querySelectorAll('.msg.agent').length === n + 1, before, { timeout: 10000 });
      await page.waitForTimeout(1500);
      assert.equal(await page.$$eval('.msg.agent', n => n.length), before + 1);
      assert.equal(await page.textContent('.msg.agent:last-of-type .who span'), 'Deep');
    });
    await check('Stop pauses everyone mid-round', async () => {
      await page.click('.chip[data-to=all]'); await page.fill('#text', 'All again'); await page.click('#send');
      await page.waitForSelector('#stop:not(.hidden)'); await page.click('#stop');
      await page.waitForFunction(() => [...document.querySelectorAll('.msg.system')].some(n => n.textContent.includes('Paused')));
      await page.waitForTimeout(700); // a reply already in flight may still land
      const n = await page.$$eval('.msg.agent', x => x.length); await page.waitForTimeout(2000);
      assert.equal(await page.$$eval('.msg.agent', x => x.length), n);
    });
    await check('cost monitor: totals, caps, providers, keys set, recent replies, real-bill links', async () => {
      await page.click('nav button[data-tab=monitor]');
      await page.waitForSelector('#monitor .card');
      const t = await page.textContent('#monitor');
      for (const s of ['daily cap', 'monthly cap', 'Anthropic', 'OpenAI', 'DeepSeek', 'key set', 'Recent replies', 'real bill']) assert.ok(t.includes(s), s);
      assert.ok(!t.includes('test-openai-key'));
      if (shots) await page.screenshot({ path: shots + '/hub-monitor.png', fullPage: true });
    });
    await check('team notes save and reach the agents', async () => {
      await page.click('nav button[data-tab=notes]'); await page.fill('#notesText', 'Priority: phone UAT of #38.'); await page.click('#saveNotes');
      await page.waitForFunction(() => document.querySelector('#notesMsg').textContent.includes('Saved'));
      await page.click('nav button[data-tab=chat]'); await page.click('.chip[data-to=claude]');
      fake.requests.length = 0; await page.fill('#text', 'Claude?'); await page.click('#send');
      await page.waitForFunction(() => true); await new Promise(r => setTimeout(r, 2500));
      assert.ok(fake.requests.some(r => JSON.stringify(r.body).includes('Priority: phone UAT of #38.')));
    });
    for (const w of [360, 390]) await check(`${w}px: no horizontal scroll, controls at least 34px`, async () => {
      await page.setViewportSize({ width: w, height: 780 });
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      const small = await page.$$eval('button:not(.hidden)', bs => bs.filter(b => b.offsetParent && b.getBoundingClientRect().height < 34).map(b => b.textContent));
      assert.deepEqual(small, [], JSON.stringify(small));
    });
    await check('no page errors', async () => assert.deepEqual(errors, []));
  } finally {
    await browser.close(); server.close(); fake.server.close();
  }
  results.forEach(([s, l]) => console.log(s, l));
  const pass = results.filter(r => r[0] === 'PASS').length;
  console.log(`\n${pass}/${results.length} ${pass === results.length ? 'PASS' : 'FAIL'}`);
  if (pass !== results.length) process.exitCode = 1;
})();
