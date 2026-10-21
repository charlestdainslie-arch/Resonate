// Reading journals are separate from the existing card-study notes.
const journalKey='resonate-reading-journal-v1';
let journalEntries=readJSON(journalKey,[]);
if(!Array.isArray(journalEntries)) journalEntries=[];
state.journalId=null;
state.journalSpread=null;

function journalDate(value,zone){
  return new Intl.DateTimeFormat('en-AU',{weekday:'long',day:'numeric',month:'long',year:'numeric',hour:'numeric',minute:'2-digit',timeZoneName:'short',...(zone?{timeZone:zone}:{})}).format(new Date(value));
}
function activeJournal(){return journalEntries.find(entry=>entry.id===state.journalId)||journalEntries.find(entry=>entry.readingAt===state.drawnAt&&entry.spreadId===state.spreadId);}
function writeJournal(entry,status){
  const next=[entry,...journalEntries.filter(item=>item.id!==entry.id)];
  try{
    localStorage.setItem(journalKey,JSON.stringify(next));
    journalEntries=next;state.journalId=entry.id;
    if(status)status.textContent='✓ Reading saved to Your Personal Journal on this browser.';
    return true;
  }catch{
    if(status)status.textContent='Could not save in this browser. Keep this page open and copy your reflection before leaving.';
    return false;
  }
}
function readingEntry(){
  const existing=activeJournal();
  if(existing)return {...existing,cardReflections:{...existing.cardReflections}};
  return {id:crypto.randomUUID(),readingAt:state.drawnAt,savedAt:new Date().toISOString(),updatedAt:null,timeZone:Intl.DateTimeFormat().resolvedOptions().timeZone,spreadId:state.spreadId,spread:JSON.parse(JSON.stringify(currentSpread())),cardIds:[...state.drawnCardIds],reflection:'',cardReflections:{},clarifierLayers:[]};
}
function journalTime(entry){
  return `<p class="journal-time">Reading: <time datetime="${escapeHtml(entry.readingAt)}">${escapeHtml(journalDate(entry.readingAt,entry.timeZone))}</time></p>${entry.updatedAt?`<p class="journal-updated">Reflection updated: ${escapeHtml(journalDate(entry.updatedAt,entry.timeZone))}</p>`:''}`;
}
function captureClarifierLayers(){
  const layers=[];
  if(state.clarifierReadingAt===state.drawnAt&&state.firstLayerClarifiers?.length)layers.push({number:1,cards:[...state.firstLayerClarifiers]});
  if(state.additionalClarifierReadingAt===state.drawnAt)(state.additionalClarifierLayers||[]).forEach(layer=>layers.push({number:layer.number,cards:[...layer.cards]}));
  return layers;
}
function saveReadingReflection(text,status){
  const entry=readingEntry();
  entry.clarifierLayers=captureClarifierLayers();
  if(entry.reflection!==text){entry.reflection=text;entry.updatedAt=new Date().toISOString();}
  return writeJournal(entry,status);
}

const journalCurrentSpread=currentSpread;
currentSpread=function(){return state.journalSpread&&['draw','detail'].includes(state.view)?state.journalSpread:journalCurrentSpread();};
const journalStartDraw=startDraw;
startDraw=function(){state.journalId=null;state.journalSpread=null;journalStartDraw();};

