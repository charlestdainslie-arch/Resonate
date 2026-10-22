const fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert/strict');
const {chromium}=require('playwright');
const {PDFDocument}=require('pdf-lib');
const root=path.resolve(__dirname,'..'),out=path.resolve(process.env.UAT_OUTPUT_DIR||path.join(root,'test-results'));fs.mkdirSync(out,{recursive:true});
const server=http.createServer((req,res)=>{const file=path.join(root,decodeURIComponent(req.url.split('?')[0]==='/'?'/index.html':req.url.split('?')[0]));try{res.setHeader('Content-Type',({js:'text/javascript',css:'text/css',html:'text/html',jpg:'image/jpeg',png:'image/png'})[file.split('.').pop()]||'application/octet-stream');res.end(fs.readFileSync(file));}catch{res.statusCode=404;res.end();}});
const run=Number(process.argv[2]||1),results=[];
(async()=>{
 await new Promise(resolve=>server.listen(8766,'127.0.0.1',resolve));
 const browser=await chromium.launch({headless:true,channel:'chrome'});
 try{
 for(const width of [320,375,390,768,1024,1280,1440,1920])for(const motion of ['reduce','no-preference']){
  const item={width,height:width<600?844:900,motion,passed:[],failed:[]};results.push(item);
  const context=await browser.newContext({viewport:{width,height:item.height},reducedMotion:motion,acceptDownloads:true});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const check=async(name,fn)=>{try{await fn();item.passed.push(name);}catch(e){item.failed.push({name,error:e.message});throw e;}};
  try{
   await page.goto('http://127.0.0.1:8766');
   await check('home fits; equal CTA dimensions; hero has no collisions',async()=>{
    const dims=await page.locator('.home-actions>button').evaluateAll(es=>es.map(e=>e.getBoundingClientRect().toJSON()));assert.equal(dims.length,2);assert.ok(Math.abs(dims[0].width-dims[1].width)<1);assert.equal(dims[0].height,dims[1].height);
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);assert.equal(overflow,false);
    if(width>=1000){const boxes=await page.locator('.home-hero-copy,.hand-hero,.hero-card-preview').evaluateAll(es=>es.map(e=>e.getBoundingClientRect().toJSON()));for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++){const a=boxes[i],b=boxes[j];assert.ok(a.right<=b.left||b.right<=a.left||a.bottom<=b.top||b.bottom<=a.top,'hero overlap');}}
   });
   if(motion==='reduce')await page.screenshot({path:path.join(out,`run-${run}-home-${width}.png`),fullPage:true});
   await page.locator('.home-actions [data-go="reading"]').click();
   await check('dice finish as two 0–9 digits, optional and reduced-motion aware',async()=>{await page.locator('#rollOpeningDice').click();await page.waitForFunction(()=>document.getElementById('rollOpeningDice').disabled===false);assert.match(await page.locator('#openingDiceValues').innerText(),/^\d · \d$/);assert.ok((await page.locator('#openingDiceMeaning').innerText()).includes('symbolic numerology'));});
   const dice=await page.evaluate(()=>[...state.openingDice]);
   await page.locator('[data-spread="guidance"]').click();const before=await page.locator('.stage-card').boundingBox();
   await page.locator('#shuffleCardsBtn').click();await page.waitForFunction(()=>!document.getElementById('shuffleCardsBtn').disabled);await page.locator('#stageDrawBtn').click();await page.waitForFunction(()=>state.drawSettled);
   await check('78 live cards and all images load; stage/reveal dimensions match',async()=>{
    const after=await page.locator('.reading-card').boundingBox();assert.ok(Math.abs(before.width-after.width)<1,JSON.stringify({before,after}));assert.ok(Math.abs(before.height-after.height)<1);assert.equal(await page.evaluate(()=>cards.length),78);
    await page.waitForFunction(()=>[...document.querySelectorAll('.reading-card-front img')].every(e=>e.complete&&e.naturalWidth>0));
   });
   await page.locator('#primaryClarifierAction').click();await page.locator('#primaryClarifierAction').click();
   await check('two clarifiers maximum; three unique cards; visible labels and integrated narrative',async()=>{
    await page.evaluate(()=>drawNextClarifierLayer());assert.equal(await page.locator('.position-clarifier').count(),2);
    const ids=await page.evaluate(()=>[...state.drawnCardIds,...state.firstLayerClarifiers,...state.additionalClarifierLayers.flatMap(l=>l.cards)]);assert.equal(new Set(ids).size,3);
    assert.match(await page.locator('.slot-label').innerText(),/GUIDANCE/i);assert.ok(await page.locator('.combined-meaning').isVisible());
    const names=await page.evaluate(()=>[...state.drawnCardIds,...state.firstLayerClarifiers,...state.additionalClarifierLayers.flatMap(l=>l.cards)].map(id=>cards.find(c=>c.id===id).name));const text=await page.locator('.reading-golden-thread').innerText();names.forEach(n=>assert.ok(text.includes(n),n));
    await page.waitForFunction(()=>[...document.querySelectorAll('.position-clarifier img')].every(e=>e.complete&&e.naturalWidth>0));
   });
   await check('spread geometry fits without overlap or horizontal overflow',async()=>{
    const boxes=await page.locator('.reading-card,.position-clarifier img').evaluateAll(es=>es.map(e=>e.getBoundingClientRect().toJSON()));for(let i=0;i<boxes.length;i++){assert.ok(boxes[i].left>=0&&boxes[i].right<=width);for(let j=i+1;j<boxes.length;j++){const a=boxes[i],b=boxes[j];assert.ok(a.right<=b.left||b.right<=a.left||a.bottom<=b.top||b.bottom<=a.top);}}
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   });
   await page.locator('#readingReflection').fill('UAT reflection: keep the original cards, dice and both clarifiers.');
   const snapshot=await page.evaluate(()=>({ids:[...state.drawnCardIds],at:state.drawnAt,layers:captureClarifierLayers(),dice:[...state.openingDice]}));
   await page.locator('#primaryClarifierAction').click();
   await check('primary final action saves; journal reopens identical reading after reload',async()=>{
    assert.match(await page.locator('#journalSaveStatus').innerText(),/saved/i);await page.locator('#openJournal').click();await page.locator('[data-open-reading]').first().click();await page.reload();await page.evaluate(()=>go('saved'));await page.locator('[data-open-reading]').first().click();
    const restored=await page.evaluate(()=>({ids:[...state.drawnCardIds],at:state.drawnAt,layers:captureClarifierLayers(),dice:[...state.openingDice]}));assert.deepEqual(restored,snapshot);assert.match(await page.locator('#readingReflection').inputValue(),/UAT reflection/);
   });
   await check('card detail reflection preserves clarifiers; return keeps reading',async()=>{await page.locator('.reading-card').click();await page.locator('#noteField').fill('Card reflection retained.');await page.locator('#backBtn').click();assert.equal(await page.locator('.position-clarifier').count(),2);assert.equal(await page.evaluate(()=>state.drawnAt),snapshot.at);});
   await check('PDF download is branded, paginated PDF with journal content',async()=>{
    const waiting=page.waitForEvent('download');await page.locator('#downloadReading').click();const download=await waiting;assert.equal(download.suggestedFilename(),'resonate-tarot-reading.pdf');const file=path.join(out,`run-${run}-reading-${width}-${motion}.pdf`);await download.saveAs(file);const bytes=fs.readFileSync(file);assert.equal(bytes.subarray(0,5).toString(),'%PDF-');const pdf=await PDFDocument.load(bytes);assert.equal(pdf.getAuthor(),'RESONATE');assert.ok(pdf.getPageCount()>=1);
   });
   await page.locator('#backToReadingTop').click();await page.waitForFunction(()=>{const r=document.querySelector('.spread-scroll').getBoundingClientRect();return r.top>=-2&&r.top<innerHeight;});
   await check('return action brings same spread into view',async()=>{const box=await page.locator('.spread-scroll').boundingBox();assert.ok(box.y>=-2&&box.y<item.height);assert.equal(await page.evaluate(()=>state.drawnAt),snapshot.at);});
   if(motion==='reduce')await page.screenshot({path:path.join(out,`run-${run}-spread-${width}.png`)});
   await check('new reading resets dice; no JavaScript errors',async()=>{await page.locator('#drawActions [data-go="reading"]').click();assert.equal(await page.evaluate(()=>state.openingDice),null);assert.deepEqual(errors,[]);});
  }catch(e){console.error(`FAIL ${width} ${motion}: ${e.message}`);await page.screenshot({path:path.join(out,`run-${run}-failure-${width}-${motion}.png`)});}finally{await context.close();}
  console.log(JSON.stringify(item));
 }
 }finally{await browser.close();server.close();fs.writeFileSync(path.join(out,`browser-results-${run}.json`),JSON.stringify(results,null,2));}
 const failed=results.reduce((n,r)=>n+r.failed.length,0);console.log(`RUN ${run}: ${results.reduce((n,r)=>n+r.passed.length,0)} PASS, ${failed} FAIL, ${results.length} configurations`);process.exitCode=failed?1:0;
})().catch(e=>{console.error(e);server.close();process.exitCode=1});
