const test=require('node:test');
const assert=require('node:assert/strict');
const {createSession,appendClarifierLayer}=require('../reading-session.js');
const all=Array.from({length:78},(_,i)=>i);
test('reading session retains position order and unique base cards',()=>{
 const s=createSession({id:'r1',cardIds:all,spreadPositions:['Past','Present','Future'],random:()=>0.2});
 assert.deepEqual(s.positions,['Past','Present','Future']);
 assert.equal(new Set(s.baseCards).size,3);
 assert.equal(s.layers.length,0);
 assert.equal(s.schemaVersion,1);
});
test('three independently shuffled clarifier layers preserve original spread',()=>{
 const initial=createSession({id:'r2',cardIds:all,spreadPositions:['Past','Present','Future'],random:()=>0.3});
 let s=initial;
 for(let i=1;i<=3;i++)s=appendClarifierLayer(s,all,{random:()=>0.3});
 assert.equal(initial.layers.length,0);
 assert.deepEqual(s.baseCards,initial.baseCards);
 assert.deepEqual(s.layers.map(l=>l.number),[1,2,3]);
 for(const layer of s.layers){
  assert.equal(new Set(layer.entries.map(e=>e.cardId)).size,3);
  assert.deepEqual(layer.entries.map(e=>e.position),[0,1,2]);
 }
 assert.throws(()=>appendClarifierLayer(s,all),/Maximum/);
});
test('selective clarifiers follow declared target positions and reject repeats',()=>{
 const s=createSession({id:'r3',cardIds:all,spreadPositions:['One','Two','Three'],random:()=>0.6});
 const next=appendClarifierLayer(s,all,{targetPositions:[2,0],random:()=>0.6});
 assert.deepEqual(next.layers[0].entries.map(e=>e.position),[2,0]);
 assert.throws(()=>appendClarifierLayer(s,all,{targetPositions:[1,1]}),/targets/);
 assert.throws(()=>appendClarifierLayer(s,all,{targetPositions:[3]}),/targets/);
});