const journalRenderDraw=renderDraw;
renderDraw=function(){
  journalRenderDraw();
  const entry=activeJournal();
  const timeEntry=entry||{readingAt:state.drawnAt,timeZone:Intl.DateTimeFormat().resolvedOptions().timeZone};
  document.getElementById('drawActions').insertAdjacentHTML('beforebegin',`<section class="reflection-card reading-journal"><div class="eyebrow">YOUR PERSONAL JOURNAL</div><h2>Keep this reading and what it brought up.</h2>${journalTime(timeEntry)}<label for="readingReflection">Your comments or reflections on this reading</label><textarea id="readingReflection" placeholder="What stands out? What would you like to return to?">${escapeHtml(entry?.reflection||'')}</textarea><div class="journal-actions"><button class="gold-button" id="saveReadingJournal">${entry?'Save reflection':'Save reading to journal'}</button><button class="ghost-button" id="openJournal">Your Personal Journal</button></div><p class="reflection-note" id="journalSaveStatus" role="status">${entry?'Reading saved. Reflections save as you write.':'Save this reading, or start writing to save it with your reflection.'}</p><p class="reflection-note">Stored on this browser only. Clearing browser data removes these entries.</p></section>`);
  const field=document.getElementById('readingReflection'),status=document.getElementById('journalSaveStatus');
  field.oninput=()=>saveReadingReflection(field.value,status);
  document.getElementById('saveReadingJournal').onclick=()=>{if(saveReadingReflection(field.value,status)){const button=document.getElementById('saveReadingJournal');button.textContent='✓ Saved to Journal';button.classList.remove('gold-button');button.classList.add('ghost-button');}};
  document.getElementById('openJournal').onclick=()=>go('saved');
};

const journalRenderDetail=renderDetail;
renderDetail=function(){
  journalRenderDetail();
  if(state.returnView!=='draw'||!Number.isInteger(state.readingIndex))return;
  const field=document.getElementById('noteField'),status=document.querySelector('.reflection-note');
  const entry=activeJournal(),note=entry?.cardReflections?.[state.readingIndex];
  field.value=note?.text||'';
  field.setAttribute('aria-label','Reflection on this card in this reading');
  field.insertAdjacentHTML('beforebegin',journalTime(entry||{readingAt:state.drawnAt})+`<p class="journal-updated">This reflection belongs to position ${state.readingIndex+1}: ${escapeHtml(positionLabels()[state.readingIndex])}.</p>`);
  status.textContent=note?'Saved with this reading in Your Personal Journal.':'Writing here saves this card reflection with its reading.';
  status.setAttribute('role','status');
  field.oninput=()=>{
    const next=readingEntry();const now=new Date().toISOString();
    next.cardReflections[state.readingIndex]={text:field.value,updatedAt:now};next.updatedAt=now;
    writeJournal(next,status);
  };
};

