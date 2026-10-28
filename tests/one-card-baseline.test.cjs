const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
const app=fs.readFileSync(path.join(__dirname,'../app.js'),'utf8');
const journal=fs.readFileSync(path.join(__dirname,'../journal.js'),'utf8');
test('one-card reading moves through two clarifier actions using one gold next step',()=>{
 assert.match(app,/Draw First Clarifier/);
 assert.match(app,/Draw Second Clarifier/);
 assert.doesNotMatch(app,/Draw Third Clarifier/);
 assert.match(app,/id="primaryClarifierAction"/);
 assert.match(app,/id="primaryClarifierAction"/);
 assert.doesNotMatch(app,/id="clarifyFirstLayer"/);
});
test('saved reading captures original and two clarifier layers',()=>{
 assert.match(journal,/function captureClarifierLayers\(\)/);
 assert.match(journal,/entry\.clarifierLayers=captureClarifierLayers\(\)/);
 assert.match(journal,/state\.firstLayerClarifiers=\[/);
 assert.match(journal,/state\.additionalClarifierLayers=layers\.filter/);
 assert.match(journal,/How these cards connect/);
});
test('saving gives explicit confirmation and preserves error feedback',()=>{
 assert.match(journal,/✓ Reading saved to Your Personal Journal/);
 assert.match(journal,/Could not save in this browser/);
 assert.match(journal,/✓ Saved to Journal/);
});
