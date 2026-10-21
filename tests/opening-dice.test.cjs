const test=require('node:test');const assert=require('node:assert/strict');
const dice=require('../opening-dice.js');
test('two decimal dice yield digits 0–9',()=>{
 assert.deepEqual(dice.roll(()=>0),[0,0]);
 assert.deepEqual(dice.roll(()=>0.999),[9,9]);
});
test('interpretation is personal reflection rather than deterministic prediction',()=>{
 const x=dice.interpret([2,5]);
 assert.match(x,/balance and connection/);assert.match(x,/change and adaptability/);assert.match(x,/leave the rest/);
});
test('invalid rolls are rejected',()=>{
 assert.throws(()=>dice.roll(()=>1),/Invalid/);
 assert.throws(()=>dice.interpret([10,0]),/Expected/);
});
