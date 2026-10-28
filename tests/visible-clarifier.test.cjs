const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const engine=require('../deck-engine.js');
const source=fs.readFileSync(path.join(__dirname,'../app.js'),'utf8');
const begin=source.indexOf('function drawFirstLayerClarifiers(){');
const end=source.indexOf('\nfunction firstLayerClarifierView(',begin);
if(begin<0||end<0)throw Error('Clarifier function not found');
const method=source.slice(begin,end);
function run(count){
 const state={drawnAt:'2026-10-21T00:00:00Z',drawnCardIds:[0,1,2],firstLayerClarifiers:[],clarifierReadingAt:null};
 const cards=Array.from({length:count},(_,id)=>({id}));
 const ctx=vm.createContext({state,cards,Math,ResonateDeck:engine,renderDraw(){},document:{getElementById(){return {scrollIntoView(){}}}}});
 vm.runInContext(method+';drawFirstLayerClarifiers()',ctx);
 return state;
}
test('first-layer full-deck clarifiers have distinct card identities',()=>{
 const s=run(78);
 assert.equal(s.firstLayerClarifiers.length,3);
 assert.equal(new Set(s.firstLayerClarifiers).size,3);
});
test('prototype still draws its sample clarifiers without crashing',()=>{
 const s=run(5);
 assert.equal(s.firstLayerClarifiers.length,3);
});
