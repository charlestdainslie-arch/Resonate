const test=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const path=require('node:path');
function fixture(){
 const storage=new Map();let blocked=false;
 const ctx=vm.createContext({Intl,Date,JSON,Array,crypto:{randomUUID:()=> 'reading-id'},state:{drawnAt:'2026-09-10T00:00:00.000Z',spreadId:'three',drawnCardIds:[0,1,0]},readJSON:()=>[],currentSpread:()=>({name:'Three cards',positions:[['Past'],['Present'],['Future']]}),startDraw(){},renderDraw(){},renderDetail(){},renderSaved(){},render(){},localStorage:{setItem(k,v){if(blocked)throw Error('Quota exceeded');storage.set(k,v);}}});
 vm.runInContext(fs.readFileSync(path.join(__dirname,'../journal.js'),'utf8'),ctx);
 return {ctx,storage,block(){blocked=true;},run(code){return vm.runInContext(code,ctx);}};
}
test('saving and editing retains original reading time, order and one entry',()=>{
 const f=fixture();f.run("saveReadingReflection('First',null)");f.run("saveReadingReflection('Edited',null)");
 const entries=JSON.parse(f.storage.get('resonate-reading-journal-v1'));
 assert.equal(entries.length,1);assert.equal(entries[0].readingAt,'2026-09-10T00:00:00.000Z');assert.deepEqual(entries[0].cardIds,[0,1,0]);assert.equal(entries[0].reflection,'Edited');assert.ok(entries[0].updatedAt);
});
test('a subsequent draw saves as a separate journal entry',()=>{
 const f=fixture();f.run("saveReadingReflection('First',null);state.drawnAt='2026-09-11T00:00:00.000Z';state.journalId=null;crypto.randomUUID=()=> 'second';saveReadingReflection('Second',null)");
 assert.equal(JSON.parse(f.storage.get('resonate-reading-journal-v1')).length,2);
});
test('storage failure reports failure without pretending entry was saved',()=>{
 const f=fixture();f.block();f.ctx.status={textContent:''};assert.equal(f.run("saveReadingReflection('Keep this',status)"),false);assert.match(f.ctx.status.textContent,/Could not save/);assert.equal(f.run('journalEntries.length'),0);assert.equal(f.ctx.state.journalId,null);
});
test('full date includes weekday, written month, year, time and zone',()=>{
 const f=fixture();const value=f.run("journalDate('2026-09-10T00:00:00.000Z','Australia/Sydney')");assert.match(value,/Thursday/);assert.match(value,/10 September 2026/);assert.match(value,/10:00 am/);assert.match(value,/AEST|GMT\+10/);
});
