// RESONATE — Major Arcana clarifier engine
// Clarifiers are supporting overlays, never additional spread positions.

state.clarifiers = [];
state.orientations = [];

function isMajorArcana(card){
  if(!card) return false;
  if(card.arcana) return String(card.arcana).toLowerCase().includes('major');
  if(card.type) return String(card.type).toLowerCase().includes('major');
  return Number.isInteger(card.id) && card.id >= 0 && card.id <= 21;
}
function randomOrientation(){ return Math.random()<0.5?'upright':'reversed'; }
function shuffleIds(ids){ const a=[...ids]; for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; }
function buildMajorClarifiers(){
  const spreadIds=[...state.drawnCardIds];
  const majors=spreadIds.map((id,index)=>({card:cards.find(c=>c.id===id),index})).filter(x=>isMajorArcana(x.card));
  const available=shuffleIds(cards.map(c=>c.id).filter(id=>!spreadIds.includes(id)));
  state.clarifiers=[];
  majors.forEach(major=>{
    const cardId=available.shift();
    if(cardId===undefined) return;
    state.clarifiers.push({majorIndex:major.index,majorId:major.card.id,cardId,orientation:randomOrientation()});
  });
  return state.clarifiers;
}
function clarifierForPosition(index){ return (state.clarifiers||[]).find(x=>x.majorIndex===index)||null; }
function renderClarifierOverlay(index){
  const link=clarifierForPosition(index); if(!link) return '';
  const major=cards.find(c=>c.id===link.majorId), clarifier=cards.find(c=>c.id===link.cardId); if(!major||!clarifier) return '';
  const reversed=link.orientation==='reversed';
  return `<aside class="clarifier-overlay" aria-label="Clarifier for ${escapeHtml(major.name)}"><div class="clarifier-heading"><span>CLARIFIER · SUPPORTING CARD</span><strong>${escapeHtml(major.name)} + ${escapeHtml(clarifier.name)}</strong></div><div class="clarifier-card-frame ${reversed?'is-reversed':''}"><img src="${cardImage(clarifier)}" alt="${escapeHtml(clarifier.name)}${reversed?' reversed':''}" referrerpolicy="no-referrer" onerror="imageFallback(this)"></div><p>${escapeHtml(clarifier.name)}${reversed?' reversed':''} modifies ${escapeHtml(major.name)} here. It remains attached to this Major and does not become another spread position.</p></aside>`;
}
function clarifierText(index){
  const link=clarifierForPosition(index); if(!link) return '';
  const major=cards.find(c=>c.id===link.majorId), clarifier=cards.find(c=>c.id===link.cardId); if(!major||!clarifier) return '';
  const reversed=link.orientation==='reversed';
  return `Clarifier for ${major.name}: ${clarifier.name}${reversed?' reversed':''}. ${reversed?clarifier.reversed:clarifier.upright}`;
}
function injectClarifiers(){
  document.querySelectorAll('.reading-position').forEach((position,index)=>{
    const html=renderClarifierOverlay(index);
    if(html) position.insertAdjacentHTML('beforeend',html);
  });
}
const resonateRenderDraw=renderDraw;
renderDraw=function(){
  resonateRenderDraw();
  injectClarifiers();
};
const resonateStartDrawWithClarifiers=startDraw;
startDraw=function(){
  // Build the spread first, then create one unique clarifier per Major.
  resonateStartDrawWithClarifiers();
  state.orientations=state.drawnCardIds.map(()=>randomOrientation());
  buildMajorClarifiers();
  // The original draw rendered before clarifiers existed, so render once more
  // with overlays attached to their Major positions.
  if(state.view==='draw') renderDraw();
};
