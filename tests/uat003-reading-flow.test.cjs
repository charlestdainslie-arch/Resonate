const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
const app=fs.readFileSync(path.join(__dirname,'../app.js'),'utf8');
const css=fs.readFileSync(path.join(__dirname,'../reading-welcome.css'),'utf8');
test('each card slot renders its own clarifier cards',()=>{
 assert.match(app,/\$\{clarifierCardsForPosition\(i\)\}/);
 assert.match(app,/class="position-clarifiers"/);
 assert.match(app,/cardImage\(card\)/);
 assert.match(css,/\.position-clarifier img/);
});
test('reading synthesis includes base cards and drawn clarifiers',()=>{
 assert.match(app,/function evolvingReading\(chosen,labels\)/);
 assert.match(app,/state\.firstLayerClarifiers\[i\]/);
 assert.match(app,/layer\.cards\[i\]/);
 assert.match(app,/\$\{evolvingReading\(chosen,labels\)\}/);
});
test('return navigation points to original spread without redraw',()=>{
 assert.match(app,/Back to the spread &amp; clarifiers/);
 assert.match(app,/document\.querySelector\('\.spread-scroll'\)\?\.scrollIntoView/);
});
