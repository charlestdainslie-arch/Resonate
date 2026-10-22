const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm'),crypto=require('crypto'),path=require('path');
const root=path.join(__dirname,'..');
const ctx=vm.createContext({});vm.runInContext(fs.readFileSync(path.join(root,'data.js'),'utf8')+';globalThis.deck=cards',ctx);
const cards=ctx.deck,engine=require('../deck-engine');
test('78 live cards have canonical identities, complete meanings and 78 distinct bundled images',()=>{
 const hashes=new Set();const catalogue=require('../tarot-catalogue');
 assert.equal(cards.length,78);
 for(const c of cards){assert.equal(c.name,catalogue[c.id].name);for(const key of ['upright','reversed','symbolism','journalPrompt'])assert.ok(c[key].length>20,c.name+'.'+key);hashes.add(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,c.image))).digest('hex'));}
 assert.equal(hashes.size,78);
});
test('1000 one-card readings draw three different identities from the complete pool',()=>{
 const ids=cards.map(c=>c.id),seen=new Set();
 for(let i=0;i<1000;i++){const base=engine.shuffle(ids).slice(0,1),first=engine.drawRemaining(ids,base,1),second=engine.drawRemaining(ids,[...base,...first],1);const all=[...base,...first,...second];assert.equal(new Set(all).size,3);all.forEach(id=>seen.add(id));}
 assert.equal(seen.size,78);
});
test('session permits two clarifiers and keeps all drawn cards unique',()=>{
 const session=require('../reading-session'),ids=cards.map(c=>c.id);
 let s=session.createSession({id:'uat',cardIds:ids,spreadPositions:['Guidance'],random:()=>0});
 s=session.appendClarifierLayer(s,ids,{random:()=>0});s=session.appendClarifierLayer(s,ids,{random:()=>0});
 assert.equal(new Set([...s.baseCards,...s.layers.flatMap(l=>l.entries.map(e=>e.cardId))]).size,3);
 assert.throws(()=>session.appendClarifierLayer(s,ids),/Maximum/);
});
test('live numerology uses tarot ranks rather than internal 0–77 identifiers',()=>{
 const source=fs.readFileSync(path.join(root,'app.js'),'utf8');
 ctx.state={openingDice:[6,8]};ctx.ResonateDice=require('../opening-dice');ctx.readingLayerCards=()=>[];
 vm.runInContext(source.slice(source.indexOf('function numerologyForReading('),source.indexOf('function goldenThread(')),ctx);
 const text=vm.runInContext('numerologyForReading([cards[22],cards[35]])',ctx);
 assert.match(text,/Ace of Wands \(1\)/);assert.match(text,/King of Wands \(King\)/);assert.match(text,/sum to <strong>1<\/strong>/);assert.match(text,/Together as 68/);
});
test('dice explain the first digit, second digit and combined number in that order',()=>{
 const text=require('../opening-dice').interpret([6,8]);assert.ok(text.indexOf('6 can represent')<text.indexOf('8 can suggest'));assert.ok(text.indexOf('8 can suggest')<text.indexOf('Together as 68'));assert.match(text,/sum 14 reduces to 5/);
});
test('PDF writer paginates long reflections, sanitises unsupported characters and embeds branding',async()=>{
 const c=vm.createContext({setTimeout});vm.runInContext(fs.readFileSync(path.join(root,'vendor/pdf-lib.min.js'),'utf8'),c);vm.runInContext(fs.readFileSync(path.join(root,'reading-pdf.js'),'utf8'),c);
 const bytes=await c.ResonatePDF.create([{title:'Guidance · The Fool',text:'A reflection 🌟 — with curly “quotes”.\n'.repeat(300)}],2026);
 assert.equal(Buffer.from(bytes).subarray(0,5).toString(),'%PDF-');
 const doc=await c.PDFLib.PDFDocument.load(bytes);assert.ok(doc.getPageCount()>3);assert.equal(doc.getAuthor(),'RESONATE');assert.equal(doc.getTitle(),'RESONATE · Tarot Reading');
});
