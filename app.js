const app = document.getElementById('app');
const state = {
  view: 'home', cardId: null, query: '', element: 'All', orientation: 'upright',
  bookmarks: readJSON('resonate-bookmarks', []), notes: readJSON('resonate-notes', {}),
  drawnCardId: null, drawPhase: 'idle'
};
const elements = ['All','Air','Water','Earth','Fire'];

function readJSON(key, fallback) { try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); } catch { return fallback; } }
function save() { localStorage.setItem('resonate-bookmarks', JSON.stringify(state.bookmarks)); localStorage.setItem('resonate-notes', JSON.stringify(state.notes)); }
function icon(name, size=18) {
  const attrs = `width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"`;
  if (name==='search') return `<svg ${attrs}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>`;
  if (name==='bookmark') return `<svg ${attrs}><path d="M6 4.8A1.8 1.8 0 0 1 7.8 3h8.4A1.8 1.8 0 0 1 18 4.8V21l-6-3.8L6 21Z"/></svg>`;
  if (name==='back') return `<svg ${attrs}><path d="M19 12H5"/><path d="m11 18-6-6 6-6"/></svg>`;
  if (name==='arrow') return `<svg ${attrs}><path d="M5 12h14"/><path d="m14 7 5 5-5 5"/></svg>`;
  return `<svg ${attrs}><path d="m12 3 1.1 4.4L17 9l-3.9 1.6L12 15l-1.1-4.4L7 9l3.9-1.6Z"/><path d="m18.5 14 .6 2.4 2.4.6-2.4.6-.6 2.4-.6-2.4-2.4-.6 2.4-.6Z"/></svg>`;
}
function escapeHtml(v='') { return String(v).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
function brandHeader() { return `<header class="brand-header"><div class="brand-mark">R</div><div><div class="brand-name">RESONATE</div><div class="brand-sub">TAROT EXPLORER</div></div><div class="brand-orbit"><span></span></div></header>`; }

function getFiltered() {
  const q = state.query.trim().toLowerCase();
  return cards.filter(card => {
    const elementMatch = state.element === 'All' || card.element === state.element;
    const haystack = [card.name,card.roman,card.element,card.astrology,card.subtitle,card.upright,card.reversed,card.psychological,...card.uprightKeywords,...card.reversedKeywords].join(' ').toLowerCase();
    return elementMatch && (!q || haystack.includes(q));
  });
}

function renderHome() {
  const visible = getFiltered();
  app.innerHTML = `<div class="ambient ambient-a"></div><div class="ambient ambient-b"></div><div class="page page-home">
    ${brandHeader()}
    <section class="intro"><div class="eyebrow">${icon('spark',15)} MAJOR ARCANA · 0–IV</div><h1>Read the symbol.<br>Hear what resonates.</h1><p>Five foundational cards explored through traditional meaning, psychology, symbolism and reflection.</p><button class="draw-cta" id="drawCardBtn">${icon('spark',16)} Draw a card</button></section>
    <section class="search-panel"><label class="search-box">${icon('search')}<input id="searchInput" value="${escapeHtml(state.query)}" placeholder="Search cards, elements, astrology…"><button id="clearSearch" aria-label="Clear search">${state.query ? '×' : ''}</button></label><div class="chips">${elements.map(x=>`<button class="chip ${state.element===x?'active':''}" data-element="${x}">${x}</button>`).join('')}</div></section>
    <div class="section-label"><span>Major Arcana Deck</span><small>${visible.length} card${visible.length===1?'':'s'}</small></div>
    ${visible.length ? `<section class="card-grid">${visible.map(cardTile).join('')}</section>` : `<section class="empty"><div class="brand-mark muted">R</div><h3>No cards found</h3><p>Try a different word or reset your filters.</p><button class="gold-button" id="resetFilters">Reset filters</button></section>`}
    <footer class="home-footer">A small deck for deeper study · RESONATE</footer>
  </div>`;
  bindHome();
}
function cardTile(card) { return `<button class="tarot-card element-${card.element.toLowerCase()}" data-card="${card.id}"><div class="card-top"><div class="roman-badge">${card.roman}</div><div class="element-pill">${card.element}</div></div><div class="tile-body"><h2>${card.roman} · ${card.name}</h2><p class="subtitle">${card.subtitle}</p><div class="keyword-row">${card.uprightKeywords.slice(0,2).map(k=>`<span>${k}</span>`).join('')}</div></div><div class="tile-foot"><span>${icon('spark',14)} ${card.astrology}</span>${icon('arrow',17)}</div></button>`; }
function bindHome() {
  document.getElementById('drawCardBtn').addEventListener('click', startSingleDraw);
  document.getElementById('searchInput').addEventListener('input', e => { state.query = e.target.value; renderHome(); const el=document.getElementById('searchInput'); el.focus(); el.setSelectionRange(el.value.length, el.value.length); });
  document.getElementById('clearSearch').addEventListener('click', () => { state.query=''; renderHome(); });
  document.querySelectorAll('[data-element]').forEach(btn => btn.addEventListener('click', () => { state.element=btn.dataset.element; renderHome(); }));
  document.querySelectorAll('[data-card]').forEach(btn => btn.addEventListener('click', () => { state.view='detail'; state.cardId=Number(btn.dataset.card); state.orientation='upright'; render(); window.scrollTo(0,0); }));
  const reset=document.getElementById('resetFilters'); if(reset) reset.addEventListener('click',()=>{state.query='';state.element='All';renderHome();});
}

function startSingleDraw() {
  const card = cards[Math.floor(Math.random() * cards.length)];
  state.view = 'draw';
  state.drawnCardId = card.id;
  state.drawPhase = 'dealing';
  renderDraw();
}

function renderDraw() {
  const card = cards.find(c => c.id === state.drawnCardId) || cards[0];
  app.innerHTML = `<div class="ambient ambient-a"></div><div class="ambient ambient-b"></div>
    <div class="page draw-page">
      ${brandHeader()}
      <section class="draw-stage" aria-live="polite">
        <div class="eyebrow">${icon('spark',15)} ONE-CARD READING</div>
        <h1>Let the card come to you.</h1>
        <p class="draw-instruction" id="drawStatus">Drawing your card…</p>
        <div class="spread-slot" id="spreadSlot" aria-label="One-card spread position">
          <span class="slot-label">1 · PRESENT</span>
        </div>
        <div class="dealing-card" id="dealingCard" aria-hidden="true">
          <div class="dealing-inner">
            <div class="dealing-face dealing-back"><div class="back-mark">R</div><span>RESONATE</span></div>
            <div class="dealing-face dealing-front">
              <div class="front-roman">${card.roman}</div>
              <div class="front-symbol">${icon('spark',34)}</div>
              <strong>${card.name}</strong>
              <span>${card.subtitle}</span>
            </div>
          </div>
        </div>
        <div class="settled-card-wrap" id="settledWrap" hidden>
          <button class="settled-card" id="openDrawnCard" aria-label="Open ${card.name} meaning">
            <div class="front-roman">${card.roman}</div>
            <div class="front-symbol">${icon('spark',30)}</div>
            <strong>${card.name}</strong>
            <span>${card.subtitle}</span>
          </button>
          <div class="settled-caption"><strong>1 · Present — ${card.name}</strong><span>Tap the card to explore its deeper meaning.</span></div>
        </div>
        <div class="draw-actions" id="drawActions" hidden>
          <button class="ghost-button" id="backHomeDraw">${icon('back',16)} Home</button>
          <button class="gold-button" id="drawAgain">${icon('spark',15)} Draw again</button>
        </div>
      </section>
    </div>`;

  const dealing = document.getElementById('dealingCard');
  const status = document.getElementById('drawStatus');
  const settled = document.getElementById('settledWrap');
  const actions = document.getElementById('drawActions');

  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) {
    dealing.hidden = true;
    settled.hidden = false;
    actions.hidden = false;
    status.textContent = 'Your card has settled into Position 1.';
  } else {
    requestAnimationFrame(() => dealing.classList.add('come-forward'));
    setTimeout(() => {
      dealing.classList.add('flip');
      status.textContent = 'Revealing…';
    }, 650);
    setTimeout(() => {
      dealing.classList.add('settle');
      status.textContent = 'Placing the card into Position 1…';
    }, 1450);
    setTimeout(() => {
      dealing.hidden = true;
      settled.hidden = false;
      settled.classList.add('settled-in');
      actions.hidden = false;
      status.textContent = 'Your card has settled into Position 1.';
      settled.scrollIntoView({behavior:'smooth', block:'center'});
    }, 2300);
  }

  document.getElementById('openDrawnCard').onclick = () => {
    state.view = 'detail';
    state.cardId = card.id;
    state.orientation = 'upright';
    renderDetail();
    window.scrollTo({top:0,behavior:'smooth'});
  };
  document.getElementById('backHomeDraw').onclick = () => { state.view='home'; renderHome(); window.scrollTo(0,0); };
  document.getElementById('drawAgain').onclick = startSingleDraw;
}

