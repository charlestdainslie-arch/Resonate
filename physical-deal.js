// RESONATE v0.10.3 — physical deal/reveal choreography
// Visual layer only: the spread remains the source of truth and stays anchored.
(function(){
  const DEAL_MS=780;
  function motionReduced(){ return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; }
  function cardFor(index){ const id=state.drawnCardIds[index]; return cards.find(c=>c.id===id); }
  function dealOverlay(){
    let overlay=document.getElementById('resonateDealOverlay');
    if(overlay) return overlay;
    overlay=document.createElement('div');
    overlay.id='resonateDealOverlay'; overlay.className='physical-deal-layer'; overlay.setAttribute('aria-hidden','true');
    overlay.innerHTML='<div class="deal-hand"><i></i><i></i><i></i></div><div class="deal-deck"><b>R</b></div><div class="flying-card"><div class="flying-back"><b>R</b></div><img alt=""></div>';
    document.body.appendChild(overlay); return overlay;
  }
  function targetFor(index){ return document.querySelectorAll('.reading-position')[index] || document.querySelectorAll('[data-stage-card]')[index]; }
  function focusPosition(index){
    const target=targetFor(index); if(!target) return;
    document.querySelectorAll('.reading-position.is-reading-focus').forEach(el=>el.classList.remove('is-reading-focus'));
    target.classList.add('is-reading-focus');
    target.scrollIntoView({behavior:motionReduced()?'auto':'smooth',block:'center',inline:'center'});
  }
  function animateDeal(index,done){
    const target=targetFor(index), card=cardFor(index); if(!target||!card||motionReduced()){ focusPosition(index); done&&done(); return; }
    const overlay=dealOverlay(), flyer=overlay.querySelector('.flying-card'), img=flyer.querySelector('img');
    const rect=target.getBoundingClientRect();
    img.src=cardImage(card); img.alt=card.name; flyer.classList.remove('is-revealed');
    overlay.style.setProperty('--deal-x',`${rect.left+rect.width/2}px`); overlay.style.setProperty('--deal-y',`${rect.top+rect.height/2}px`);
    overlay.classList.remove('is-dealing'); void overlay.offsetWidth; overlay.classList.add('is-dealing');
    window.setTimeout(()=>flyer.classList.add('is-revealed'),Math.round(DEAL_MS*.48));
    window.setTimeout(()=>{ overlay.classList.remove('is-dealing'); focusPosition(index); done&&done(); },DEAL_MS);
  }
  function animateReadingSequence(){
    const total=state.drawnCardIds.length; if(!total) return;
    let index=0;
    const next=()=>{ if(index>=total) return; animateDeal(index++,()=>window.setTimeout(next,120)); };
    next();
  }
  window.resonateAnimateDeal=animateDeal;
  window.resonateAnimateReadingSequence=animateReadingSequence;
})();
