const test=require('node:test');const assert=require('node:assert/strict');
const {events}=require('../reading-journey.js');
test('journey reveal and interpretations match original position order',()=>{
 const x=events({positions:['Past','Now'],baseCards:[8,2],layers:[{number:1,entries:[{position:1,cardId:14}]}]});
 assert.deepEqual(x.map(e=>e.kind),['reveal','reveal','clarifier','interpretation','interpretation','clarifier-interpretation','synthesis']);
 assert.equal(x[2].position,1);assert.equal(x[3].cardId,8);
 assert.equal(x[5].position,1);assert.equal(x[5].cardId,14);
});
test('invalid reading is rejected',()=>assert.throws(()=>events({positions:['a'],baseCards:[]}),/Invalid reading/));
