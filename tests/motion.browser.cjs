// Integration/browser check. Run with NODE_PATH pointing at Playwright or installed Playwright.
const { chromium }=require('playwright');
const assert=require('node:assert/strict');
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
(async()=>{
 let server;
 const external=process.env.MOTION_BASE_URL;
 if(!external){server=http.createServer((req,res)=>{const p=path.resolve('.',decodeURIComponent(req.url.split('?')[0]).replace(/^\//,''));if(!p.startsWith(process.cwd()+path.sep)){res.writeHead(403).end();return;}fs.readFile(p,(e,d)=>{if(e){res.writeHead(404).end();return;}res.setHeader('Content-Type',p.endsWith('.js')?'text/javascript':p.endsWith('.css')?'text/css':p.endsWith('.html')?'text/html':'application/octet-stream');res.end(d);});});await new Promise(r=>server.listen(0,'127.0.0.1',r));}
 let browser;
 try{
 browser=await chromium.launch({headless:true});
 const base=external||`http://127.0.0.1:${server.address().port}`;
 for(const reduced of ['no-preference','reduce'])for(const width of [390,1280])for(const spread of ['guidance','three','relationship','seven','celtic']){
  const page=await browser.newPage({viewport:{width,height:900},reducedMotion:reduced});const errors=[];page.on('pageerror',e=>errors.push(String(e)));
  await page.goto(base+'/motion-uat.html');await page.evaluate(s=>{state.spreadId=s;state.spreadSize=currentSpread().positions.length;go('reading');},spread);
  await page.locator(`[data-spread="${spread}"]`).click();await page.locator('#stageDrawBtn').click();
  await page.waitForFunction(()=>state.drawSettled===true);
  assert.equal(await page.locator('.rm-root').count(),1);
  const before=await page.locator('.reading-card[data-reading-card]').evaluateAll(ns=>ns.map(n=>n.dataset.readingCard));
  await page.evaluate(()=>ResonateMotionWire.sync());
  const after=await page.locator('.reading-card[data-reading-card]').evaluateAll(ns=>ns.map(n=>n.dataset.readingCard));assert.deepEqual(after,before);
  if(reduced==='reduce')assert.equal(await page.locator('.rm-spark').count(),0);
  // F1: the filament must be gone within ~3s of the reading settling, in every spread.
  await page.waitForFunction(()=>!document.querySelector('.rm-filament'),null,{timeout:3500});
  await page.evaluate(()=>go('home'));await page.waitForTimeout(50);assert.equal(await page.locator('.rm-root').count(),0);assert.deepEqual(errors,[]);
  await page.close();
 }
 console.log('20 actual-app spread/viewport/motion cases passed; visual/device checks still required.');
 }finally{await browser?.close();if(server)await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
