const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');const css=fs.readFileSync(path.join(__dirname,'../reading-welcome.css'),'utf8');
test('one-card clarification overlays have parent-card scale and no clipping',()=>{
 const x=css.split('/* One-card acceptance baseline:')[1];assert.ok(x);
 assert.match(x,/spread-board\.spread-1/);
 assert.match(x,/position-clarifiers\{[\s\S]*?position:absolute/);
 assert.match(x,/position-clarifier\{[\s\S]*?width:100%/);
 assert.match(x,/position-clarifier img\{[\s\S]*?object-fit:contain/);
 assert.match(x,/overflow:visible/);
});
