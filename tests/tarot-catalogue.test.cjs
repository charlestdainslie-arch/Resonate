const test=require('node:test');
const assert=require('node:assert/strict');
const catalogue=require('../tarot-catalogue.js');
const deck=require('../deck-engine.js');
test('canonical tarot catalogue is 22 major plus 56 minor with unique ids',()=>{
 assert.equal(catalogue.length,78);
 assert.equal(catalogue.filter(c=>c.arcana==='major').length,22);
 assert.equal(catalogue.filter(c=>c.arcana==='minor').length,56);
 assert.equal(new Set(catalogue.map(c=>c.name)).size,78);
 deck.validateDeck(catalogue.map(c=>c.id));
});
test('known anchor identities and card ranges remain stable',()=>{
 assert.equal(catalogue[0].name,'The Fool');
 assert.equal(catalogue[4].name,'The Emperor');
 assert.equal(catalogue[21].name,'The World');
 assert.equal(catalogue[22].name,'Ace of Wands');
 assert.equal(catalogue[77].name,'King of Pentacles');
});
test('layer drawing can use all 78 cards without repeats inside layer',()=>{
 const layer=deck.newLayer(catalogue.map(c=>c.id),{readingId:'fixture',layer:2,slotCount:78,random:()=>0.4});
 assert.equal(new Set(layer.cards).size,78);
 assert.equal(layer.deckInstanceId,'fixture:tarot:2');
});
