/* RESONATE · Golden Thread opener (UAT demo, opt-in page golden-thread-opener.html only).
   A 16-second phone-first sequence. Smoke rises. The RESONATE hand appears and its fingertip glows.
   A golden thread curls out, sparkling, and wraps a face-down card. The card turns over to The Fool
   and the thread settles under the introduction.
   Everything is drawn from one clock, frame(t), so the same code plays live, jumps straight to the end
   on Skip, and can be stepped frame by frame for a recording. Sound is synthesised with Web Audio from
   the same timeline (original, no samples). Images are existing repo artwork; the card face is the
   deck's own The Fool. */
(function(){
  const W=390,H=844,DURATION=16;
  const stage=document.getElementById('gtoStage');
  const canvas=document.getElementById('gtoCanvas');
  const ctx=canvas.getContext('2d');
  const $=id=>document.getElementById(id);
  const hand=$('gtoHand'),card=$('gtoCard'),cardWrap=$('gtoCardWrap'),title=$('gtoTitle'),caption=$('gtoCaption'),cta=$('gtoEnd');
  const fool=(typeof cards!=='undefined'?cards:[]).find(c=>c.id===0);  // data.js declares `cards` with const
  if(fool){$('gtoCardName').textContent=`${fool.roman} · ${fool.name}`;$('gtoKeywords').textContent=fool.uprightKeywords.join(' · ');$('gtoFace').alt=fool.name;}

  // ---- helpers ------------------------------------------------------------------------------------
  const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
  const span=(t,a,b)=>clamp((t-a)/(b-a));                 // 0..1 progress of t through [a,b]
  const ease=x=>x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2;        // easeInOutCubic
  const out=x=>1-Math.pow(1-x,3);
  function rng(seed){let s=seed>>>0;return()=>((s=(s*1664525+1013904223)>>>0)/4294967296);}
  const reduce=()=>window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  // ---- layout (stage units: 390 × 844) -------------------------------------------------------------
  const CARD={x:120,y:132,w:150,h:258};                    // the card, centre top
  const HAND={x:-20,y:394,w:300,h:450};                    // final resting place of the hand image
  const TIP={x:HAND.x+835/1024*HAND.w,y:HAND.y+206/1536*HAND.h}; // index fingertip in the hand artwork
  const UNDER={y:556,x0:110,x1:280};                       // the thread's resting line under the title

  // The thread's path: fingertip → a curl → up to the card → round the card → down under the title.
  function buildPath(){
    const pts=[];
    const push=(x,y)=>pts.push([x,y]);
    // 1. a rising S-curl from the fingertip
    for(let i=0;i<=60;i++){const u=i/60,a=u*Math.PI*2.2;push(TIP.x-10*u+34*Math.sin(a)*(1-u*.4),TIP.y-u*120-26*Math.sin(a*.5)*(1-u));}
    // 2. sweep up to the card's lower-left corner
    const [sx,sy]=pts[pts.length-1];
    for(let i=1;i<=30;i++){const u=i/30;push(sx+(CARD.x-8-sx)*ease(u)-22*Math.sin(u*Math.PI),sy+(CARD.y+CARD.h+8-sy)*u);}
    // 3. round the card, clockwise from the bottom-left, a little outside its edge
    const m=8,L=CARD.x-m,T=CARD.y-m,R=CARD.x+CARD.w+m,B=CARD.y+CARD.h+m;
    const ring=[[L,B],[L,T],[R,T],[R,B],[(L+R)/2,B]];
    for(let k=0;k<ring.length-1;k++){const [x0,y0]=ring[k],[x1,y1]=ring[k+1];for(let i=1;i<=24;i++){const u=i/24;push(x0+(x1-x0)*u,y0+(y1-y0)*u);}}
    // 4. curl out to the left of the title (never across its words), down, and in under it
    const [cx,cy]=pts[pts.length-1];
    const bez=(p0,p1,p2,p3,u)=>{const v=1-u;return [v*v*v*p0[0]+3*v*v*u*p1[0]+3*v*u*u*p2[0]+u*u*u*p3[0],v*v*v*p0[1]+3*v*v*u*p1[1]+3*v*u*u*p2[1]+u*u*u*p3[1]];};
    for(let i=1;i<=36;i++)push(...bez([cx,cy],[70,cy+2],[18,cy+10],[26,470],i/36));
    for(let i=1;i<=24;i++)push(...bez([26,470],[32,530],[70,UNDER.y],[UNDER.x0,UNDER.y],i/24));
    for(let i=1;i<=40;i++){const u=i/40;push(UNDER.x0+(UNDER.x1-UNDER.x0)*u,UNDER.y+2*Math.sin(u*Math.PI*3));}
    // cumulative lengths so progress is by distance, not by point count
    const len=[0];for(let i=1;i<pts.length;i++)len.push(len[i-1]+Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]));
    return {pts,len,total:len[len.length-1],
      at(d){d=clamp(d,0,this.total);let i=this.len.findIndex(l=>l>=d);if(i<=0)return pts[0];const f=(d-len[i-1])/(len[i]-len[i-1]||1);return [pts[i-1][0]+(pts[i][0]-pts[i-1][0])*f,pts[i-1][1]+(pts[i][1]-pts[i-1][1])*f];}};
  }
  const PATH=buildPath();
  // How far along the path the thread has reached at time t (by distance). Stops at the card while it turns.
  const cardEnd=PATH.len[60+30+24*4];                        // end of the ring
  function reach(t){
    if(t<4)return 0;
    if(t<8.2)return cardEnd*ease(span(t,4,8.2));
    if(t<10.6)return cardEnd;
    return cardEnd+(PATH.total-cardEnd)*ease(span(t,10.6,12.4));
  }

  // ---- particles (deterministic, stepped with a fixed dt) -----------------------------------------
  let smoke=[],sparks=[],rand=rng(20261029),simT=0;
  const puff=document.createElement('canvas');
  (function(){puff.width=puff.height=128;const p=puff.getContext('2d');const g=p.createRadialGradient(64,64,0,64,64,64);
    g.addColorStop(0,'rgba(120,104,86,.55)');g.addColorStop(.5,'rgba(70,60,50,.22)');g.addColorStop(1,'rgba(0,0,0,0)');p.fillStyle=g;p.fillRect(0,0,128,128);})();
  function resetSim(){smoke=[];sparks=[];rand=rng(20261029);simT=0;}
  function step(t,dt){
    // smoke: rises from the bottom, thickest early, thins as the card turns
    const rate=t<9?18:t<13?8:4;
    for(let n=rate*dt*(1+rand()*.4);n>0;n--){if(rand()>n)break;smoke.push({x:40+rand()*310,y:H+30,r:50+rand()*70,vx:(rand()-.5)*10,vy:-(18+rand()*22),life:0,max:7+rand()*4,ph:rand()*6.3});}
    smoke.forEach(s=>{s.life+=dt;s.x+=(s.vx+8*Math.sin(s.life*.7+s.ph))*dt;s.y+=s.vy*dt;s.r+=6*dt;});
    smoke=smoke.filter(s=>s.life<s.max);
    // sparkles: from the thread's moving head, and a few drifting off the finished thread
    const head=reach(t);
    if(t>=4&&t<12.6){const [hx,hy]=PATH.at(head);for(let k=0;k<3;k++)sparks.push({x:hx,y:hy,vx:(rand()-.5)*60,vy:(rand()-.5)*60-10,life:0,max:.5+rand()*.7,s:1+rand()*2.2});}
    if(t>=12.4){const [px,py]=PATH.at(ringStart+rand()*(PATH.total-ringStart));if(rand()<.5)sparks.push({x:px,y:py,vx:(rand()-.5)*12,vy:-6-rand()*10,life:0,max:1+rand(),s:.8+rand()*1.6});}
    if(t>=3&&t<4.2){for(let k=0;k<2;k++){const a=rand()*6.3;sparks.push({x:TIP.x+Math.cos(a)*4,y:TIP.y+Math.sin(a)*4,vx:Math.cos(a)*30,vy:Math.sin(a)*30,life:0,max:.6,s:1.6});}}
    sparks.forEach(p=>{p.life+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=.96;p.vy*=.96;});
    sparks=sparks.filter(p=>p.life<p.max);
  }
  function advanceTo(t){const dt=1/60;while(simT+dt<=t){simT+=dt;step(simT,dt);}}

  // ---- drawing ------------------------------------------------------------------------------------
  let scale=1,dpr=1;
  function fit(){
    const vw=stage.clientWidth,vh=stage.clientHeight;scale=Math.min(vw/W,vh/H);dpr=Math.min(2,window.devicePixelRatio||1);
    canvas.width=Math.round(vw*dpr);canvas.height=Math.round(vh*dpr);
    const ox=(vw-W*scale)/2,oy=(vh-H*scale)/2;
    stage.style.setProperty('--s',scale);stage.style.setProperty('--ox',ox+'px');stage.style.setProperty('--oy',oy+'px');
    ctx.setTransform(dpr*scale,0,0,dpr*scale,dpr*ox,dpr*oy);
  }
  // Once the hand has gone, the strand that came from it draws back up into the card.
  const ringStart=PATH.len[60+30];
  const tail=t=>ringStart*ease(span(t,9.6,11.2));
  function drawThread(t){
    const d=reach(t);if(d<=0)return;
    const d0=tail(t);
    const shimmer=t>=12.4?.75+.25*Math.sin(t*3):1;
    ctx.save();ctx.lineCap='round';ctx.lineJoin='round';ctx.globalCompositeOperation='lighter';
    for(const [w,a,blur] of [[9,.10,18],[4,.35,10],[1.6,.95,4]]){
      ctx.beginPath();ctx.moveTo(...PATH.at(d0));
      for(let i=1;i<PATH.pts.length&&PATH.len[i]<=d;i++)if(PATH.len[i]>d0)ctx.lineTo(...PATH.pts[i]);
      ctx.lineTo(...PATH.at(d));
      ctx.strokeStyle=`rgba(232,196,120,${a*shimmer})`;ctx.lineWidth=w;ctx.shadowColor='rgba(255,210,130,.9)';ctx.shadowBlur=blur;ctx.stroke();
    }
    if(t<12.5){const [hx,hy]=PATH.at(d);const g=ctx.createRadialGradient(hx,hy,0,hx,hy,16);g.addColorStop(0,'rgba(255,240,200,.95)');g.addColorStop(1,'rgba(255,200,120,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(hx,hy,16,0,7);ctx.fill();}
    ctx.restore();
  }
  function draw(t){
    ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#050403';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.restore();
    // smoke behind everything
    ctx.save();const fade=span(t,0,1.6);
    smoke.forEach(s=>{const a=Math.min(1,s.life/1.2)*Math.min(1,(s.max-s.life)/2)*.55*fade;ctx.globalAlpha=a;ctx.drawImage(puff,s.x-s.r,s.y-s.r,s.r*2,s.r*2);});
    ctx.restore();
    // fingertip glow
    const glow=span(t,2.8,3.6)*(1-span(t,9.5,11));
    if(glow>0){ctx.save();ctx.globalCompositeOperation='lighter';const r=30+6*Math.sin(t*6);const g=ctx.createRadialGradient(TIP.x,TIP.y,0,TIP.x,TIP.y,r);g.addColorStop(0,`rgba(255,226,160,${.9*glow})`);g.addColorStop(1,'rgba(255,190,100,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(TIP.x,TIP.y,r,0,7);ctx.fill();ctx.restore();}
    drawThread(t);
    ctx.save();ctx.globalCompositeOperation='lighter';
    sparks.forEach(p=>{const a=Math.sin(Math.PI*p.life/p.max);ctx.fillStyle=`rgba(255,${210+Math.round(40*a)},150,${a})`;ctx.beginPath();ctx.arc(p.x,p.y,p.s*(.6+.4*a),0,7);ctx.fill();});
    ctx.restore();
  }
  // DOM layers follow the same clock.
  function place(t){
    const h=out(span(t,1.2,3.6)),hOut=span(t,9.6,11.4);
    hand.style.opacity=String(h*(1-hOut));
    hand.style.transform=`translateY(${(1-h)*60+hOut*90}px)`;
    const c=out(span(t,3.4,5));
    cardWrap.style.opacity=String(c);cardWrap.style.transform=`translateY(${(1-c)*16}px)`;
    const flip=ease(span(t,8.6,9.6));                    // 0 face down → 1 face up
    card.style.transform=`rotateY(${180-180*flip}deg) scale(${1+.06*Math.sin(Math.PI*flip)})`;
    card.classList.toggle('is-up',flip>.5);
    const ti=out(span(t,10.8,12.2));
    title.style.opacity=String(ti);title.style.transform=`translateY(${(1-ti)*12}px)`;
    const e=out(span(t,13.6,14.8));cta.style.opacity=String(e);cta.style.pointerEvents=e>.5?'auto':'none';
  }

  // ---- captions (sound and picture described, for sound off and for screen readers) -----------------
  const CAPTIONS=[[0,2.8,'[a low, warm hum]'],[2.8,4,'[a soft chime as the fingertip glows]'],[4,8.4,'[a golden thread shimmers and sparkles]'],[8.6,10,'[the card turns over]'],[10,13.6,'The Fool · a willingness to begin'],[13.6,99,'[a warm chord settles]']];
  function captionAt(t){const c=CAPTIONS.find(([a,b])=>t>=a&&t<b);return c?c[2]:'';}

  // ---- sound (Web Audio, synthesised; scheduled against any context, live or offline) ----------------
  function score(ac,dest,from=0){
    const T=s=>ac.currentTime+Math.max(0,s-from);
    const later=s=>s>=from;
    const master=ac.createGain();master.gain.value=.9;master.connect(dest);
    const noise=(()=>{const b=ac.createBuffer(1,ac.sampleRate*2,ac.sampleRate),d=b.getChannelData(0),r=rng(7);for(let i=0;i<d.length;i++)d[i]=r()*2-1;return b;})();
    const tone=(f,type,start,dur,peak,attack=.01)=>{const o=ac.createOscillator(),g=ac.createGain();o.type=type;o.frequency.value=f;g.gain.setValueAtTime(0,T(start));g.gain.linearRampToValueAtTime(peak,T(start)+attack);g.gain.exponentialRampToValueAtTime(.0001,T(start)+dur);o.connect(g).connect(master);o.start(T(start));o.stop(T(start)+dur+.05);};
    const bell=(f,start,peak=.12,dur=2.4)=>{[[1,1],[2.76,.45],[5.4,.2]].forEach(([m,a])=>tone(f*m,'sine',start,dur/m*1.6,peak*a,.005));};
    // 1. pad: a warm low hum through a soft filter, from the start to the end
    if(from<15.5){const lp=ac.createBiquadFilter();lp.type='lowpass';lp.frequency.value=700;const g=ac.createGain();lp.connect(g).connect(master);
      g.gain.setValueAtTime(from>0?.1:0,T(from));if(!from)g.gain.linearRampToValueAtTime(.1,T(2.6));g.gain.setValueAtTime(.1,T(Math.max(from,13.8)));g.gain.linearRampToValueAtTime(0,T(16));
      [[110,'triangle'],[164.8,'sine'],[220.5,'sine']].forEach(([f,type])=>{const o=ac.createOscillator();o.type=type;o.frequency.value=f;o.connect(lp);o.start(T(from));o.stop(T(16.1));});}
    // 2. a chime as the fingertip glows
    if(later(2.9))bell(880,2.9,.1);
    // 3. the thread: a filtered shimmer that rises with it, and tiny sparkle ticks
    if(from<8.4){const src=ac.createBufferSource();src.buffer=noise;src.loop=true;const bp=ac.createBiquadFilter();bp.type='bandpass';bp.Q.value=6;const g=ac.createGain();
      src.connect(bp).connect(g).connect(master);const a=Math.max(4,from);
      bp.frequency.setValueAtTime(2200+3800*span(a,4,8.2),T(a));bp.frequency.linearRampToValueAtTime(6000,T(8.2));
      g.gain.setValueAtTime(from>4?.05:0,T(a));if(from<=4)g.gain.linearRampToValueAtTime(.05,T(4.8));g.gain.setValueAtTime(.05,T(7.6));g.gain.linearRampToValueAtTime(0,T(8.4));
      src.start(T(a));src.stop(T(8.5));}
    const r=rng(11);for(let s=4;s<8.2;s+=.11+r()*.12){const f=3200+r()*3600,p=.012+r()*.02;if(later(s))tone(f,'sine',s,.09,p,.002);}
    // 4. the card turns: a swish, then it settles with a soft knock and a bell
    if(later(8.6)){const src=ac.createBufferSource();src.buffer=noise;const bp=ac.createBiquadFilter();bp.type='bandpass';bp.Q.value=1.2;const g=ac.createGain();src.connect(bp).connect(g).connect(master);
      bp.frequency.setValueAtTime(1800,T(8.6));bp.frequency.exponentialRampToValueAtTime(320,T(9.3));g.gain.setValueAtTime(0,T(8.6));g.gain.linearRampToValueAtTime(.16,T(8.75));g.gain.exponentialRampToValueAtTime(.001,T(9.35));src.start(T(8.6));src.stop(T(9.4));}
    if(later(9.55)){tone(92,'sine',9.55,.35,.22,.004);bell(660,9.6,.08,2);}
    // 5. a warm chord under the introduction
    if(later(11)) [220,277.2,329.6,440].forEach((f,i)=>tone(f,'sine',11+i*.06,4.6,.045,1.2));
  }
  let audio=null;
  function startSound(from){stopSound();if(muted)return;try{audio=new (window.AudioContext||window.webkitAudioContext)();score(audio,audio.destination,from);}catch(e){audio=null;}}
  function stopSound(){if(audio){try{audio.close();}catch(e){}audio=null;}}
  // For recordings: the same score rendered offline to PCM.
  async function renderSoundtrack(rate=44100){
    const ac=new OfflineAudioContext(1,Math.ceil(rate*DURATION),rate);score(ac,ac.destination,0);const buf=await ac.startRendering();return Array.from(buf.getChannelData(0));
  }

  // ---- playback -----------------------------------------------------------------------------------
  let raf=0,startAt=0,t=0,playing=false,muted=false,captionsOn=true;
  function render(at){t=at;advanceTo(at);draw(at);place(at);caption.textContent=captionsOn?captionAt(at):'';stage.dataset.t=at.toFixed(2);}
  function tick(now){if(!playing)return;const at=(now-startAt)/1000;if(at>=DURATION){finish();return;}render(at);raf=requestAnimationFrame(tick);}
  function play(){
    teardown();resetSim();fit();document.body.classList.add('is-playing');document.body.classList.remove('is-done','is-still');
    if(reduce()){still();return;}
    playing=true;startAt=performance.now();startSound(0);raf=requestAnimationFrame(tick);
  }
  function finish(){playing=false;cancelAnimationFrame(raf);render(DURATION-.001);document.body.classList.add('is-done');$('gtoReplay').hidden=false;}
  function skip(){teardown();resetSim();fit();advanceTo(DURATION-1.4);render(DURATION-.001);document.body.classList.add('is-done');$('gtoReplay').hidden=false;}
  // Reduced motion: no movement, the finished picture with the thread already in place.
  function still(){teardown();resetSim();fit();render(DURATION-.001);sparks=[];draw(DURATION-.001);document.body.classList.add('is-done','is-still');caption.textContent=captionsOn?'The Fool · a willingness to begin':'';$('gtoReplay').hidden=true;}
  function teardown(){playing=false;cancelAnimationFrame(raf);stopSound();}

  $('gtoStart').onclick=()=>{$('gtoIntro').hidden=true;play();};
  $('gtoSilent').onclick=()=>{muted=true;syncMute();$('gtoIntro').hidden=true;play();};
  $('gtoSkip').onclick=skip;
  $('gtoReplay').onclick=play;
  function syncMute(){$('gtoMute').textContent=muted?'🔊 Unmute':'🔇 Mute';$('gtoMute').setAttribute('aria-pressed',String(muted));}
  $('gtoMute').onclick=()=>{muted=!muted;syncMute();if(muted)stopSound();else if(playing)startSound(t);};
  $('gtoCaptions').onclick=()=>{captionsOn=!captionsOn;$('gtoCaptions').textContent=captionsOn?'Hide words':'Show words';caption.textContent=captionsOn?captionAt(t):'';};
  // Leaving the page or hiding the tab stops everything; nothing keeps running in the background.
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&playing){teardown();skip();}});
  window.addEventListener('pagehide',teardown);
  window.addEventListener('resize',()=>{fit();render(t);});
  fit();render(0);

  // Test and recording hooks.
  window.GTO={DURATION,render:at=>{resetSim();fit();render(at);},seek:at=>{fit();render(at);},captionAt,renderSoundtrack,reach,PATH,
    get state(){return {playing,muted,t,audio:!!audio,raf};},skip,play,still};
})();
