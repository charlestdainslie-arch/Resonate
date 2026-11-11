// The draw page's seam (Deep, H, 11 Nov 2026): app.js announces 'resonate:shell' at the start of shell() and
// 'resonate:draw-rendered' {dealing} at the end of renderDraw(), so the Golden Thread light can listen instead of
// wrapping those functions. This test stops the seam from quietly disappearing (a removed notify would turn the
// light off with no error anywhere).
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'../app.js'),'utf8');

function slice(from,to){
 const a=source.indexOf(from),b=source.indexOf(to,a+from.length);
 if(a<0||b<0)throw Error('missing: '+from);
 return source.slice(a,b);
}

test('shell() announces resonate:shell once, before it replaces the page',()=>{
 const code=slice('function notify(name, detail) {','function bindGlobal');
 const events=[];
 const order=[];
 const app={set innerHTML(v){order.push('html');}};
 const ctx=vm.createContext({
  window:{console},
  CustomEvent:function(name,init){this.type=name;this.detail=init.detail;},
  document:{dispatchEvent(e){events.push(e);order.push('event');}},
  app,brandHeader:()=>'',menuOverlay:()=>'',bindGlobal:()=>{}
 });
 vm.runInContext(code,ctx);
 vm.runInContext("shell('x','')",ctx);
 assert.equal(events.length,1);
 assert.equal(events[0].type,'resonate:shell');
 assert.deepEqual(order,['event','html'],'announced before the page is replaced');
});

test('a listener that throws never breaks a render',()=>{
 const code=slice('function notify(name, detail) {','function shell(');
 const ctx=vm.createContext({window:{console:{warn(){}}},CustomEvent:function(n,i){this.type=n;this.detail=i.detail;},document:{dispatchEvent(){throw Error('listener failed');}}});
 vm.runInContext(code,ctx);
 assert.doesNotThrow(()=>vm.runInContext("notify('resonate:draw-rendered',{dealing:true})",ctx));
});

test('renderDraw() captures dealing first and announces it last, with one exit',()=>{
 const body=slice('function renderDraw(){','\n}\n');
 const lines=body.split('\n').map(l=>l.trim()).filter(Boolean);
 assert.match(lines[1],/^const dealing=!state\.drawSettled;/,'dealing is read before the render changes it');
 assert.match(lines[lines.length-1],/^notify\('resonate:draw-rendered',\{dealing\}\);/,'the event is the last statement');
 assert.doesNotMatch(body,/\breturn\b/,'no return anywhere in renderDraw, so nothing can skip the event');
});
