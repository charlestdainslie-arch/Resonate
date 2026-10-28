const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');
const stage=fs.readFileSync(require('node:path').join(__dirname,'../reading-stage.js'),'utf8');
test('dice opening is optional and accessible',()=>{
 assert.match(stage,/id="rollOpeningDice"/);
 assert.match(stage,/aria-live="polite"/);
 assert.match(stage,/You can roll, or simply choose your spread below/);
 assert.match(stage,/ResonateDice\.interpret\(numbers\)/);
});
