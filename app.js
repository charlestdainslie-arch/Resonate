const app = document.getElementById('app');
const state = {
  view: 'home', cardId: null, query: '', element: 'All', orientation: 'upright',
  bookmarks: readJSON('resonate-bookmarks', []), notes: readJSON('resonate-notes', {}),
  drawnCardIds: [], spreadSize: 1, drawPhase: 'idle', menuOpen: false,
  returnView: 'learn'
};
const elements = ['All','Air','Water','Earth','Fire'];
const spreadLabels = {
  1: ['Present'],
  3: ['Past','Present','Future'],
  7: ['Foundation','Past influence','Present','Hidden influence','Challenge','Guidance','Likely direction']
};

function readJSON(key, fallback) { try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); } catch { return fallback; } }
function save() { localStorage.setItem('resonate-bookmarks', JSON.stringify(state.bookmarks)); localStorage.setItem('resonate-notes', JSON.stringify(state.notes)); }
function icon(name, size=18) {
  const attrs = `width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"`;
  if (name==='search') return `<svg ${attrs}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>`;
  if (name==='bookmark') return `<svg ${attrs}><path d="M6 4.8A1.8 1.8 0 0 1 7.8 3h8.4A1.8 1.8 0 0 1 18 4.8V21l-6-3.8L6 21Z"/></svg>`;
  if (name==='back') return `<svg ${attrs}><path d="M19 12H5"/><path d="m11 18-6-6 6-6"/></svg>`;
  if (name==='arrow') return `<svg ${attrs}><path d="M5 12h14"/><path d="m14 7 5 5-5 5"/></svg>`;
  if (name==='menu') return `<svg ${attrs}><path d="M4 7h16M4 12h16M4 17h16"/></svg>`;
  if (name==='close') return `<svg ${attrs}><path d="m6 6 12 12M18 6 6 18"/></svg>`;
  if (name==='download') return `<svg ${attrs}><path d="M12 3v12m0 0 4-4m-4 4-4-4M5 20h14"/></svg>`;
  return `<svg ${attrs}><path d="m12 3 1.1 4.4L17 9l-3.9 1.6L12 15l-1.1-4.4L7 9l3.9-1.6Z"/><path d="m18.5 14 .6 2.4 2.4.6-2.4.6-.6 2.4-.6-2.4-2.4-.6 2.4-.6Z"/></svg>`;
}
function escapeHtml(v='') { return String(v).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
function cardImage(card) { return `https://commons.wikimedia.org/wiki/Special:Redirect/file/RWS_Tarot_${String(card.id).padStart(2,'0')}_${card.name.replace(/^The /,'').replaceAll(' ','_')}.jpg`; }
function handGraphic() { return `<div class="hand-hero" aria-hidden="true"><svg viewBox="0 0 210 170"><rect x="77" y="12" width="70" height="108" rx="8"/><path d="M32 140c18-21 26-36 32-55 5-16 13-28 20-27 8 1 7 10 4 22l-3 14M85 94c11-31 15-49 24-48 8 1 6 13 2 29l-5 22M106 97c8-28 13-43 21-41 8 2 4 18 0 34l-2 13M126 103c7-21 12-32 19-28 7 4 1 19-4 31-7 18-7 29-5 43"/><path d="M32 140c22 14 43 18 66 17 18-1 29-5 38-8"/></svg></div>`; }
function brandHeader() { return `<header class="brand-header"><button class="menu-button" id="menuBtn" aria-label="Main menu">${icon('menu',20)}</button><div class="brand-mark">R</div><div><div class="brand-name">RESONATE</div><div class="brand-sub">TAROT EXPLORER</div></div><div class="brand-orbit"><span></span></div></header>`; }
function menuOverlay() { return `<div class="menu-overlay ${state.menuOpen?'open':''}" id="menuOverlay" aria-hidden="${state.menuOpen?'false':'true'}"><div class="menu-panel"><div class="menu-head"><div><span>RESONATE</span><small>Main Menu</small></div><button id="closeMenu" aria-label="Close menu">${icon('close',22)}</button></div><nav><button data-go="home"><strong>Home</strong><span>Start here</span></button><button data-go="reading"><strong>Tarot Reading</strong><span>Draw 1, 3 or 7 cards</span></button><button data-go="learn"><strong>Learn the Cards</strong><span>Explore meanings and symbolism</span></button><button data-go="saved"><strong>Saved</strong><span>Bookmarks and reflections</span></button></nav><p>Every path has a clear way home.</p></div></div>`; }
function shell(content, cls='') { app.innerHTML = `<div class="ambient ambient-a"></div><div class="ambient ambient-b"></div><div class="page ${cls}">${brandHeader()}${content}</div>${menuOverlay()}`; bindGlobal(); }
function bindGlobal() {
  const menuBtn=document.getElementById('menuBtn'); if(menuBtn) menuBtn.onclick=()=>{state.menuOpen=true; document.getElementById('menuOverlay').classList.add('open');document.getElementById('menuOverlay').setAttribute('aria-hidden','false');};
  const close=document.getElementById('closeMenu'); if(close) close.onclick=closeMenu;
  document.querySelectorAll('[data-go]').forEach(btn=>btn.onclick=()=>{closeMenu(); go(btn.dataset.go);});
  const overlay=document.getElementById('menuOverlay'); if(overlay) overlay.onclick=e=>{if(e.target===overlay) closeMenu();};
}
function closeMenu(){ state.menuOpen=false; const el=document.getElementById('menuOverlay'); if(el){el.classList.remove('open');el.setAttribute('aria-hidden','true');} }
function go(view){ state.view=view; state.orientation='upright'; render(); window.scrollTo({top:0,behavior:'smooth'}); }
function backButton(label='Back', target='home'){ return `<button class="back-link" data-back="${target}">${icon('back',16)} ${label}</button>`; }
function bindBack(){ document.querySelectorAll('[data-back]').forEach(b=>b.onclick=()=>go(b.dataset.back)); }

function renderHome() {
  shell(`<section class="intro home-intro">${handGraphic()}<div class="eyebrow">${icon('spark',15)} MAJOR ARCANA · 0–IV</div><h1>Read the symbol.<br>Hear what resonates.</h1><p>Learn the cards, draw a reading, then follow the meaning deeper. No dead ends.</p><div class="home-actions"><button class="draw-cta" data-go="reading">${icon('spark',16)} Tarot Reading</button><button class="ghost-button" data-go="learn">Learn the Cards ${icon('arrow',16)}</button></div></section><section class="home-paths"><button data-go="reading"><span>01</span><strong>Tarot Reading</strong><small>Choose a spread and draw</small></button><button data-go="learn"><span>02</span><strong>Learn the Cards</strong><small>Study meanings, symbols and connections</small></button><button data-go="saved"><span>03</span><strong>Saved</strong><small>Return to bookmarks and reflections</small></button></section><footer class="home-footer">RESONATE · a deeper way into the cards</footer>`, 'page-home');
}

function getFiltered() {
  const q = state.query.trim().toLowerCase();
  return cards.filter(card => {
    const elementMatch = state.element === 'All' || card.element === state.element;
    const haystack = [card.name,card.roman,card.element,card.astrology,card.subtitle,card.upright,card.reversed,card.psychological,...card.uprightKeywords,...card.reversedKeywords].join(' ').toLowerCase();
    return elementMatch && (!q || haystack.includes(q));
  });
}
function renderLearn() {
  const visible=getFiltered();
  shell(`${backButton('Home','home')}<section class="section-hero"><div class="eyebrow">LEARN THE CARDS</div><h1>Learn the cards before memorising them.</h1><p>Start with image, traditional meaning and symbolism. The Jungian interpretation closes each card as the deeper golden thread.</p></section><section class="search-panel"><label class="search-box">${icon('search')}<input id="searchInput" value="${escapeHtml(state.query)}" placeholder="Search cards, elements, astrology…"><button id="clearSearch" aria-label="Clear search">${state.query ? '×' : ''}</button></label><div class="chips">${elements.map(x=>`<button class="chip ${state.element===x?'active':''}" data-element="${x}">${x}</button>`).join('')}</div></section><div class="section-label"><span>Major Arcana Deck</span><small>${visible.length} card${visible.length===1?'':'s'}</small></div>${visible.length?`<section class="card-grid">${visible.map(cardTile).join('')}</section>`:`<section class="empty"><h3>No cards found</h3><button class="gold-button" id="resetFilters">Reset filters</button></section>`}`, 'page-home');
  bindBack();
  document.getElementById('searchInput').oninput=e=>{state.query=e.target.value;renderLearn();const el=document.getElementById('searchInput');el.focus();el.setSelectionRange(el.value.length,el.value.length);};
  document.getElementById('clearSearch').onclick=()=>{state.query='';renderLearn();};
  document.querySelectorAll('[data-element]').forEach(btn=>btn.onclick=()=>{state.element=btn.dataset.element;renderLearn();});
  document.querySelectorAll('[data-card]').forEach(btn=>btn.onclick=()=>openCard(Number(btn.dataset.card),'learn'));
  const reset=document.getElementById('resetFilters'); if(reset) reset.onclick=()=>{state.query='';state.element='All';renderLearn();};
}
function cardTile(card) { return `<button class="tarot-card element-${card.element.toLowerCase()}" data-card="${card.id}"><div class="card-image-wrap"><img src="${cardImage(card)}" alt="${card.name}" loading="lazy" referrerpolicy="no-referrer"></div><div class="card-top"><div class="roman-badge">${card.roman}</div><div class="element-pill">${card.element}</div></div><div class="tile-body"><h2>${card.roman} · ${card.name}</h2><p class="subtitle">${card.subtitle}</p><div class="keyword-row">${card.uprightKeywords.slice(0,2).map(k=>`<span>${k}</span>`).join('')}</div></div><div class="tile-foot"><span>${icon('spark',14)} ${card.astrology}</span>${icon('arrow',17)}</div></button>`; }
function openCard(id, returnView='learn'){state.view='detail';state.cardId=id;state.returnView=returnView;state.orientation='upright';renderDetail();window.scrollTo(0,0);}

function renderReadingHub(){
  shell(`${backButton('Home','home')}<section class="section-hero reading-hero"><div class="eyebrow">TAROT READING</div><h1>Choose the shape of the question.</h1><p>The cards stay face down until you draw. Then each card comes forward, turns, and settles into its place.</p></section><section class="spread-picker"><button data-spread="1"><span>1 CARD</span><strong>Present</strong><small>A clear single focus</small></button><button data-spread="3"><span>3 CARDS</span><strong>Past · Present · Future</strong><small>A simple line through time</small></button><button data-spread="7"><span>7 CARDS</span><strong>V Reading</strong><small>A fuller RESONATE reading</small></button></section><div class="reading-note">Choose a spread, hold your question, then press <strong>Draw Cards</strong>.</div><button class="draw-cta reading-draw" id="drawCardsBtn">${icon('spark',16)} Draw Cards</button>`, 'reading-page');
  bindBack();
  state.spreadSize=[1,3,7].includes(state.spreadSize)?state.spreadSize:1;
  document.querySelectorAll('[data-spread]').forEach(b=>{if(Number(b.dataset.spread)===state.spreadSize)b.classList.add('active');b.onclick=()=>{state.spreadSize=Number(b.dataset.spread);renderReadingHub();};});
  document.getElementById('drawCardsBtn').onclick=startDraw;
}
function pickUnique(n){ return [...cards].sort(()=>Math.random()-.5).slice(0,Math.min(n,cards.length)).concat(n>cards.length?[...cards].sort(()=>Math.random()-.5).slice(0,n-cards.length):[]).map(c=>c.id); }
function startDraw(){ state.drawnCardIds=pickUnique(state.spreadSize);state.view='draw';state.drawPhase='dealing';renderDraw(); }
function renderDraw(){
  const labels=spreadLabels[state.spreadSize]||spreadLabels[1];
  const chosen=state.drawnCardIds.map(id=>cards.find(c=>c.id===id)).filter(Boolean);
  shell(`<section class="draw-stage multi"><div class="eyebrow">${icon('spark',15)} ${state.spreadSize}-CARD READING</div><h1>Let the cards come to you.</h1><p class="draw-instruction" id="drawStatus">Drawing your cards…</p><div class="spread-board spread-${state.spreadSize}">${chosen.map((card,i)=>`<div class="reading-position"><span class="slot-label">${i+1} · ${labels[i]||'Position'}</span><button class="reading-card is-facedown" data-reading-card="${card.id}" data-index="${i}" aria-label="Card ${i+1}"><div class="reading-card-inner"><div class="reading-card-back"><div class="back-mark">R</div><small>RESONATE</small></div><div class="reading-card-front"><img src="${cardImage(card)}" alt="${card.name}" referrerpolicy="no-referrer"><strong>${card.name}</strong></div></div></button></div>`).join('')}</div><div class="draw-actions" id="drawActions"><button class="ghost-button" data-go="reading">${icon('back',16)} Change spread</button><button class="gold-button" id="drawAgain">${icon('spark',15)} Draw again</button><button class="ghost-button" id="downloadReading">${icon('download',16)} Download reading</button></div><p class="reading-help">Tap any revealed card for its full meaning, then return to this reading.</p></section>`, 'draw-page');
  const cardsEls=[...document.querySelectorAll('.reading-card')]; const reduced=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  cardsEls.forEach((el,i)=>setTimeout(()=>{el.classList.remove('is-facedown');el.classList.add('revealed'); if(i===cardsEls.length-1)document.getElementById('drawStatus').textContent='Your spread is ready. Tap a card to go deeper.';}, reduced?0:420+i*430));
  cardsEls.forEach(el=>el.onclick=()=>openCard(Number(el.dataset.readingCard),'draw'));
  document.getElementById('drawAgain').onclick=startDraw;
  document.getElementById('downloadReading').onclick=downloadReading;
}
function downloadReading(){
  const labels=spreadLabels[state.spreadSize]||[];
  const lines=['RESONATE Tarot Reading','',...state.drawnCardIds.map((id,i)=>{const c=cards.find(x=>x.id===id);return `${i+1}. ${labels[i]||'Position'} — ${c.name}\n   ${c.upright}`;}),'','For reflection only.'];
  const blob=new Blob([lines.join('\n')],{type:'text/plain'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob);a.download='resonate-tarot-reading.txt';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500);
}

function infoCard(label,title,body) { return `<section class="info-card"><div class="eyebrow">${label}</div><h2>${title}</h2>${body}</section>`; }
function renderDetail() {
  const card=cards.find(c=>c.id===state.cardId)||cards[0]; const upright=state.orientation==='upright'; const keywords=upright?card.uprightKeywords:card.reversedKeywords; const meaning=upright?card.upright:card.reversed; const bookmarked=state.bookmarks.includes(card.id);
  shell(`<div class="detail-topbar"><button class="icon-button" id="backBtn">${icon('back')}</button><div class="detail-brand">RESONATE <span>·</span> ${card.roman}</div><button class="icon-button ${bookmarked?'bookmarked':''}" id="bookmarkBtn">${icon('bookmark')}</button></div><section class="detail-hero"><div class="detail-card-image"><img src="${cardImage(card)}" alt="${card.name}" referrerpolicy="no-referrer"></div><div class="detail-title"><div class="eyebrow">MAJOR ARCANA · ${card.id}</div><h1>${card.name}</h1><p>${card.subtitle}</p><div class="correspondence-row"><span>${card.element}</span><span>${card.astrology}</span></div></div></section><section class="meaning-panel"><div class="orientation-tabs"><button id="uprightTab" class="${upright?'active':''}">UPRIGHT MEANING</button><button id="reversedTab" class="${!upright?'active':''}">REVERSED MEANING</button></div><div class="keyword-row large">${keywords.map(k=>`<span>${k}</span>`).join('')}</div><p class="meaning-copy">${meaning}</p></section><section class="content-grid three">${infoCard('NUMBER',String(card.id),`<p>${card.numerology}</p>`)}${infoCard('ASTROLOGY',card.astrology,`<p>${card.astrology} shapes the card's symbolic rhythm and mode of expression.</p>`)}${infoCard('ELEMENT',card.element,`<p>${card.element} describes the elemental field through which this card most naturally operates.</p>`)}</section>${infoCard('VISUAL SYMBOLISM','What the image is saying',`<p>${card.symbolism}</p>`)}${infoCard('SPIRITUAL INTERPRETATION','The deeper invitation',`<p>${card.spiritual}</p>`)}<section class="connections-card"><div class="eyebrow">${icon('spark',14)} CONNECTIONS</div><h2>How this card changes in relationship</h2><div class="connection-list">${card.connections.map(c=>`<div class="connection"><div><span>WITH</span><strong>${c.card}</strong></div><section><h3>${c.title}</h3><p>${c.meaning}</p></section></div>`).join('')}</div></section><section class="reflection-card"><div class="eyebrow">YOUR REFLECTION</div><h2>What resonates?</h2><textarea id="noteField" placeholder="Write without editing yourself…">${escapeHtml(state.notes[card.id]||'')}</textarea><div class="reflection-note">Saved privately in this browser</div></section><section class="golden-thread">${infoCard('THE GOLDEN THREAD · JUNGIAN / PSYCHOLOGICAL','Jungian Arc',`<p>${card.psychological}</p><small>This is the final interpretive lens: not a replacement for the traditional card meaning, but the thread connecting symbol, psyche and lived experience.</small>`)}</section><nav class="deck-nav"><button id="prevBtn">${icon('back')} Previous card</button><div><span>${card.id+1}</span> / ${cards.length}</div><button id="nextBtn">Next card ${icon('arrow')}</button></nav>`, 'detail-page');
  document.getElementById('backBtn').onclick=()=>go(state.returnView||'learn');
  document.getElementById('bookmarkBtn').onclick=()=>{state.bookmarks=bookmarked?state.bookmarks.filter(id=>id!==card.id):[...state.bookmarks,card.id];save();renderDetail();};
  document.getElementById('uprightTab').onclick=()=>{state.orientation='upright';renderDetail();}; document.getElementById('reversedTab').onclick=()=>{state.orientation='reversed';renderDetail();};
  document.getElementById('noteField').oninput=e=>{state.notes[card.id]=e.target.value;save();}; document.getElementById('prevBtn').onclick=()=>navigate(card,-1);document.getElementById('nextBtn').onclick=()=>navigate(card,1);
}
function navigate(card,delta){const i=cards.findIndex(c=>c.id===card.id);const n=(i+delta+cards.length)%cards.length;state.cardId=cards[n].id;state.orientation='upright';renderDetail();window.scrollTo({top:0,behavior:'smooth'});}
function renderSaved(){
  const saved=cards.filter(c=>state.bookmarks.includes(c.id)||state.notes[c.id]);
  shell(`${backButton('Home','home')}<section class="section-hero"><div class="eyebrow">SAVED</div><h1>Your bookmarks & reflections.</h1><p>Stored privately in this browser.</p></section>${saved.length?`<section class="card-grid">${saved.map(cardTile).join('')}</section>`:`<section class="empty"><h3>Nothing saved yet</h3><p>Bookmark a card or write a reflection and it will appear here.</p><button class="gold-button" data-go="learn">Learn the Cards</button></section>`}`, 'page-home');
  bindBack();document.querySelectorAll('[data-card]').forEach(btn=>btn.onclick=()=>openCard(Number(btn.dataset.card),'saved'));
}
function render(){ if(state.view==='home')renderHome(); else if(state.view==='learn')renderLearn(); else if(state.view==='reading')renderReadingHub(); else if(state.view==='draw')renderDraw(); else if(state.view==='saved')renderSaved(); else renderDetail(); }
render();
