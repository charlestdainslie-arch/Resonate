// First clarifiers follow Chas's teaching rule (Issue #13): Majors get one; any other card by the seeker's choice.
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const engine=require('../deck-engine.js');
const rules=require('../clarifier-rules.js');
const source=fs.readFileSync(path.join(__dirname,'../app.js'),'utf8');
const begin=source.indexOf('function readingSecondLayer(){');
const end=source.indexOf('\nfunction firstLayerClarifierView(',begin);
if(begin<0||end<0)throw Error('Clarifier function not found');
const method=source.slice(begin,end);
function context(count,drawn){
 const state={drawnAt:'2026-10-21T00:00:00Z',drawnCardIds:drawn,firstLayerClarifiers:[],clarifierReadingAt:null};
 const cards=Array.from({length:count},(_,id)=>({id,arcana:id<22?'Major':'Minor'}));
 let renders=0;
 const ctx=vm.createContext({state,cards,Math,ResonateDeck:engine,ResonateClarifiers:rules,renderDraw(){renders++},scrollMotion(){return 'auto'},document:{querySelector(){return {scrollIntoView(){}}},querySelectorAll(){return []},getElementById(){return {scrollIntoView(){}}}}});
 vm.runInContext(method,ctx);
 return {state,ctx,renders:()=>renders,run:code=>vm.runInContext(code,ctx)};
}
test('only Major Arcana positions receive a first clarifier, all distinct and new to the reading',()=>{
 const f=context(78,[0,30,1]);
 f.run('drawFirstLayerClarifiers()');
 const c=f.state.firstLayerClarifiers;
 assert.equal(c.length,3);
 assert.notEqual(c[0],null); assert.equal(c[1],null); assert.notEqual(c[2],null);
 assert.equal(new Set([0,30,1,c[0],c[2]]).size,5);
});
test('a Minor card can be clarified by the seeker’s choice, once',()=>{
 const f=context(78,[0,30,1]);
 f.run('drawFirstLayerClarifiers()');
 const before=[...f.state.firstLayerClarifiers];
 f.run('drawFirstLayerClarifiers(1)');
 const after=f.state.firstLayerClarifiers;
 assert.equal(after[0],before[0]); assert.equal(after[2],before[2]);
 assert.notEqual(after[1],null);
 f.run('drawFirstLayerClarifiers(1)');
 assert.equal(f.state.firstLayerClarifiers[1],after[1],'a second tap does not redraw');
 assert.equal(new Set([0,30,1,...f.state.firstLayerClarifiers]).size,6);
});
test('a spread with no Major draws nothing until the seeker chooses',()=>{
 const f=context(78,[30,40,50]);
 f.run('drawFirstLayerClarifiers()');
 assert.deepEqual(Array.from(f.state.firstLayerClarifiers),[null,null,null]);
});
test('prototype deck still draws without crashing',()=>{
 const f=context(5,[0,1,2]);
 f.run('drawFirstLayerClarifiers()');
 assert.equal(f.state.firstLayerClarifiers.length,3);
});
