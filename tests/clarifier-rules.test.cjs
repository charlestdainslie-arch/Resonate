const test=require('node:test');
const assert=require('node:assert/strict');
const R=require('../clarifier-rules.js');
const card=id=>({id,arcana:id<22?'Major':'Minor'});
const byId=id=>id==null?null:card(id);
test('Major base needs a first clarifier; Minor base is optional',()=>{
 const p=R.plan([card(0),card(40)],[],[],byId);
 assert.deepEqual(p.pendingFirst,[0]); assert.deepEqual(p.optional,[1]); assert.deepEqual(p.pendingSecond,[]);
});
test('second only after a Major first clarifier',()=>{
 const p=R.plan([card(0),card(1),card(40)],[5,45,6],[],byId);
 assert.deepEqual(p.pendingSecond,[0,2]);
});
test('never more than two per position',()=>{
 const p=R.plan([card(0)],[5],[7],byId);
 assert.deepEqual(p.pendingFirst,[]); assert.deepEqual(p.pendingSecond,[]); assert.equal(p.positions[0].count,2);
});
test('validate catches a second after a Minor and repeats',()=>{
 assert.deepEqual(R.validate([card(0)],[5],[7],byId),[]);
 assert.equal(R.validate([card(0)],[45],[7],byId).length,1);
 assert.equal(R.validate([card(0),card(1)],[5,5],[],byId).length,1);
});
