// Issue #10 / #20 evidence helper, not a pass/fail test. Seeded Math.random, empty storage, 1280px, reduced motion.
// Deterministic visible-section inventory of one build. Usage: node inventory.cjs <root> <port> <out.json>
const {chromium}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');
const [root,port,out]=process.argv.slice(2);
const T={js:'text/javascript',css:'text/css',html:'text/html',jpg:'image/jpeg',png:'image/png'};
const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);const f=path.join(root,u==='/'?'/index.html':u);fs.readFile(f,(e,b)=>{if(e){r.writeHead(404);return r.end()}r.setHeader('Content-Type',T[path.extname(f).slice(1)]||'application/octet-stream');r.end(b)})});
const grab=p=>p.evaluate(()=>{const vis=e=>{const s=getComputedStyle(e);const r=e.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&+s.opacity>0.05&&r.width>0&&r.height>0};
 const sel='h1,h2,h3,h4,.eyebrow,summary,button,label,[class*=section-label]';
 return {view:state.view,items:[...document.querySelectorAll('#app '+sel)].filter(vis).map(e=>e.tagName.toLowerCase()+(e.className?'.'+String(e.className).split(' ')[0]:'')+' | '+e.textContent.replace(/\s+/g,' ').trim().slice(0,90)).filter(x=>!/\| $/.test(x)),
  paragraphs:[...document.querySelectorAll('#app p')].filter(vis).length,images:[...document.querySelectorAll('#app img')].filter(vis).map(i=>i.getAttribute('src'))}});
srv.listen(+port,async()=>{
 const b=await chromium.launch();const p=await b.newPage({viewport:{width:1280,height:900},reducedMotion:'reduce'});
 await p.addInitScript(()=>{let s=20261028;Math.random=()=>((s=(s*1103515245+12345)%2147483648)/2147483648);localStorage.clear();});
 const res={};const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto(`http://127.0.0.1:${port}/`);res.home=await grab(p);
 await p.evaluate(()=>go('learn'));res.learn=await grab(p);
 await p.evaluate(()=>openCard((cards.find(c=>c.name==='Temperance')||cards[0]).id,'learn'));res.detail=await grab(p);
 await p.evaluate(()=>go('reading'));res.reading=await grab(p);
 if(await p.locator('[data-spread="guidance"]').count()){await p.locator('[data-spread="guidance"]').click();res.stage=await grab(p);await p.locator('#stageDrawBtn').click();}
 else await p.locator('#drawCardsBtn').click();
 await p.waitForFunction(()=>state.drawSettled===true,null,{timeout:20000});res.draw_one=await grab(p);
 for(const n of [1,2]){const c=p.locator('#primaryClarifierAction, button:has-text("Clarif")').first();if(await c.count()&&await c.isVisible()){await c.click();await p.waitForTimeout(400);res['draw_clarifier'+n]=await grab(p);}}
 await p.evaluate(()=>go('saved'));res.saved=await grab(p);
 res.errors=errs;fs.writeFileSync(out,JSON.stringify(res,null,1));await b.close();srv.close();});
