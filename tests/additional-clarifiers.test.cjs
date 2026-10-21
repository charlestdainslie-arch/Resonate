const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync(require('node:path').join(__dirname,'../app.js'),'utf8');
const start=source.indexOf('function drawNextClarifierLayer(){');
const end=source.indexOf('function renderDraw(){',start);
if(start<0||end<0)throw Error('Additional clarifier functions missing');
const code=source.slice(start,end);
function fixture(){
 const state={drawnAt:'2026-10-21T00:00:00Z',clarifierReadingAt:'2026-10-21T00:00:00Z',firstLayerClarifiers:[4,5,6],drawnCardIds:[1,2,3],additionalClarifierLayers:[]};
 let renders=0;
 const ctx=vm.createContext({state,cards:Array.from({length:78},(_,id)=>({id,name:'Card '+id,upright:'Meaning'})),Math,ResonateDeck:require('../deck-engine.js'),renderDraw(){renders++},document:{getElementById(){return {scrollIntoView(){}}}}});
 vm.runInContext(code,ctx);
 return {ctx,state,draw:()=>vm.runInContext('drawNextClarifierLayer()',ctx),renders:()=>renders};
}
test('second and third layers are unique within layer and original spread stays intact',()=>{
 const f=fixture();f.draw();f.draw();f.draw();
 assert.equal(f.state.additionalClarifierLayers.length,2);
 assert.deepEqual(f.state.additionalClarifierLayers.map(x=>x.number),[2,3]);
 for(const layer of f.state.additionalClarifierLayers)assert.equal(new Set(layer.cards).size,3);
 assert.deepEqual(f.state.drawnCardIds,[1,2,3]);
 assert.equal(f.renders(),2);
});
test('additional layers are not drawn until first layer exists',()=>{
 const f=fixture();f.state.firstLayerClarifiers=[];f.draw();
 assert.equal(f.renders(),0);
});