function openJournalReading(id){
  const entry=journalEntries.find(item=>item.id===id);if(!entry)return;
  clearDrawTimers();state.journalId=id;state.journalSpread=entry.spread;
  state.spreadId=entry.spreadId;state.spreadSize=entry.cardIds.length;
  state.drawnCardIds=[...entry.cardIds];state.drawnAt=entry.readingAt;
  const layers=entry.clarifierLayers||[];
  state.clarifierReadingAt=layers.some(l=>l.number===1)?entry.readingAt:null;
  state.firstLayerClarifiers=[...(layers.find(l=>l.number===1)?.cards||[])];
  state.additionalClarifierReadingAt=layers.some(l=>l.number>1)?entry.readingAt:null;
  state.additionalClarifierLayers=layers.filter(l=>l.number>1).map(l=>({number:l.number,cards:[...l.cards]}));
  state.readingIndex=null;state.drawSettled=true;state.drawPhase='settled';
  go('draw');
}
renderSaved=function(){
  const legacy=cards.filter(card=>state.bookmarks.includes(card.id)||state.notes[card.id]);
  const entries=[...journalEntries].sort((a,b)=>new Date(b.readingAt)-new Date(a.readingAt));
  shell(`${backButton('Home','home')}<section class="section-hero"><div class="eyebrow">YOUR PERSONAL JOURNAL</div><h1>Your readings & reflections.</h1><p>Return to the cards, the moment, and what it meant to you.</p><p>Stored on this browser only. Clearing browser data removes these entries.</p></section><figure class="journal-art-panel" aria-label="A black journal with gold celestial detailing"><img src="assets/landing-saved.jpg" alt="Black leather journal with a gold sun emblem beside a glowing celestial sphere" width="512" height="512"></figure><section class="journal-entries">${entries.length?entries.map(entry=>`<article class="reflection-card journal-entry"><h2>${escapeHtml(entry.spread.name)}</h2>${journalTime(entry)}<ol class="journal-card-list">${entry.cardIds.map((id,index)=>`<li><strong>${escapeHtml(entry.spread.positions[index][0])}</strong> — ${escapeHtml(cards.find(card=>card.id===id)?.name||'Card')} ${entry.cardReflections?.[index]?.text?`<p class="journal-reflection">${escapeHtml(entry.cardReflections[index].text)}</p><small>Reflection updated: ${escapeHtml(journalDate(entry.cardReflections[index].updatedAt,entry.timeZone))}</small>`:''}</li>`).join('')}</ol><p class="journal-reflection"><strong>How these cards connect:</strong> ${entry.cardIds.map((id,i)=>{const base=cards.find(card=>card.id===id);const clarifiers=(entry.clarifierLayers||[]).map(layer=>cards.find(card=>card.id===layer.cards[i])).filter(Boolean);return `${escapeHtml(entry.spread.positions[i]?.[0]||'Position')}: ${escapeHtml(base?.name||'Card')}${clarifiers.length?' with '+clarifiers.map(c=>escapeHtml(c.name)).join(', '):''}. ${escapeHtml((base?.uprightKeywords||[]).slice(0,2).join(' and '))}${clarifiers.length?' meets '+clarifiers.map(c=>escapeHtml((c.uprightKeywords||[]).slice(0,2).join(' and '))).join('; '):''}.`;}).join(' ')}</p><label for="journal-${entry.id}">Your comments or reflections on this reading</label><textarea id="journal-${entry.id}" data-journal-reflection="${entry.id}" placeholder="Add your reflection…">${escapeHtml(entry.reflection)}</textarea><div class="journal-reflection-actions"><button type="button" class="gold-button" data-save-journal-reflection="${entry.id}">Save Reflection</button><p class="reflection-note" role="status" id="status-${entry.id}">Your changes are not saved until you select Save Reflection.</p></div><button class="ghost-button" data-open-reading="${entry.id}">Back to reading ${icon('arrow',16)}</button></article>`).join(''):`<section class="empty"><h3>No saved readings yet</h3><p>Draw a reading and save it here with the date, time and your reflections.</p><button class="gold-button" data-go="reading">Get a Reading</button></section>`}</section>${legacy.length?`<section class="section-hero"><h2>Card bookmarks & earlier reflections</h2><p>Your existing card notes are kept here. They were not linked to a dated reading.</p></section><section class="card-grid">${legacy.map(cardTile).join('')}</section>`:''}`,'page-home');
  bindBack();
  document.querySelectorAll('[data-card]').forEach(button=>button.onclick=()=>openCard(Number(button.dataset.card),'saved'));
  document.querySelectorAll('[data-open-reading]').forEach(button=>button.onclick=()=>openJournalReading(button.dataset.openReading));
  document.querySelectorAll('[data-save-journal-reflection]').forEach(button=>button.onclick=()=>{
    const id=button.dataset.saveJournalReflection;
    const field=document.getElementById('journal-'+id);
    const old=journalEntries.find(entry=>entry.id===id);
    const status=document.getElementById('status-'+id);
    if(!old||!field)return;
    const success=writeJournal({...old,reflection:field.value,updatedAt:new Date().toISOString()},status);
    if(success){button.textContent='✓ Reflection Saved';button.classList.replace('gold-button','ghost-button');}
  });
  document.querySelectorAll('[data-journal-reflection]').forEach(field=>field.oninput=()=>{
    const id=field.dataset.journalReflection;
    const button=document.querySelector('[data-save-journal-reflection="'+id+'"]');
    const status=document.getElementById('status-'+id);
    if(button){button.textContent='Save Reflection';button.classList.replace('ghost-button','gold-button');}
    if(status)status.textContent='Unsaved changes — select Save Reflection.';
  });
};
render();