function infoCard(label,title,body) { return `<section class="info-card"><div class="eyebrow">${label}</div><h2>${title}</h2>${body}</section>`; }
function renderDetail() {
  const card = cards.find(c=>c.id===state.cardId) || cards[0];
  const upright = state.orientation==='upright';
  const keywords = upright ? card.uprightKeywords : card.reversedKeywords;
  const meaning = upright ? card.upright : card.reversed;
  const bookmarked = state.bookmarks.includes(card.id);
  app.innerHTML = `<div class="ambient ambient-a"></div><div class="ambient ambient-b"></div><div class="page detail-page">
    <div class="detail-topbar"><button class="icon-button" id="backBtn">${icon('back')}</button><div class="detail-brand">RESONATE <span>·</span> ${card.roman}</div><button class="icon-button ${bookmarked?'bookmarked':''}" id="bookmarkBtn">${icon('bookmark')}</button></div>
    <section class="detail-hero"><div class="ritual-mark"><div><div><span>${card.roman}</span></div></div></div><div class="detail-title"><div class="eyebrow">MAJOR ARCANA · ${card.id}</div><h1>${card.name}</h1><p>${card.subtitle}</p><div class="correspondence-row"><span>${card.element}</span><span>${card.astrology}</span></div></div></section>
    <section class="meaning-panel"><div class="orientation-tabs"><button id="uprightTab" class="${upright?'active':''}">UPRIGHT MEANING</button><button id="reversedTab" class="${!upright?'active':''}">REVERSED MEANING</button></div><div class="keyword-row large">${keywords.map(k=>`<span>${k}</span>`).join('')}</div><p class="meaning-copy">${meaning}</p></section>
    <section class="content-grid two">${infoCard('JUNGIAN / PSYCHOLOGICAL','Jungian Arc',`<p>${card.psychological}</p>`)}${infoCard('CONTEMPLATIVE PROMPT','Journal Prompt',`<blockquote>${card.journalPrompt}</blockquote>`)}</section>
    <section class="connections-card"><div class="eyebrow">${icon('spark',14)} CONNECTIONS</div><h2>How this card changes in relationship</h2><div class="connection-list">${card.connections.map(c=>`<div class="connection"><div><span>WITH</span><strong>${c.card}</strong></div><section><h3>${c.title}</h3><p>${c.meaning}</p></section></div>`).join('')}</div></section>
    <section class="content-grid three">${infoCard('NUMBER',String(card.id),`<p>${card.numerology}</p>`)}${infoCard('ASTROLOGY',card.astrology,`<p>${card.astrology} shapes the card's symbolic rhythm and mode of expression.</p>`)}${infoCard('ELEMENT',card.element,`<p>${card.element} describes the elemental field through which this card most naturally operates.</p>`)}</section>
    ${infoCard('SPIRITUAL INTERPRETATION','The deeper invitation',`<p>${card.spiritual}</p>`)}
    ${infoCard('VISUAL SYMBOLISM','What the image is saying',`<p>${card.symbolism}</p>`)}
    <section class="reflection-card"><div class="eyebrow">YOUR REFLECTION</div><h2>What resonates?</h2><textarea id="noteField" placeholder="Write without editing yourself…">${escapeHtml(state.notes[card.id]||'')}</textarea><div class="reflection-note">Saved privately in this browser</div></section>
    <nav class="deck-nav"><button id="prevBtn">${icon('back')} Previous card</button><div><span>${card.id+1}</span> / ${cards.length}</div><button id="nextBtn">Next card ${icon('arrow')}</button></nav>
  </div>`;
  document.getElementById('backBtn').onclick=()=>{state.view='home'; render();};
  document.getElementById('bookmarkBtn').onclick=()=>{state.bookmarks = bookmarked ? state.bookmarks.filter(id=>id!==card.id) : [...state.bookmarks,card.id]; save(); renderDetail();};
  document.getElementById('uprightTab').onclick=()=>{state.orientation='upright';renderDetail();};
  document.getElementById('reversedTab').onclick=()=>{state.orientation='reversed';renderDetail();};
  document.getElementById('noteField').oninput=e=>{state.notes[card.id]=e.target.value;save();};
  document.getElementById('prevBtn').onclick=()=>navigate(card,-1);
  document.getElementById('nextBtn').onclick=()=>navigate(card,1);
}
function navigate(card, delta) { const i=cards.findIndex(c=>c.id===card.id); const n=(i+delta+cards.length)%cards.length; state.cardId=cards[n].id; state.orientation='upright'; renderDetail(); window.scrollTo({top:0,behavior:'smooth'}); }
function render(){ if(state.view==='home') renderHome(); else if(state.view==='draw') renderDraw(); else renderDetail(); }
render();
