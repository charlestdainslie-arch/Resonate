// RESONATE 0.9.1 — dedicated reading stage
// Loaded after app.js so the approved UAT reading flow can be isolated on the release branch.

state.shuffledDeck = [];
state.shuffleCount = 0;

function prepareDeck(){
  const deck = cards.map(card => card.id);
  for(let i=deck.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [deck[i],deck[j]]=[deck[j],deck[i]];
  }
  state.shuffledDeck=deck;
  state.shuffleCount += 1;
}

function faceDownSlot(label,index){
  return `<div class="reading-position stage-position"><span class="slot-label">${index+1} · ${label||'Position'}</span><div class="stage-card" data-stage-card="${index}" aria-label="Face-down tarot card for ${label||'position'}"><div class="reading-card-back"><div class="back-mark">R</div><small>RESONATE</small></div></div></div>`;
}

renderReadingHub = function(){
  shell(`${backButton('Home','home')}<section class="section-hero reading-hero"><div class="eyebrow">TAROT READING</div><h1>Choose the shape of the question.</h1><p>Select a spread to enter the reading table. Your cards will be waiting face down.</p></section><section class="spread-picker">${Object.entries(spreads).map(([id,spread])=>`<button data-spread="${id}"><span>${spread.positions.length} CARD${spread.positions.length===1?'':'S'}</span><strong>${spread.name}</strong><small>${spread.description}</small></button>`).join('')}</section><div class="reading-note">Choose a spread to continue.</div>`, 'reading-page');
  bindBack();
  document.querySelectorAll('[data-spread]').forEach(button=>{
    button.onclick=()=>{
      state.spreadId=button.dataset.spread;
      state.spreadSize=currentSpread().positions.length;
      state.readingIndex=null;
      state.shuffledDeck=[];
      state.shuffleCount=0;
      state.view='stage';
      render();
      window.scrollTo({top:0,behavior:'smooth'});
    };
  });
};

function renderReadingStage(){
  const labels=positionLabels();
  shell(`${backButton('Back to spreads','reading')}<section class="reading-table"><div class="stage-heading"><div class="eyebrow">${icon('spark',15)} ${readingTitle()} · ${state.spreadSize} CARDS</div><h1>Hold your question.</h1><p id="shuffleStatus">Shuffle if it feels right, then draw when you are ready.</p></div>${sampleDeckNotice()}<div class="spread-scroll" role="region" aria-label="Card spread" tabindex="0"><div class="spread-board stage-board spread-${state.spreadSize} layout-${state.spreadId}">${labels.map(faceDownSlot).join('')}</div></div><div class="stage-actions"><button type="button" class="ghost-button shuffle-button" id="shuffleCardsBtn">Shuffle Cards</button><button type="button" class="draw-cta" id="stageDrawBtn">${icon('spark',16)} Draw Cards</button></div></section>`, 'draw-page reading-stage-page');
  bindBack();
  document.getElementById('shuffleCardsBtn').onclick=shuffleCards;
  document.getElementById('stageDrawBtn').onclick=startDraw;
}

function shuffleCards(){
  prepareDeck();
  const board=document.querySelector('.stage-board');
  const status=document.getElementById('shuffleStatus');
  const button=document.getElementById('shuffleCardsBtn');
  if(!board) return;
  button.disabled=true;
  board.classList.remove('is-shuffling');
  void board.offsetWidth;
  board.classList.add('is-shuffling');
  if(status) status.textContent='Shuffling the deck…';
  drawTimers.push(window.setTimeout(()=>{
    board.classList.remove('is-shuffling');
    button.disabled=false;
    if(status) status.textContent=`Deck shuffled${state.shuffleCount>1?` ${state.shuffleCount} times`:''}. Draw when you are ready.`;
  },900));
}

startDraw = function(){
  clearDrawTimers();
  state.spreadSize=currentSpread().positions.length;
  if(!state.shuffledDeck.length) prepareDeck();
  const previous=state.drawnCardIds.join(',');
  let next=state.shuffledDeck.slice(0,state.spreadSize);
  if(cards.length>state.spreadSize && next.join(',')===previous){
    prepareDeck();
    next=state.shuffledDeck.slice(0,state.spreadSize);
  }
  // Fill every test position from shuffled passes through the existing sample deck.
  while(next.length<state.spreadSize && cards.length){
    prepareDeck();
    next.push(...state.shuffledDeck.slice(0,state.spreadSize-next.length));
  }
  state.readingIndex=null;
  state.drawnCardIds=next;
  state.drawnAt=new Date().toISOString();
  state.view='draw';
  state.drawPhase='dealing';
  state.drawSettled=false;
  state.shuffledDeck=[];
  renderDraw();
  requestAnimationFrame(()=>window.scrollTo({top:0,behavior:'smooth'}));
};

const renderBase=render;
render = function(){
  if(state.view==='stage') renderReadingStage();
  else renderBase();
};

// Re-render once so the overridden reading flow is active immediately.
render();
