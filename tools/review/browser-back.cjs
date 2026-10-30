const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.resolve(process.argv[2]);
const types = { '.html':'text/html','.js':'text/javascript','.css':'text/css','.jpg':'image/jpeg','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml' };
const server = http.createServer((req, res) => { let r = decodeURIComponent(req.url.split('?')[0]); if (r === '/') r = '/index.html'; const f = path.join(ROOT, r); if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res); });
server.listen(0, '127.0.0.1', async () => {
  const b = await chromium.launch(); const out = [];
  for (const [w, h] of [[360, 740], [390, 844], [768, 1024], [1180, 820], [1280, 800], [1920, 1080]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, isMobile: w < 800, hasTouch: w < 800 });
    const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto(`http://127.0.0.1:${server.address().port}/`); await p.waitForTimeout(500);
    const v = () => p.evaluate(() => typeof state === 'undefined' ? 'LEFT APP (' + location.href + ')' : state.view);
    await p.getByRole('button', { name: 'Get a Reading', exact: true }).first().click(); await p.waitForTimeout(300);
    await p.locator('[data-spread="three"]').click(); await p.waitForTimeout(300);
    await p.locator('#shuffleCardsBtn').click(); await p.waitForFunction(() => !document.querySelector('#stageDrawBtn')?.disabled, null, { timeout: 15000 });
    await p.locator('#stageDrawBtn').click(); await p.waitForFunction(() => state.drawSettled, null, { timeout: 30000 });
    await p.locator('[data-reading-detail]').first().click(); await p.waitForTimeout(400);
    const seq = [await v()];
    for (let i = 0; i < 3; i++) { await p.goBack(); await p.waitForTimeout(500); seq.push(await v()); }
    const fwd = []; for (let i = 0; i < 2; i++) { await p.goForward(); await p.waitForTimeout(500); fwd.push(await v()); }
    out.push(`${w}px back: ${seq.join(' → ')} | forward: ${fwd.join(' → ')} | errors: ${errs.length}`);
    await ctx.close();
  }
  console.log(out.join('\n')); await b.close(); server.close();
});
