const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
const app=fs.readFileSync(path.join(__dirname,'../app.js'),'utf8');
const stage=fs.readFileSync(path.join(__dirname,'../reading-stage.js'),'utf8');
test('all five spread definitions have the correct numbers of positions',()=>{
 const vm=require('node:vm'); const context=vm.createContext({state:{}});
 const source=app.slice(app.indexOf('const spreads = {'),app.indexOf('state.spreadId ='));
 vm.runInContext(source+';this.counts=Object.fromEntries(Object.entries(spreads).map(([k,v])=>[k,v.positions.length]));',context);
 assert.deepEqual(Object.fromEntries(Object.entries(context.counts)),{guidance:1,three:3,seven:7,relationship:5,celtic:10});
});
test('every reading presents only one active clarifier next action',()=>{
 const source=app.slice(app.indexOf('function renderDraw(){'),app.indexOf('function downloadReading()'));
 assert.match(source,/id="primaryClarifierAction"/);
 assert.doesNotMatch(source,/id="clarifyFirstLayer"/);
 assert.doesNotMatch(source,/id="nextClarifierLayer"/);
 assert.match(source,/Draw First Clarifier/);
 assert.match(source,/Draw Second Clarifier/);
 assert.doesNotMatch(source,/Draw Third Clarifier/);
 assert.match(source,/clarifyAction.onclick/);
});
test('primary action is gold and return, journal and download are secondary',()=>{
 const source=app.slice(app.indexOf('function renderDraw(){'),app.indexOf('function downloadReading()'));
 assert.match(source,/class="gold-button" id="primaryClarifierAction"/);
 assert.match(source,/class="ghost-button" id="backToReadingTop"/);
 assert.match(source,/class="ghost-button" data-go="saved"/);
 assert.match(source,/class="ghost-button" id="downloadReading"/);
});
test('spread selection maps clicked identifier into current spread state',()=>{
 assert.match(stage,/state\.spreadId=button\.dataset\.spread/);
 assert.match(stage,/state\.spreadSize=currentSpread\(\)\.positions\.length/);
});
