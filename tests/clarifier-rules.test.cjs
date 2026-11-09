const test=require('node:test');
const assert=require('node:assert/strict');
const R=require('../clarifier-rules.js');
const card=id=>({id,arcana:id<22?'Major':'Minor'});
const byId=id=>id==null?null:card(id);
test('Major base needs a first clarifier; Minor base is optional',()=>{
 const p=R.plan([card(0),card(40)],[],[],byId);
 assert.deepEqual(p.pendingFirst,[0]); assert.deepEqual(p.optional,[1]); assert.deepEqual(p.pendingSecond,[]);
});
test('second due after a Major first clarifier; the seeker may choose one after a Minor (9 Nov 2026)',()=>{
 const p=R.plan([card(0),card(1),card(40)],[5,45,6],[],byId);
 assert.deepEqual(p.pendingSecond,[0,2]);
 assert.deepEqual(p.optionalSecond,[1]);
 assert.equal(p.positions[1].needsSecond,false); assert.equal(p.positions[1].mayChooseSecond,true);
});
test('no second offered before a first clarifier, or once two are drawn',()=>{
 const p=R.plan([card(0),card(40)],[5],[7],byId);
 assert.equal(p.positions[0].mayChooseSecond,false); assert.equal(p.positions[0].needsSecond,false);
 assert.equal(p.positions[1].mayChooseSecond,false);
});
test('never more than two per position',()=>{
 const p=R.plan([card(0)],[5],[7],byId);
 assert.deepEqual(p.pendingFirst,[]); assert.deepEqual(p.pendingSecond,[]); assert.equal(p.positions[0].count,2);
});
test('validate allows a chosen second after a Minor; catches a second without a first, and repeats',()=>{
 assert.deepEqual(R.validate([card(0)],[5],[7],byId),[]);
 assert.deepEqual(R.validate([card(0)],[45],[7],byId),[]);
 assert.equal(R.validate([card(0)],[null],[7],byId).length,1);
 assert.equal(R.validate([card(0),card(1)],[5,5],[],byId).length,1);
});
