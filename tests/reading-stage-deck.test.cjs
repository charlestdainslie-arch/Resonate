const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../reading-stage.js'),'utf8');
const deck=require('../deck-engine.js');
function fixture(count){
 const cards=Array.from({length:count},(_,id)=>({id}));
 const ctx=vm.createContext({cards,state:{shuffledDeck:[],shuffleCount:0},Math,ResonateDeck:deck,render(){},shell(){},bindBack(){},clearDrawTimers(){},renderDraw(){},drawTimers:[],window:{scrollTo(){}},requestAnimationFrame(){},positionLabels(){return[]},currentSpread(){return {positions:[]}},sampleDeckNotice(){return''},backButton(){return''},icon(){return''},readingTitle(){return''},spreads:{},Object});
 vm.runInContext(source,ctx);
 return ctx;
}
test('78-card stage shuffle contains no duplicate cards',()=>{
 const ctx=fixture(78);
 vm.runInContext('prepareDeck()',ctx);
 assert.equal(ctx.state.shuffledDeck.length,78);
 assert.equal(new Set(ctx.state.shuffledDeck).size,78);
});
test('sample-deck shuffle remains available for existing prototype',()=>{
 const ctx=fixture(5);
 vm.runInContext('prepareDeck()',ctx);
 assert.equal(ctx.state.shuffledDeck.length,5);
 assert.equal(new Set(ctx.state.shuffledDeck).size,5);
});
