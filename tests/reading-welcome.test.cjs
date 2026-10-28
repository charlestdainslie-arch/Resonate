const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const stage=fs.readFileSync(path.join(__dirname,'../reading-stage.js'),'utf8');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
test('reading entry welcomes personal beliefs without requiring them',()=>{
 assert.match(stage,/YOUR PERSONAL READING/);
 assert.match(stage,/Take what resonates, and leave the rest\./);
 assert.match(stage,/you personally believe in/);
 assert.match(stage,/meaning and choices remain yours/);
 assert.match(stage,/aria-labelledby="readingWelcomeTitle"/);
});
test('reading welcome stylesheet is included in the development site',()=>{
 assert.match(html,/reading-welcome\.css/);
 assert.ok(fs.existsSync(path.join(__dirname,'../reading-welcome.css')));
});
