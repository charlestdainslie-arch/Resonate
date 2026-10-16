// RESONATE 0.10.4 — shared reading ritual stage
// Every spread follows the same physical flow: choose → shuffle → draw → physical deal.

state.shuffledDeck = [];
state.shuffleCount = 0;
state.shuffleReady = false;
state.shuffleInProgress = false;

function prepareDeck(){
  const deck=cards.map(card=>card.id);
  for(let i=deck.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [deck[i],deck[j]]=[deck[j],deck[i]]; }
  state.shuffledDeck=deck; state.shuffleCount+=1;
}
function faceDownSlot(label,index){ return `<div class="reading-position stage-position"><span class="slot-label">${index+1} · ${label||'Position'}</span><div class="stage-card" data-stage-card="${index}" aria-label="Face-down tarot card for ${label||'position'}"><div class="reading-card-back"><div class="back-mark">R</div><small>RESONATE</small></div></div></div>`; }
function shuffleRitual(){ return `<div class="shuffle-ritual" id="shuffleRitual" aria-hidden="true"><div class="ritual-hand ritual-hand-left"><span></span><span></span><span></span></div><div class="ritual-deck"><div class="ritual-half half-left"><span class="riffle-card riffle-one"></span><span class="riffle-card riffle-two"></span><span class="riffle-card riffle-three"></span><b>R</b></div><div class="ritual-half half-right"><span class="riffle-card riffle-one"></span><span class="riffle-card riffle-two"></span><span class="riffle-card riffle-three"></span><b>R</b></div></div><div class="ritual-hand ritual-hand-right"><span></span><span></span><span></span></div></div>`; }
renderReadingHub=function(){
  shell(`${backButton('Home','home')}<section class="section-hero reading-hero"><div class="eyebrow">TAROT READING</div><h1>Choose the shape of the question.</h1><p>Select a spread to enter the reading table. Your cards will be waiting face down.</p></section><section class="spread-picker">${Object.entries(spreads).map(([id,spread])=>`<button data-spread="${id}"><span>${spread.positions.length} CARD${spread.positions.length===1?'':'S'}</span><strong>${spread.name}</strong><small>${spread.description}</small></button>`).join('')}</section><div class="reading-note">Every reading begins with the shuffle.</div>`,'reading-page'); bindBack();
  document.querySelectorAll('[data-spread]').forEach(button=>{ button.onclick=()=>{ state.spreadId=button.dataset.spread; state.spreadSize=currentSpread().positions.length; state.readingIndex=null; state.shuffledDeck=[]; state.shuffleCount=0; state.shuffleReady=false; state.shuffleInProgress=false; state.view='stage'; render(); window.scrollTo({top:0,behavior:'smooth'}); }; });
};
function renderReadingStage(){
  const labels=positionLabels();
  shell(`${backButton('Back to spreads','reading')}<section class="reading-table ritual-table"><div class="stage-heading"><div class="eyebrow">${icon('spark',15)} ${readingTitle()} · ${state.spreadSize} CARDS</div><h1>Hold your question.</h1><p id="shuffleStatus" aria-live="polite">Begin by shuffling the deck.</p></div>${sampleDeckNotice()}${shuffleRitual()}<div class="spread-scroll" role="region" aria-label="Card spread" tabindex="0"><div class="spread-board stage-board spread-${state.spreadSize} layout-${state.spreadId}">${labels.map(faceDownSlot).join('')}</div></div><div class="stage-actions ritual-actions"><button type="button" class="shuffle-button ritual-primary" id="shuffleCardsBtn">Shuffle Cards</button><button type="button" class="draw-cta ritual-draw" id="stageDrawBtn" disabled aria-disabled="true">${icon('spark',16)} Draw Cards</button></div><p class="ritual-hint">Shuffle first. Draw unlocks when the deck is squared and ready.</p></section>`,'draw-page reading-stage-page'); bindBack(); document.getElementById('shuffleCardsBtn').onclick=shuffleCards; document.getElementById('stageDrawBtn').onclick=startDraw;
}
function setDrawReady(ready){ state.shuffleReady=ready; const draw=document.getElementById('stageDrawBtn'), shuffle=document.getElementById('shuffleCardsBtn'); if(draw){draw.disabled=!ready;draw.setAttribute('aria-disabled',String(!ready));} if(shuffle) shuffle.classList.toggle('is-secondary',ready); }
function shuffleCards(){
  if(state.shuffleInProgress || state.view!=='stage') return;
  state.shuffleInProgress=true; setDrawReady(false); prepareDeck();
  const board=document.querySelector('.stage-board'), ritual=document.getElementById('shuffleRitual'), status=document.getElementById('shuffleStatus'), button=document.getElementById('shuffleCardsBtn');
  const reducedMotion=window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(button) button.disabled=true;
  if(board){board.classList.remove('is-shuffling');void board.offsetWidth;board.classList.add('is-shuffling');}
  if(ritual){ritual.classList.remove('is-ready','is-active');void ritual.offsetWidth;ritual.classList.add('is-active');}
  if(status) status.textContent='Cutting the deck…';
  const updateStatus=(message)=>{ if(state.view==='stage' && state.shuffleInProgress && status) status.textContent=message; };
  if(!reducedMotion){
    drawTimers.push(window.setTimeout(()=>updateStatus('Interleaving the cards…'),900));
    drawTimers.push(window.setTimeout(()=>updateStatus('Squaring the deck…'),2050));
  }
  drawTimers.push(window.setTimeout(()=>{
    if(state.view!=='stage') return;
    if(board) board.classList.remove('is-shuffling');
    if(ritual){ritual.classList.remove('is-active');ritual.classList.add('is-ready');}
    if(button){button.disabled=false;button.textContent='Shuffle Again';}
    state.shuffleInProgress=false; setDrawReady(true);
    if(status) status.textContent=`The deck is ready${state.shuffleCount>1?` · shuffle ${state.shuffleCount}`:''}. Draw when you are ready.`;
  },reducedMotion?260:3000));
}

startDraw=function(){
  if(!state.shuffleReady || state.shuffleInProgress || !state.shuffledDeck.length) return;
  clearDrawTimers(); state.spreadSize=currentSpread().positions.length; const previous=state.drawnCardIds.join(','); let next=state.shuffledDeck.slice(0,state.spreadSize);
  if(cards.length>state.spreadSize && next.join(',')===previous) next=[...state.shuffledDeck.slice(1),state.shuffledDeck[0]].slice(0,state.spreadSize);
  while(next.length<state.spreadSize && cards.length){ const remaining=cards.map(c=>c.id).filter(id=>!next.includes(id)); next.push(...remaining.slice(0,state.spreadSize-next.length)); }
  state.readingIndex=null; state.drawnCardIds=next; state.drawnAt=new Date().toISOString(); state.view='draw'; state.drawPhase='dealing'; state.drawSettled=false; state.shuffleReady=false; state.shuffledDeck=[];
  renderDraw(); requestAnimationFrame(()=>{ window.scrollTo({top:0,behavior:'smooth'}); window.setTimeout(()=>{ if(window.resonateAnimateReadingSequence) window.resonateAnimateReadingSequence(); },260); });
};
const renderBase=render; render=function(){ if(state.view==='stage') renderReadingStage(); else renderBase(); }; render();
