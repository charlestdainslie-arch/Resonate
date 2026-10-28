const test=require('node:test');
const assert=require('node:assert/strict');
const {validateDeck,shuffle,newLayer}=require('../deck-engine.js');
const ids=Array.from({length:78},(_,i)=>i);
test('full deck requires exactly 78 distinct valid card IDs',()=>{
  assert.equal(validateDeck(ids),true);
  assert.throws(()=>validateDeck(ids.slice(1)),/78/);
  assert.throws(()=>validateDeck([...ids.slice(0,77),0]),/unique/);
});
test('shuffle does not mutate original deck or lose cards',()=>{
  const result=shuffle(ids,()=>0.2);
  assert.deepEqual(ids,Array.from({length:78},(_,i)=>i));
  assert.deepEqual([...result].sort((a,b)=>a-b),ids);
});
test('each clarifier layer uses an independent full deck with unique cards within layer',()=>{
  const first=newLayer(ids,{readingId:'reading-1',layer:1,slotCount:10,random:()=>0.4});
  const second=newLayer(ids,{readingId:'reading-1',layer:2,slotCount:10,random:()=>0.4});
  const third=newLayer(ids,{readingId:'reading-1',layer:3,slotCount:10,random:()=>0.4});
  for(const layer of [first,second,third])assert.equal(new Set(layer.cards).size,10);
  assert.notEqual(first.deckInstanceId,second.deckInstanceId);
  assert.notEqual(second.deckInstanceId,third.deckInstanceId);
  assert.deepEqual(first.cards,second.cards); // repeats ACROSS independently shuffled layers are permitted
});
test('invalid slot counts and bad random generator are rejected',()=>{
  assert.throws(()=>newLayer(ids,{readingId:'r',layer:1,slotCount:79}),/slot count/);
  assert.throws(()=>newLayer(ids,{readingId:'r',layer:1,slotCount:1,random:()=>1}),/Random source/);
});
