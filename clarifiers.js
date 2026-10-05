// RESONATE — Major Arcana clarifier engine
// Clarifiers are supporting overlays, never additional spread positions.

state.clarifiers = [];
state.orientations = [];

function isMajorArcana(card){
  if(!card) return false;
  // Current proof-of-concept deck is Major Arcana only. This also supports the
  // full deck when arcana/type metadata is added.
  if(card.arcana) return String(card.arcana).toLowerCase().includes('major');
  if(card.type) return String(card.type).toLowerCase().includes('major');
  return Number.isInteger(card.id) && card.id >= 0 && card.id <= 21;
}

function randomOrientation(){
  return Math.random() < 0.5 ? 'upright' : 'reversed';
}

function unusedDeckIds(excludedIds){
  const excluded=new Set(excludedIds);
  return cards.map(card=>card.id).filter(id=>!excluded.has(id));
}

function shuffleIds(ids){
  const result=[...ids];
  for(let i=result.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [result[i],result[j]]=[result[j],result[i]];
  }
  return result;
}

function buildMajorClarifiers(){
  const spreadIds=[...state.drawnCardIds];
  const used=new Set(spreadIds);
  const majors=spreadIds
    .map((id,index)=>({card:cards.find(card=>card.id===id),index}))
    .filter(item=>isMajorArcana(item.card));

  const available=shuffleIds(unusedDeckIds(spreadIds));
  state.clarifiers=[];

  majors.forEach(major=>{
    const clarifierId=available.shift();
    if(clarifierId===undefined) return;
    used.add(clarifierId);
    state.clarifiers.push({
      majorIndex:major.index,
      majorId:major.card.id,
      cardId:clarifierId,
      orientation:randomOrientation()
    });
  });
  return state.clarifiers;
}

function clarifierForPosition(index){
  return (state.clarifiers||[]).find(item=>item.majorIndex===index) || null;
}

function renderClarifierOverlay(index){
  const link=clarifierForPosition(index);
  if(!link) return '';
  const major=cards.find(card=>card.id===link.majorId);
  const clarifier=cards.find(card=>card.id===link.cardId);
  if(!major||!clarifier) return '';
  const reversed=link.orientation==='reversed';
  return `<aside class="clarifier-overlay" data-major-index="${index}" aria-label="Clarifier for ${escapeHtml(major.name)}">
    <div class="clarifier-heading"><span>CLARIFIER</span><strong>${escapeHtml(major.name)} + ${escapeHtml(clarifier.name)}</strong></div>
    <div class="clarifier-card-frame ${reversed?'is-reversed':''}">
      <img src="${cardImage(clarifier)}" alt="${escapeHtml(clarifier.name)}${reversed?' reversed':''}" referrerpolicy="no-referrer" onerror="imageFallback(this)">
    </div>
    <p>${escapeHtml(clarifier.name)}${reversed?' reversed':''} supports and modifies ${escapeHtml(major.name)} in this position; it is not an extra spread position.</p>
  </aside>`;
}

function clarifierText(index){
  const link=clarifierForPosition(index);
  if(!link) return '';
  const major=cards.find(card=>card.id===link.majorId);
  const clarifier=cards.find(card=>card.id===link.cardId);
  if(!major||!clarifier) return '';
  const reversed=link.orientation==='reversed';
  const meaning=reversed?clarifier.reversed:clarifier.upright;
  return `Clarifier for ${major.name}: ${clarifier.name}${reversed?' reversed':''}. ${meaning}`;
}

// Hook the established draw flow without changing spread size or positions.
const resonateStartDrawWithClarifiers=startDraw;
startDraw=function(){
  resonateStartDrawWithClarifiers();
  state.orientations=state.drawnCardIds.map(()=>randomOrientation());
  buildMajorClarifiers();
};
