const fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert/strict');
const {chromium}=require('playwright');
const {PDFDocument,PDFName,PDFDict,PDFArray,PDFRawStream,decodePDFRawStream}=require('pdf-lib');
function pdfSnapshot(pdf){const names=pdf.catalog.lookup(PDFName.of('Names'),PDFDict).lookup(PDFName.of('EmbeddedFiles'),PDFDict).lookup(PDFName.of('Names'),PDFArray);const spec=pdf.context.lookup(names.get(1),PDFDict);const stream=spec.lookup(PDFName.of('EF'),PDFDict).lookup(PDFName.of('F'),PDFRawStream);return JSON.parse(Buffer.from(decodePDFRawStream(stream).decode()).toString('utf8'));}
const root=path.resolve(__dirname,'..'),out=path.resolve(process.env.UAT_OUTPUT_DIR||path.join(root,'test-results'));fs.mkdirSync(out,{recursive:true});
const server=http.createServer((req,res)=>{const file=path.join(root,decodeURIComponent(req.url.split('?')[0]==='/'?'/index.html':req.url.split('?')[0]));try{res.setHeader('Content-Type',({js:'text/javascript',css:'text/css',html:'text/html',jpg:'image/jpeg',png:'image/png'})[file.split('.').pop()]||'application/octet-stream');res.end(fs.readFileSync(file));}catch{res.statusCode=404;res.end();}});
const run=Number(process.argv[2]||1),results=[];
(async()=>{
 await new Promise(resolve=>server.listen(8766,'127.0.0.1',resolve));
 const browser=await chromium.launch({headless:true,channel:'chrome'});
 try{
 const configurations=[320,375,390,768,1024,1280,1440,1920].flatMap(width=>['reduce','no-preference'].map(motion=>({width,motion})));
 await Promise.all(Array.from({length:4},async()=>{while(configurations.length){const {width,motion}=configurations.shift();
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
   await check('optional astrology profile, example isolation, DST error and pre-dice snapshot',async()=>{
    assert.equal(await page.locator('[name="sunSign"]').inputValue(),'');assert.equal(await page.locator('[name="birthYear"]').inputValue(),'');const anonymous=await page.evaluate(()=>JSON.stringify(state.astrologyPrelude));
    await page.locator('#astroDemo').click();assert.equal(await page.evaluate(()=>JSON.stringify(state.astrologyPrelude)),anonymous);assert.equal(await page.locator('[name="sunSign"]').inputValue(),'');
    await page.locator('.astro-full-birth summary').click();await page.locator('[name="birthDate"]').fill('2024-11-03');await page.locator('[name="birthTime"]').fill('01:30');await page.locator('[name="timeZone"]').fill('America/New_York');await page.getByRole('button',{name:'Calculate my sky',exact:true}).click();assert.match(await page.locator('#astroError').innerText(),/occurs twice/);assert.equal(await page.evaluate(()=>state.astrologyPrelude),null);
    await page.locator('#astroSkip').click();assert.equal(await page.locator('[name="birthDate"]').inputValue(),'');
    await page.locator('[name="birthDate"]').fill('1990-07-15');await page.locator('[name="birthTime"]').fill('12:34');await page.locator('[name="timeZone"]').fill('Europe/London');await page.locator('[name="latitude"]').fill('51.5');await page.locator('[name="longitude"]').fill('-0.12');await page.getByRole('button',{name:'Calculate my sky',exact:true}).click();assert.equal(await page.locator('#astroError').isVisible(),false);
    assert.equal(await page.evaluate(()=>state.astrologyPrelude.natal.sunSign),'Cancer');assert.ok(await page.evaluate(()=>!!state.astrologyPrelude.natal.moon&&!!state.astrologyPrelude.natal.rising));assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   });
   const expectedAstrology=await page.evaluate(()=>JSON.parse(JSON.stringify(state.astrologyPrelude)));
   await check('dice finish as two 0–9 digits, optional and reduced-motion aware',async()=>{await page.locator('#rollOpeningDice').click();await page.waitForFunction(()=>document.getElementById('rollOpeningDice').disabled===false);assert.match(await page.locator('#openingDiceValues').innerText(),/^\d · \d$/);assert.ok((await page.locator('#openingDiceMeaning').innerText()).includes('symbolic numerology'));});
   const dice=await page.evaluate(()=>[...state.openingDice]);
   await page.locator('[data-spread="guidance"]').click();const before=await page.locator('.stage-card').boundingBox();
   await page.locator('#shuffleCardsBtn').click();await page.waitForFunction(()=>!document.getElementById('shuffleCardsBtn').disabled);await page.locator('#stageDrawBtn').click();await page.waitForFunction(()=>state.drawSettled);
   await check('78 live cards and all images load; stage/reveal dimensions match',async()=>{
    const after=await page.locator('.reading-card').boundingBox();assert.ok(Math.abs(before.width-after.width)<1,JSON.stringify({before,after}));assert.ok(Math.abs(before.height-after.height)<1);assert.equal(await page.evaluate(()=>cards.length),78);assert.deepEqual(await page.evaluate(()=>state.readingAstrology),expectedAstrology);
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
    const boxes=await page.locator('.reading-card-front,.position-clarifier img').evaluateAll(es=>es.map(e=>e.getBoundingClientRect().toJSON()));for(let i=0;i<boxes.length;i++){assert.ok(boxes[i].left>=0&&boxes[i].right<=width);for(let j=i+1;j<boxes.length;j++){const a=boxes[i],b=boxes[j];assert.ok(a.right<=b.left||b.right<=a.left||a.bottom<=b.top||b.bottom<=a.top);}}
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    for(const b of boxes){assert.ok(Math.abs(b.width-boxes[0].width)<1,'card widths differ');assert.ok(Math.abs(b.height-boxes[0].height)<1,'card heights differ');assert.ok(Math.abs(b.top-boxes[0].top)<1,'card tops differ');}
    const fit=await page.locator('.reading-card-front img,.position-clarifier img').evaluateAll(es=>es.map(e=>getComputedStyle(e).objectFit));assert.ok(fit.every(v=>v==='contain'),'artwork must not crop');
    const fonts=await page.locator('.reading-card-front strong,.position-clarifier strong').evaluateAll(es=>es.map(e=>{const s=getComputedStyle(e);return [s.fontFamily,s.fontSize,s.fontWeight,s.lineHeight].join('|')}));assert.equal(new Set(fonts).size,1,'title styles differ');
    assert.doesNotMatch(await page.locator('.reading-next-step .reading-help').innerText(),/another card|draw a clarifier/i);
   });
   await check('save without notes visibly confirms on the clicked primary button',async()=>{
    assert.equal(await page.locator('#primaryClarifierAction').count(),0);assert.equal(await page.locator('#saveReadingJournal').count(),1);await page.locator('#saveReadingJournal').click();assert.equal(await page.locator('#saveReadingJournal').innerText(),'✓ Saved to Journal');assert.equal(await page.locator('#saveReadingJournal').innerText(),'✓ Saved to Journal');assert.match(await page.locator('#primaryJournalSaveStatus').innerText(),/✓ Reading saved/);
   });
   await page.locator('#readingReflection').fill('UAT reflection: keep the original cards, dice and both clarifiers.');
   const snapshot=await page.evaluate(()=>({ids:[...state.drawnCardIds],at:state.drawnAt,layers:captureClarifierLayers(),dice:[...state.openingDice]}));
   await page.locator('#saveReadingJournal').click();
   await check('primary final action saves; journal reopens identical reading after reload',async()=>{
    assert.equal(await page.locator('#saveReadingJournal').innerText(),'✓ Saved to Journal');assert.match(await page.locator('#journalSaveStatus').innerText(),/saved/i);await page.locator('#openJournal').click();await page.locator('[data-open-reading]').first().click();await page.reload();await page.evaluate(()=>go('saved'));await page.locator('[data-open-reading]').first().click();
    assert.deepEqual(await page.evaluate(()=>state.readingAstrology),expectedAstrology);const storage=await page.evaluate(()=>localStorage.getItem(journalKey));assert.ok(!storage.includes('1990-07-15'));assert.ok(!storage.includes('Europe/London'));
    const restored=await page.evaluate(()=>({ids:[...state.drawnCardIds],at:state.drawnAt,layers:captureClarifierLayers(),dice:[...state.openingDice]}));assert.deepEqual(restored,snapshot);assert.match(await page.locator('#readingReflection').inputValue(),/UAT reflection/);
   });
   await check('card detail reflection preserves clarifiers; return keeps reading',async()=>{await page.locator('.reading-card').click();await page.locator('#noteField').fill('Card reflection retained.');await page.locator('#backBtn').click();assert.equal(await page.locator('.position-clarifier').count(),2);assert.equal(await page.evaluate(()=>state.drawnAt),snapshot.at);});
   await check('all detail return controls restore origin after shared spread state changes',async()=>{
    const original=await page.evaluate(()=>captureReadingReturn().reading);
    for(const control of ['#backBtn','#prevBtn','#nextBtn']){
     await page.locator('[data-reading-detail]').first().click();const returnY=await page.evaluate(()=>state.readingReturn.scrollY);
     await page.evaluate(()=>{state.spreadId='three';state.spreadSize=3;state.drawnCardIds=[1,2,3];state.drawnAt='old multi reading';state.readingAstrology=null;state.readingStartedAt='older';state.journalSpread=spreads.three;state.firstLayerClarifiers=[4,5,6];state.additionalClarifierLayers=[{number:2,cards:[7,8,9]}];});
     await page.locator(control).click();assert.deepEqual(await page.evaluate(()=>captureReadingReturn().reading),original);assert.ok(Math.abs(await page.evaluate(()=>scrollY)-returnY)<5,'return scroll context');assert.equal(await page.locator('.reading-card').count(),1);
    }
   });
   await check('switching spreads gives the next detail its own origin; Learn returns to Learn',async()=>{
    await page.evaluate(()=>go('reading'));await page.locator('[data-spread="three"]').click();await page.locator('#stageDrawBtn').click();await page.waitForFunction(()=>state.drawSettled);await page.locator('.reading-card').first().click();await page.locator('#nextBtn').click();await page.locator('#backBtn').click();assert.equal(await page.locator('.reading-card').count(),3);assert.equal(await page.evaluate(()=>state.spreadId),'three');
    await page.evaluate(()=>go('learn'));await page.locator('[data-card]').first().click();await page.locator('#backBtn').click();assert.equal(await page.evaluate(()=>state.view),'learn');assert.equal(await page.evaluate(()=>state.readingReturn),null);
    await page.evaluate(()=>{go('saved')});await page.locator('[data-open-reading]').first().click();assert.equal(await page.locator('.reading-card').count(),1);
   });
   await check('PDF download is branded, paginated PDF with journal content',async()=>{
    const waiting=page.waitForEvent('download');await page.locator('#downloadReading').click();const download=await waiting;assert.equal(download.suggestedFilename(),'resonate-tarot-reading.pdf');const file=path.join(out,`run-${run}-reading-${width}-${motion}.pdf`);await download.saveAs(file);const bytes=fs.readFileSync(file);assert.equal(bytes.subarray(0,5).toString(),'%PDF-');const pdf=await PDFDocument.load(bytes);assert.equal(pdf.getAuthor(),'RESONATE');assert.deepEqual(pdfSnapshot(pdf),expectedAstrology);assert.ok(pdf.getPageCount()>=1);
   });
   await page.locator('#backToReadingTop').click();await page.waitForFunction(()=>{const r=document.querySelector('.spread-scroll').getBoundingClientRect();return r.top>=-2&&r.top<innerHeight;});
   await check('return action brings same spread into view',async()=>{const box=await page.locator('.spread-scroll').boundingBox();assert.ok(box.y>=-2&&box.y<item.height);assert.equal(await page.evaluate(()=>state.drawnAt),snapshot.at);});
   if(motion==='reduce')await page.screenshot({path:path.join(out,`run-${run}-spread-${width}.png`)});
   await check('new reading resets dice; no JavaScript errors',async()=>{await page.locator('#drawActions [data-go="reading"]').click();assert.equal(await page.evaluate(()=>state.openingDice),null);assert.deepEqual(errors,[]);});
   await page.clock.install();
   for(const spread of ['guidance','three','relationship','seven','celtic'])await check('full artwork, single bottom reflection, layers, reopen and PDF: '+spread,async()=>{
    await page.evaluate(()=>go('reading'));await page.locator('[data-spread="'+spread+'"]').click();
    const within=async(selector)=>{const boxes=await page.locator(selector).evaluateAll(es=>es.map(e=>e.getBoundingClientRect().toJSON()));for(let i=0;i<boxes.length;i++){const a=boxes[i];assert.ok(a.left>=-1&&a.right<=width+1,'outside screen '+JSON.stringify(a));for(let j=i+1;j<boxes.length;j++){const b=boxes[j];assert.ok(a.right<=b.left+1||b.right<=a.left+1||a.bottom<=b.top+1||b.bottom<=a.top+1,'overlapping cards');}}};
    await within('.stage-card');await page.locator('#shuffleCardsBtn').click();await page.clock.fastForward(400);await within('.stage-card');await page.clock.fastForward(10000);await page.waitForFunction(()=>!document.getElementById('shuffleCardsBtn').disabled);await page.locator('#stageDrawBtn').click();
    await page.clock.fastForward(430);await within('.reading-card');await page.clock.fastForward(10000);await page.waitForFunction(()=>state.drawSettled);await page.waitForTimeout(800);
    const checkArt=async()=>{await page.waitForFunction(()=>[...document.querySelectorAll('.reading-card-front img,.position-clarifier img')].every(e=>e.complete&&e.naturalWidth>0));await within('.reading-card-front,.position-clarifier img');const details=await page.locator('.reading-card-front img,.position-clarifier img').evaluateAll(es=>es.map(e=>({fit:getComputedStyle(e).objectFit,w:e.clientWidth,h:e.clientHeight})));assert.ok(details.every(e=>e.fit==='contain'&&e.w>30&&e.h>45),'artwork fit');assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);};
    await checkArt();await page.locator('#primaryClarifierAction').click();await checkArt();await page.locator('#primaryClarifierAction').click();await checkArt();
    assert.equal(await page.locator('#readingInterpretation > .atmospheric-art:first-child').count(),0);assert.equal(await page.locator('#readingInterpretation > .eyebrow').first().innerText(),'YOUR READING');
    const count=await page.locator('.reading-card').count();assert.equal(await page.locator('.reading-card-lenses').count(),count*3);assert.equal(await page.locator('.jungian-lens:last-child').count(),count*3);const copy=await page.evaluate(()=>[...document.querySelectorAll('.reading-card-lenses')].every(el=>{const card=cards.find(c=>el.getAttribute('aria-label')==='Interpretive lenses for '+c.name);return card&&el.textContent.includes(card.wuWei)&&el.textContent.includes(card.psychological)}));assert.ok(copy,'existing lens copy retained');assert.equal(await page.locator('.position-clarifier').count(),count*2);assert.equal(await page.locator('#primaryClarifierAction').count(),0);assert.equal(await page.locator('textarea').count(),1);assert.equal(await page.locator('#saveReadingJournal').count(),1);
    assert.equal(await page.evaluate(()=>document.getElementById('drawActions').compareDocumentPosition(document.querySelector('.reading-journal'))&Node.DOCUMENT_POSITION_FOLLOWING),4);
    await page.locator('#saveReadingJournal').click();await page.locator('#openJournal').click();await page.locator('[data-open-reading]').first().click();await checkArt();assert.equal(await page.locator('textarea').count(),1);
    const downloadWait=page.waitForEvent('download');await page.locator('#downloadReading').click();const dl=await downloadWait;const file=path.join(out,`all-${run}-${spread}-${width}-${motion}.pdf`);await dl.saveAs(file);const pdf=await PDFDocument.load(fs.readFileSync(file));assert.ok(pdf.getPageCount()>0);assert.deepEqual(pdfSnapshot(pdf),await page.evaluate(()=>state.readingAstrology));
    if(motion==='reduce'&&[390,768,1440].includes(width)){await page.locator('#backToReadingTop').click();await page.clock.fastForward(1000);await page.screenshot({path:path.join(out,`all-${run}-${spread}-${width}.png`),fullPage:false});}
   });

  }catch(e){console.error(`FAIL ${width} ${motion}: ${e.message}`);await page.screenshot({path:path.join(out,`run-${run}-failure-${width}-${motion}.png`)});}finally{await context.close();}
  console.log(JSON.stringify(item));
 }}));
 }finally{await browser.close();server.close();fs.writeFileSync(path.join(out,`browser-results-${run}.json`),JSON.stringify(results,null,2));}
 const failed=results.reduce((n,r)=>n+r.failed.length,0);console.log(`RUN ${run}: ${results.reduce((n,r)=>n+r.passed.length,0)} PASS, ${failed} FAIL, ${results.length} configurations`);process.exitCode=failed?1:0;
})().catch(e=>{console.error(e);server.close();process.exitCode=1});
