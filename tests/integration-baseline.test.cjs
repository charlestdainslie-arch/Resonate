const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const catalogue=require('../tarot-catalogue.js');

test('five authored cards match canonical full tarot identities',()=>{
  const source=fs.readFileSync(path.join(__dirname,'../data.js'),'utf8');
  const context=vm.createContext({});
  vm.runInContext(source+'\n;globalThis.__sampleCards=cards;',context);
  const authored=context.__sampleCards;
  assert.equal(authored.length,5);
  for(const card of authored){
    assert.equal(catalogue[card.id]?.name,card.name,`Card ${card.id} differs from catalogue`);
    assert.ok(card.upright?.length>20);
    assert.ok(card.reversed?.length>20);
  }
});

test('development HTML loads the catalogue before app.js',()=>{
 const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
 assert.ok(html.indexOf('tarot-catalogue.js')>html.indexOf('deck-engine.js'));
 assert.ok(html.indexOf('tarot-catalogue.js')<html.indexOf('app.js'));
});
