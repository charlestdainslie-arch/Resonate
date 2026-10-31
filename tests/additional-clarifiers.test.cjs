// Second clarifiers only where the first clarifier is itself a Major Arcana card (Issue #13).
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync(require('node:path').join(__dirname,'../app.js'),'utf8');
const start=source.indexOf('function readingSecondLayer(){');
const end=source.indexOf('function renderDraw(){',start);
if(start<0||end<0)throw Error('Additional clarifier functions missing');
const code=source.slice(start,end);
function fixture(first){
 const state={drawnAt:'2026-10-21T00:00:00Z',clarifierReadingAt:'2026-10-21T00:00:00Z',firstLayerClarifiers:first,drawnCardIds:[1,30,3],additionalClarifierLayers:[]};
 let renders=0;
 const ctx=vm.createContext({state,cards:Array.from({length:78},(_,id)=>({id,name:'Card '+id,upright:'Meaning',arcana:id<22?'Major':'Minor'})),Math,ResonateDeck:require('../deck-engine.js'),ResonateClarifiers:require('../clarifier-rules.js'),renderDraw(){renders++},reducedMotion(){return true},scrollMotion(){return 'auto'},document:{querySelector(){return {scrollIntoView(){}}},getElementById(){return {scrollIntoView(){}}}}});
 vm.runInContext(code,ctx);
 return {ctx,state,draw:()=>vm.runInContext('drawNextClarifierLayer()',ctx),renders:()=>renders};
}
test('second clarifier only after a Major first clarifier; once; spread intact',()=>{
 const f=fixture([5,40,null]);
 f.draw();f.draw();f.draw();
 assert.equal(f.state.additionalClarifierLayers.length,1);
 const second=f.state.additionalClarifierLayers[0];
 assert.equal(second.number,2);
 assert.notEqual(second.cards[0],null,'Major first clarifier gets a second');
 assert.equal(second.cards[1],null,'Minor first clarifier gets no second');
 assert.equal(second.cards[2],null,'no first clarifier, no second');
 assert.ok(![1,30,3,5,40].includes(second.cards[0]),'second clarifier is new to the reading');
 assert.deepEqual(Array.from(f.state.drawnCardIds),[1,30,3]);
 assert.equal(f.renders(),1);
});
test('no second clarifier when no first clarifier is a Major',()=>{
 const f=fixture([40,41,null]);f.draw();
 assert.equal(f.renders(),0);
});
test('additional layers are not drawn until first layer exists',()=>{
 const f=fixture([]);f.draw();
 assert.equal(f.renders(),0);
});
