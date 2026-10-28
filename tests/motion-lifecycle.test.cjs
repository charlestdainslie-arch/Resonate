const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');

// Deterministic DOM/resource harness: does not claim CSS rendering/browser verification.
function harness() {
  let id=0, time=0;
  const frames=new Map(), timers=new Map(), observers=new Set();
  class Signal {
    constructor(){this.aborted=false;this.listeners=new Set();}
    addEventListener(type,fn){if(type==='abort')this.listeners.add(fn);}
    removeEventListener(type,fn){this.listeners.delete(fn);}
    abort(){this.aborted=true;[...this.listeners].forEach(fn=>fn());}
  }
  class Element {
    constructor(tag){this.tag=tag;this.attrs={};this.children=[];this.parentNode=null;this.clientWidth=400;this.clientHeight=600;this.style={setProperty(){}};const set=new Set();this.classList={contains:c=>set.has(c),add:(...cs)=>{cs.forEach(c=>set.add(c));this.mutate();},remove:(...cs)=>{cs.forEach(c=>set.delete(c));this.mutate();}};}
    mutate(){for(const o of observers)if(o.targets.has(this))o.records.push({target:this,type:'attributes',attributeName:'class'});}
    setAttribute(k,v){this.attrs[k]=String(v);if(k==='class')this.classList.add(...v.split(' '));}
    getAttribute(k){return this.attrs[k];}
    appendChild(n){this.children.push(n);n.parentNode=this;return n;}
    contains(n){return n===this||this.children.some(c=>c.contains(n));}
    remove(){if(this.parentNode){const p=this.parentNode;p.children=p.children.filter(c=>c!==this);this.parentNode=null;}}
    replaceChildren(){this.children.forEach(n=>{n.parentNode=null;});this.children=[];}
    querySelectorAll(s){let result=[];for(const c of this.children){if(s.startsWith('.')&&c.classList.contains(s.slice(1)))result.push(c);result.push(...c.querySelectorAll(s));}return result;}
    querySelector(s){return this.querySelectorAll(s)[0]||null;}
    getBoundingClientRect(){return {left:0,top:0,width:400,height:600};}
  }
  class MutationObserver {
    constructor(fn){this.fn=fn;this.targets=new Set();this.records=[];observers.add(this);}
    observe(n){this.targets.add(n);}
    disconnect(){this.targets.clear();this.records=[];}
  }
  const media={matches:false,listeners:new Set(),addEventListener(t,f){this.listeners.add(f);},removeEventListener(t,f){this.listeners.delete(f);},set(v){this.matches=v;[...this.listeners].forEach(f=>f());}};
  const document={createElement:t=>new Element(t),createElementNS:(_,t)=>new Element(t)};
  const ctx={window:{},document,Element,MutationObserver,matchMedia:()=>media,
    requestAnimationFrame:fn=>{frames.set(++id,fn);return id;},cancelAnimationFrame:i=>frames.delete(i),
    setTimeout:(fn,delay)=>{timers.set(++id,{fn,at:time+delay});return id;},clearTimeout:i=>timers.delete(i),Math,Set,Map};
  vm.runInNewContext(fs.readFileSync('resonate-motion.js','utf8'),ctx);
  const host=new Element('div'),card=new Element('button');card.classList.add('reading-card','is-facedown');host.appendChild(card);
  function flush(){for(const o of observers)if(o.records.length){const r=o.records.splice(0);o.fn(r);}}
  function advance(ms){time+=ms;for(const [k,v] of [...timers])if(v.at<=time){timers.delete(k);v.fn();}}
  function frame(t){const pending=[...frames.values()];frames.clear();pending.forEach(f=>f(t));}
  function flip(){card.classList.remove('is-facedown');card.classList.add('revealed');flush();}
  const activeObservers=()=>[...observers].filter(o=>o.targets.size).length;
  return {api:ctx.window.ResonateMotion,host,card,media,frames,timers,Signal,flush,advance,frame,flip,activeObservers};
}
test('reveal decorates actual transition without changing card identity or classes',()=>{
 const h=harness(),a=h.api.mount(h.host);h.card.setAttribute('data-reading-card','42');a.reveal([h.card]);
 assert(h.card.classList.contains('is-facedown'));assert.equal(h.host.querySelectorAll('.rm-particles').length,0);
 h.flip();assert.equal(h.host.querySelectorAll('.rm-particles').length,1);assert.equal(h.card.getAttribute('data-reading-card'),'42');assert(h.card.classList.contains('revealed'));a.destroy();
});
test('mount abort destroys DOM/listeners and prevents later reveal',()=>{
 const h=harness(),s=new h.Signal(),a=h.api.mount(h.host,{signal:s});a.reveal([h.card]);h.flip();s.abort();a.reveal([h.card]);
 assert.equal(h.host.querySelectorAll('.rm-root').length,0);assert.equal(h.frames.size,0);assert.equal(h.timers.size,0);assert.equal(h.activeObservers(),0);assert.equal(h.media.listeners.size,0);assert.equal(s.listeners.size,0);assert(!h.card.classList.contains('rm-shimmer'));
});
test('per-reveal abort cleans decoration but next reveal remains usable',()=>{
 const h=harness(),s=new h.Signal(),a=h.api.mount(h.host);a.reveal([h.card],{signal:s});h.flip();s.abort();assert.equal(h.timers.size,0);assert.equal(h.frames.size,0);assert.equal(s.listeners.size,0);
 h.card.classList.remove('revealed');h.card.classList.add('is-facedown');a.reveal([h.card]);h.flip();assert.equal(h.host.querySelectorAll('.rm-particles').length,1);a.destroy();
});
test('repeated reveal detaches old signal and keeps only one observer/frame',()=>{
 const h=harness(),s=new h.Signal(),a=h.api.mount(h.host);a.reveal([h.card],{signal:s});a.reveal([h.card]);assert.equal(s.listeners.size,0);assert.equal(h.activeObservers(),1);assert.equal(h.frames.size,1);s.abort();h.flip();assert.equal(h.host.querySelectorAll('.rm-particles').length,1);a.destroy();
});
test('settled cards do not replay sparkle or draw an animated filament',()=>{
 const h=harness();h.flip();const a=h.api.mount(h.host);a.reveal([h.card]);assert.equal(h.frames.size,0);assert.equal(h.host.querySelectorAll('.rm-particles').length,0);assert.equal(h.activeObservers(),0);a.destroy();
});
test('particle and shimmer timeout cleanup completes naturally',()=>{
 const h=harness(),a=h.api.mount(h.host);a.reveal([h.card]);h.flip();h.advance(1700);assert.equal(h.host.querySelectorAll('.rm-particles').length,0);assert(!h.card.classList.contains('rm-shimmer'));assert.equal(h.timers.size,0);a.destroy();
});
test('filament finishes, fades and is removed with no queued animation frame (F1)',()=>{
 const h=harness(),a=h.api.mount(h.host);a.reveal([h.card]);h.frame(0);h.flip();h.frame(2100);
 assert.equal(h.host.querySelectorAll('.rm-filament').length,1,'still visible while holding');
 h.frame(2600);h.frame(3200);assert.equal(h.frames.size,0);assert.equal(h.host.querySelectorAll('.rm-filament').length,0);
 assert.equal(h.host.querySelector('.rm-root').getAttribute('data-filament'),'cleared');a.destroy();
});
test('filament waits for the last card, but a hard cap still removes it (F1)',()=>{
 const h=harness(),a=h.api.mount(h.host);a.reveal([h.card]);h.frame(0);h.frame(2500);h.frame(4000);
 assert.equal(h.host.querySelectorAll('.rm-filament').length,1,'held while a card is still face down');
 h.frame(9100);h.frame(9600);h.frame(10200);assert.equal(h.host.querySelectorAll('.rm-filament').length,0);assert.equal(h.frames.size,0);a.destroy();
});
test('reduced motion seen inside the frame loop cancels and leaves the still layer (F2)',()=>{
 const h=harness(),a=h.api.mount(h.host);a.reveal([h.card]);h.frame(0);h.media.matches=true;h.frame(100);
 assert.equal(h.frames.size,0);assert.equal(h.activeObservers(),0);assert.equal(h.host.querySelectorAll('.rm-filament').length,0);assert.equal(h.host.querySelectorAll('.rm-still').length,1);a.destroy();
});
test('live reduced motion clears animation, shimmer, particles and timers',()=>{
 const h=harness(),a=h.api.mount(h.host);a.reveal([h.card]);h.flip();h.media.set(true);assert.equal(h.frames.size,0);assert.equal(h.timers.size,0);assert.equal(h.activeObservers(),0);assert(!h.card.classList.contains('rm-shimmer'));assert.equal(h.host.querySelectorAll('.rm-still').length,1);h.media.set(false);assert.equal(h.frames.size,0);a.destroy();assert.equal(h.media.listeners.size,0);
});
test('missing container, pre-aborted signal and repeated destroy are safe',()=>{
 const h=harness(),s=new h.Signal();s.abort();assert.equal(h.api.mount(null),null);assert.equal(h.api.mount(h.host,{signal:s}),null);assert.equal(h.host.children.length,1);const a=h.api.mount(h.host);a.destroy();a.destroy();a.cancel();assert.equal(h.frames.size+h.timers.size,0);
});
test('cancel leaves app and pre-existing owned-name classes intact',()=>{
 const h=harness();h.host.classList.add('rm-host');h.card.classList.add('rm-shimmer');const a=h.api.mount(h.host);a.reveal([h.card]);h.flip();a.cancel();assert(h.card.classList.contains('revealed'));assert(h.card.classList.contains('rm-shimmer'));assert.equal(h.host.querySelectorAll('.rm-particles').length,0);a.destroy();assert(h.host.classList.contains('rm-host'));
});
