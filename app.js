const app = document.getElementById('app');
const state = {
  view: 'home', cardId: null, query: '', element: 'All', orientation: 'upright',
  bookmarks: readJSON('resonate-bookmarks', []), notes: readJSON('resonate-notes', {}),
  drawnCardIds: [], spreadSize: 1, drawPhase: 'idle', menuOpen: false,
  returnView: 'learn', drawSettled: false, drawnAt: null
};
const elements = ['All','Air','Water','Earth','Fire'];
const spreads = {
  guidance: {name:'One-card Guidance',description:'A clear focus and invitation',positions:[
    ['Guidance','the guidance you can put into practice today']
  ]},
  three: {name:'Past · Present · Future',description:'A simple line through time',positions:[
    ['Past','the experiences and patterns that brought you here'],
    ['Present','what is active now and how you can respond'],
    ['Future','a possible direction if current patterns continue, rather than a fixed prediction']
  ]},
  seven: {name:'Seven-card V Reading',description:'A general reading or answer to a question',positions:[
    ['Past · 18–24 Months','your experiences and influences from approximately the previous 18 to 24 months'],
    ['Present Time','your present circumstances, including the period immediately surrounding today'],
    ['Near Future · 3 Months','what may develop over approximately the next three months if the present course continues'],
    ['You / Answer','your current state in a general reading; for a specific question, this card gives the answer and is interpreted last'],
    ['Surrounding Energies','the people, home, work and other circumstances influencing you or the question at present'],
    ['Hopes, Fears & Attitude','the hopes, fears and attitude you bring to the situation or specific question'],
    ['Outcome · Next 18–24 Months','the longer-term outcome of present circumstances over approximately the next 18 to 24 months; in a question reading, the likely outcome of that question']
  ]},
  relationship: {name:'Relationship',description:'Two perspectives and the connection between them',positions:[
    ['You','your own feelings, needs and contribution to the relationship'],
    ['The Other Person','your perception of the other person; use this for reflection, not as proof of their private thoughts'],
    ['The Connection','the dynamic created between you'],
    ['Relationship Challenge','a tension or unmet need to explore together'],
    ['Shared Guidance','a constructive next step for mutual understanding']
  ]},
  celtic: {name:'Celtic Cross',description:'Ten perspectives on a deeper question',positions:[
    ['Present Situation','the central situation as you experience it now'],
    ['Crossing Challenge','the tension or obstacle crossing that situation'],
    ['Foundation','the deeper roots beneath the situation'],
    ['Recent Past','an influence receding into the past'],
    ['Conscious Focus','your hopes, intentions or conscious priorities'],
    ['Near Future','a possible next development, not a fixed prediction'],
    ['Your Approach','the stance you bring and the choices within your control'],
    ['Surrounding Influences','the environment and outside influences around you'],
    ['Hopes and Fears','the desires and worries colouring your view'],
    ['Potential Outcome','a possible outcome if the present pattern continues, with room for your choices']
  ]}
};
state.spreadId = 'guidance';
state.readingIndex = null;
function currentSpread(){ return spreads[state.spreadId] || spreads.guidance; }
function positionLabels(){ return currentSpread().positions.map(position=>position[0]); }
function positionContext(card,index,upright=!isReversed(card)){
  const position=currentSpread().positions[index];
  if(!position) return '';
  const themes={
    0:['a willingness to begin before every answer is known','hesitation or an impulsive leap without enough preparation'],
    1:['focused use of the skills and resources already available','scattered effort, unused ability or attempts to control the result'],
    2:['patient listening to intuition while allowing missing information to emerge','inner noise or assumptions that need checking against what is actually known'],
    3:['steady care that gives a relationship, project or part of yourself room to grow','overgiving or depletion that calls for rest and renewed care'],
    4:['clear boundaries and dependable structure that protect what matters','rigid control or unreliable boundaries that need to become more supportive']
  };
  const theme=themes[card.id]?.[upright?0:1]||(upright?card.uprightKeywords:card.reversedKeywords).join(', ').toLowerCase();
  const role=position[0];
  let lens;
  if(state.spreadId==='seven'){
    const sevenLenses=[
      `Looking across the previous 18 to 24 months, ${theme} may show an experience or influence that helped shape the present situation.`,
      `In the period immediately surrounding today, ${theme} may describe what is active for you now.`,
      `Over approximately the next three months, ${theme} may show what develops if the present course continues; it is a direction, not a fixed prediction.`,
      `In a general reading, ${theme} may describe where you stand now. If you asked a specific question, return to this card last and consider what answer it suggests for you.`,
      `In your surroundings, ${theme} may be expressed through people, home, work or other circumstances influencing the situation now.`,
      `${theme.charAt(0).toUpperCase()+theme.slice(1)} may colour your hopes, fears and attitude toward the situation or question.`,
      `Across approximately the next 18 to 24 months, ${theme} may describe the likely outcome if present circumstances continue, while leaving room for choice and change.`
    ];
    lens=sevenLenses[index];
  }
  else if(/Past|past/.test(role)) lens=`This may describe how ${theme} shaped the path to your current situation. Consider what you want to carry forward and what belongs to an earlier chapter.`;
  else if(/Future|future|direction|outcome/.test(role)) lens=`This suggests a possible development involving ${theme}. Notice which present choices encourage that direction and which could change it; this is a possibility, not a fixed result.`;
  else if(/challenge|Challenge/.test(role)) lens=`The tension to explore is ${theme}. Ask where this pattern becomes difficult and what small adjustment would help you meet it differently.`;
  else if(/Guidance|guidance|approach/.test(role)) lens=`Your next step is to work consciously with ${theme}. Choose one practical response you can try, then notice whether it helps.`;
  else if(/^The Other Person$/i.test(role)) lens=`Consider whether your perception of the other person is coloured by ${theme}. Check that impression through conversation rather than treating the card as access to their thoughts.`;
  else if(/^The Connection$/i.test(role)) lens=`Between you, ${theme} may describe a shared pattern. Notice how each person's response strengthens or softens that dynamic.`;
  else lens=`Here, ${theme} is a lens for ${position[1]}. Identify one concrete example in your situation and consider how it shapes your response.`;
  return `Position: ${role} — ${card.name}${upright?'':' reversed'}. ${lens}`;
}
function readingTitle(){ return currentSpread().name; }
// Keep each word of a position label whole ("18–24" must not split at the dash) and keep a "·" separator
// at the end of its line rather than the start of the next; spaces still wrap.
function slotLabelHtml(label){ return String(label).replace(/ · /g,'\u00a0· ').split(' ').map(word=>`<span class="slot-word">${word}</span>`).join(' '); }
function sampleDeckNotice(){
  return currentSpread().positions.length>cards.length
    ? `<p class="reading-note sample-deck-note">Sample-deck reading: this test version has ${cards.length} cards, so cards repeat to fill all ${currentSpread().positions.length} positions.</p>` : '';
}

let drawTimers = [];
function reducedMotion(){ return !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches; }
function scrollMotion(){ return reducedMotion()?'auto':'smooth'; }

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
  if (name==='reading') return `<svg ${attrs}><rect x="4" y="6" width="10" height="14" rx="2"/><rect x="10" y="3" width="10" height="14" rx="2"/><path d="m13 8 2-2 2 2-2 2Z"/></svg>`;
  if (name==='learn') return `<svg ${attrs}><path d="M4 5.5A3.5 3.5 0 0 1 7.5 2H11v17H7.5A3.5 3.5 0 0 0 4 22Z"/><path d="M20 5.5A3.5 3.5 0 0 0 16.5 2H13v17h3.5A3.5 3.5 0 0 1 20 22Z"/></svg>`;
  if (name==='saved') return `<svg ${attrs}><path d="M6 4.8A1.8 1.8 0 0 1 7.8 3h8.4A1.8 1.8 0 0 1 18 4.8V21l-6-3.8L6 21Z"/><path d="m9.5 9 1.6 1.6L15 7"/></svg>`;
  return `<svg ${attrs}><path d="m12 3 1.1 4.4L17 9l-3.9 1.6L12 15l-1.1-4.4L7 9l3.9-1.6Z"/><path d="m18.5 14 .6 2.4 2.4.6-2.4.6-.6 2.4-.6-2.4-2.4-.6 2.4-.6Z"/></svg>`;
}
function escapeHtml(v='') { return String(v).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
function cardImage(card) { return card.image; }
// Reversals: every card drawn in a reading (spread and clarifiers) is upright or reversed, fixed when it is drawn
// and kept with the reading. A card appears once per reading, so the reversed card ids are enough:
// state.drawnOrientations = {readingAt, reversed:[ids]}. The seeker can switch reversals off (upright only).
const reversalsKey='resonate-include-reversals';
function reversalsOn(){ try{return localStorage.getItem(reversalsKey)!=='off';}catch{return true;} }
function setReversalsOn(on){ try{localStorage.setItem(reversalsKey,on?'on':'off');}catch{} }
function reversedIds(){ const o=state.drawnOrientations; return o&&o.readingAt===state.drawnAt?[...(o.reversed||[])]:[]; }
function isReversed(card){ return !!card&&reversedIds().includes(card.id); }
function orientCards(ids){
  const reversed=reversedIds();
  if(reversalsOn())ids.forEach(id=>{if(id!=null&&!reversed.includes(id)&&Math.random()<0.5)reversed.push(id);});
  state.drawnOrientations={readingAt:state.drawnAt,reversed};
  return ids;
}
function cardMeaning(card){ return isReversed(card)?card.reversed:card.upright; }
function cardKeywords(card){ return (isReversed(card)?card.reversedKeywords:card.uprightKeywords)||[]; }
function cardName(card){ return isReversed(card)?`${card.name}, reversed`:card.name; }
function imageFallback(img){ img.hidden=true; const wrap=img.parentElement; if(wrap){wrap.classList.add('image-unavailable');wrap.setAttribute('aria-label',`${img.alt} image unavailable`);} }
function handGraphic() { return `<div class="hand-hero"><img src="assets/mystic-hand-whisper.png" alt="A mystical jeweled hand rising through smoke and golden celestial light"></div>`; }
function brandHeader() { return `<header class="brand-header"><button class="menu-button" id="menuBtn" aria-label="Main menu">${icon('menu',20)}</button><div class="brand-mark">R</div><div><div class="brand-name">RESONATE</div><div class="brand-sub">TAROT EXPLORER</div></div><button class="brand-orbit" id="centerBtn" aria-label="Re-centre this page" title="Re-centre"><span></span></button></header>`; }
function menuOverlay() { return `<div class="menu-overlay ${state.menuOpen?'open':''}" id="menuOverlay" aria-hidden="${state.menuOpen?'false':'true'}"><div class="menu-panel"><div class="menu-head"><div><span>RESONATE</span><small>Main Menu</small></div><button id="closeMenu" aria-label="Close menu">${icon('close',22)}</button></div><nav><button data-go="home"><strong>Home</strong><span>Start here</span></button><button data-go="reading"><strong>Tarot Reading</strong><span>Choose a spread</span></button><button data-go="learn"><strong>Learn the Cards</strong><span>Explore meanings and symbolism</span></button><button data-go="saved"><strong>Your Personal Journal</strong><span>Bookmarks and reflections</span></button></nav><p>Every path has a clear way home.</p></div></div>`; }
function shell(content, cls='') { app.innerHTML = `<div class="ambient ambient-a"></div><div class="ambient ambient-b"></div><div class="page ${cls}">${brandHeader()}${content}</div>${menuOverlay()}`; bindGlobal(); }
function bindGlobal() {
  const menuBtn=document.getElementById('menuBtn'); if(menuBtn) menuBtn.onclick=()=>{state.menuOpen=true; document.getElementById('menuOverlay').classList.add('open');document.getElementById('menuOverlay').setAttribute('aria-hidden','false');};
  const close=document.getElementById('closeMenu'); if(close) close.onclick=closeMenu;
  const center=document.getElementById('centerBtn'); if(center) center.onclick=()=>{closeMenu(); const target=document.querySelector('.draw-stage,.detail-hero,.section-hero,.home-intro')||document.querySelector('.page'); target?.scrollIntoView({behavior:scrollMotion(),block:'start'}); center.classList.add('centered'); setTimeout(()=>center.classList.remove('centered'),650);};
  document.querySelectorAll('[data-go]').forEach(btn=>btn.onclick=()=>{closeMenu(); go(btn.dataset.go);});
  const overlay=document.getElementById('menuOverlay'); if(overlay) overlay.onclick=e=>{if(e.target===overlay) closeMenu();};
}
function closeMenu(){ state.menuOpen=false; const el=document.getElementById('menuOverlay'); if(el){el.classList.remove('open');el.setAttribute('aria-hidden','true');} }
function clearDrawTimers(){ drawTimers.forEach(clearTimeout); drawTimers=[]; }
const readingReturnFields=['spreadId','spreadSize','drawnCardIds','drawnAt','openingDice','clarifierReadingAt','firstLayerClarifiers','additionalClarifierReadingAt','additionalClarifierLayers','journalId','journalSpread','drawPhase','drawSettled','drawnOrientations','readingAstrology','readingStartedAt'];
function captureReadingReturn(){return {reading:JSON.parse(JSON.stringify(Object.fromEntries(readingReturnFields.map(key=>[key,state[key]??null])))),scrollY:window.scrollY};}
function go(view){
  clearDrawTimers();
  const origin=view==='draw'&&state.view==='detail'&&state.returnView==='draw'?state.readingReturn:null;
  if(origin){Object.assign(state,JSON.parse(JSON.stringify(origin.reading)));state.readingIndex=null;state.drawSettled=true;state.drawPhase='settled';}
  state.view=view;state.orientation='upright';render();
  if(origin){window.scrollTo({top:origin.scrollY,behavior:'instant'});requestAnimationFrame(()=>window.scrollTo({top:origin.scrollY,behavior:'instant'}));}
  else window.scrollTo({top:0,behavior:scrollMotion()});
}

function backButton(label='Back', target='home'){ return `<button class="back-link" data-back="${target}">${icon('back',16)} ${label}</button>`; }
function bindBack(){ document.querySelectorAll('[data-back]').forEach(b=>b.onclick=()=>go(b.dataset.back)); }

function renderHome() {
  const firstCard=cards[0];
  shell(`<section class="intro home-intro">${handGraphic()}<button class="hero-card-preview" data-home-card="${firstCard.id}" aria-label="Explore ${firstCard.name}"><span class="hero-card-glow"></span><img src="${cardImage(firstCard)}" alt="${firstCard.name}" loading="eager" referrerpolicy="no-referrer"><span class="hero-card-label"><small>BEGIN WITH</small><strong>${firstCard.roman} · ${firstCard.name}</strong></span></button><div class="home-hero-copy"><div class="eyebrow">${icon('spark',15)} RESONATE TAROT</div><h1>Read the symbol.<br>Hear what resonates.</h1><p>Learn the cards, draw a reading, then follow the meaning deeper.</p><div class="home-actions"><button class="draw-cta" data-go="reading">${icon('spark',16)} Get a Reading</button><button class="ghost-button" data-go="learn">Learn the Cards ${icon('arrow',16)}</button></div></div></section><section class="home-paths"><button data-go="reading"><span>01</span><div class="path-graphic">${icon('reading',34)}</div><strong>Get a Reading</strong><small>Choose a spread and draw</small></button><button data-go="learn"><span>02</span><div class="path-graphic">${icon('learn',34)}</div><strong>Learn the Cards</strong><small>Study meanings, symbols and connections</small></button><button data-go="saved"><span>03</span><div class="path-graphic">${icon('saved',34)}</div><strong>Your Personal Journal</strong><small>Return to bookmarks and reflections</small></button></section><footer class="home-footer">RESONATE · a deeper way into the cards</footer>`, 'page-home');
  document.querySelector('[data-home-card]')?.addEventListener('click',()=>openCard(firstCard.id,'learn'));
}

function normalise(v=''){return String(v).toLowerCase().replace(/^the\s+/,'').replace(/[^a-z0-9]/g,'');}
function editDistance(a,b){a=normalise(a);b=normalise(b);const dp=Array.from({length:b.length+1},(_,i)=>[i]);for(let j=0;j<=a.length;j++)dp[0][j]=j;for(let i=1;i<=b.length;i++)for(let j=1;j<=a.length;j++)dp[i][j]=b[i-1]===a[j-1]?dp[i-1][j-1]:1+Math.min(dp[i-1][j-1],dp[i][j-1],dp[i-1][j]);return dp[b.length][a.length];}
function fuzzyMatch(query, card){
  const q=normalise(query); if(!q) return true;
  const fields=[card.name,card.roman,card.element,card.astrology,card.subtitle,card.upright,card.reversed,card.psychological,...card.uprightKeywords,...card.reversedKeywords];
  if(fields.some(v=>normalise(v).includes(q))) return true;
  if(q.length<4) return false;
  return fields.some(v=>String(v).split(/\s+/).some(word=>editDistance(q,word)<=Math.max(1,Math.floor(q.length/4))));
}
function getFiltered() {
  const q = state.query.trim();
  return cards.filter(card => {
    const elementMatch = state.element === 'All' || card.element === state.element;
    return elementMatch && fuzzyMatch(q,card);
  });
}
function renderLearn() {
  const visible=getFiltered();
  shell(`${backButton('Home','home')}<section class="section-hero"><div class="eyebrow">LEARN THE CARDS</div><h1>Learn the cards before memorising them.</h1><p>Start with image, traditional meaning and symbolism. Astrology and numerology sit near the top; the Jungian interpretation closes each card as the deeper golden thread.</p></section><section class="search-panel"><label class="search-box">${icon('search')}<input id="searchInput" value="${escapeHtml(state.query)}" placeholder="Search cards, elements, astrology…"><button id="clearSearch" aria-label="Clear search">${state.query ? '×' : ''}</button></label><div class="chips">${elements.map(x=>`<button class="chip ${state.element===x?'active':''}" data-element="${x}">${x}</button>`).join('')}</div></section><div class="section-label"><span>Tarot Deck</span><small>${visible.length} card${visible.length===1?'':'s'}</small></div>${visible.length?`<section class="card-grid">${visible.map(cardTile).join('')}</section>`:`<section class="empty"><h3>No cards found</h3><p>Try a shorter word or a close spelling.</p><button class="gold-button" id="resetFilters">Reset filters</button></section>`}`, 'page-home');
  bindBack();
  document.getElementById('searchInput').oninput=e=>{state.query=e.target.value;renderLearn();const el=document.getElementById('searchInput');el.focus();el.setSelectionRange(el.value.length,el.value.length);};
  document.getElementById('clearSearch').onclick=()=>{state.query='';renderLearn();};
  document.querySelectorAll('[data-element]').forEach(btn=>btn.onclick=()=>{state.element=btn.dataset.element;renderLearn();});
  document.querySelectorAll('[data-card]').forEach(btn=>btn.onclick=()=>openCard(Number(btn.dataset.card),'learn'));
  const reset=document.getElementById('resetFilters'); if(reset) reset.onclick=()=>{state.query='';state.element='All';renderLearn();};
}
function cardTile(card) { return `<button class="tarot-card element-${card.element.toLowerCase()}" data-card="${card.id}"><div class="card-image-wrap"><img src="${cardImage(card)}" alt="${card.name}" loading="lazy" referrerpolicy="no-referrer" onerror="imageFallback(this)"></div><div class="card-top"><div class="roman-badge">${card.roman}</div><div class="element-pill">${card.element}</div></div><div class="tile-body"><h2>${card.roman} · ${card.name}</h2><p class="subtitle">${card.subtitle}</p><div class="keyword-row">${card.uprightKeywords.slice(0,2).map(k=>`<span>${k}</span>`).join('')}</div></div><div class="tile-foot"><span>${icon('spark',14)} ${card.astrology}</span>${icon('arrow',17)}</div></button>`; }
function openCard(id, returnView='learn', positionIndex=null){if(returnView==='draw'){if(state.view==='draw'||!state.readingReturn)state.readingReturn=captureReadingReturn();}else state.readingReturn=null;clearDrawTimers();state.readingIndex=returnView==='draw'?positionIndex:null;if(returnView==='draw'){state.drawSettled=true;state.drawPhase='settled';}state.view='detail';state.cardId=id;state.returnView=returnView;state.orientation=returnView==='draw'&&isReversed(cards.find(c=>c.id===id))?'reversed':'upright';renderDetail();window.scrollTo(0,0);}

function renderReadingHub(){
  shell(`${backButton('Home','home')}<section class="section-hero reading-hero"><div class="eyebrow">TAROT READING</div><h1>Choose the shape of the question.</h1><p>The cards stay face down until you draw. Then each card comes forward, turns, and settles into its place.</p></section><section class="spread-picker"><button data-spread="1"><span>1 CARD</span><strong>Present</strong><small>A clear single focus</small></button><button data-spread="3"><span>3 CARDS</span><strong>Past · Present · Future</strong><small>A simple line through time</small></button><button data-spread="7"><span>7 CARDS</span><strong>V Reading</strong><small>A fuller RESONATE reading</small></button></section><div class="reading-note">Choose a spread, hold your question, then press <strong>Draw Cards</strong>.</div><button class="draw-cta reading-draw" id="drawCardsBtn">${icon('spark',16)} Draw Cards</button>`, 'reading-page');
  bindBack();
  state.spreadSize=[1,3,7].includes(state.spreadSize)?state.spreadSize:1;
  document.querySelectorAll('[data-spread]').forEach(b=>{if(Number(b.dataset.spread)===state.spreadSize)b.classList.add('active');b.onclick=()=>{state.spreadSize=Number(b.dataset.spread);renderReadingHub();};});
  document.getElementById('drawCardsBtn').onclick=startDraw;
}
function pickUnique(n){ const pool=[...cards]; const chosen=[]; while(pool.length&&chosen.length<n){const i=Math.floor(Math.random()*pool.length);chosen.push(pool.splice(i,1)[0].id);} return chosen; }
function startDraw(){
  clearDrawTimers();
  const previous=state.drawnCardIds.join(',');
  let next=pickUnique(state.spreadSize);
  if(cards.length>1){
    for(let attempt=0;attempt<4&&next.join(',')===previous;attempt++) next=pickUnique(state.spreadSize);
  }
  state.drawnCardIds=next;state.drawnAt=new Date().toISOString();orientCards(next);state.view='draw';state.drawPhase='dealing';state.drawSettled=false;renderDraw();
  requestAnimationFrame(()=>window.scrollTo({top:0,behavior:scrollMotion()}));
}
const zodiacSigns=['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
function astrologyPlanet(card){
  return ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto'].find(name=>card.astrology.includes(name))||null;
}
function currentSky(card, at=state.drawnAt||Date.now()) {
  const planet=astrologyPlanet(card);
  if(!planet) return {planet:null,text:'No planetary placement assigned'};
  try{
    const readingContext=state.view==='draw'||(state.view==='detail'&&state.returnView==='draw');
    if(readingContext&&state.readingAstrology?.sky){
      const saved=state.readingAstrology.sky.positions[planet];
      return {planet,text:saved?`${planet} is at ${saved.degrees}° ${String(saved.minutes).padStart(2,'0')}′ ${saved.sign}`:`${planet} not recorded in this snapshot`};
    }
    if(!window.Astronomy) throw new Error('Astronomy unavailable');
    const when=new Date(at);
    const vector=window.Astronomy.GeoVector(window.Astronomy.Body[planet],when,true);
    const longitude=window.Astronomy.Ecliptic(vector).elon;
    const sign=zodiacSigns[Math.floor(longitude/30)%12];
    const within=longitude%30;
    const degrees=Math.floor(within);
    const minutes=Math.floor((within-degrees)*60);
    return {planet,text:`${planet} is at ${degrees}° ${String(minutes).padStart(2,'0')}′ ${sign}`};
  }catch{return {planet,text:`${planet} placement temporarily unavailable`};}
}
function whisperCardArt(card){
  if(card.atmosphere)return card.atmosphere;
  const names=['fool','magician','high-priestess','empress','emperor'];
  return `assets/whisper-${names[card.id]||'fool'}.jpg`;
}
function atmosphericArt(src, label) {
  return `<figure class="atmospheric-art"><img src="${src}" alt="${label}" loading="lazy" decoding="async" width="1536" height="1024"></figure>`;
}
// Original RESONATE interpretive observations inspired by traditional RWS visual study.
const resonateImagery={
  0:{image:"the white rose and the bright sky",reading:"The rose invites sincerity of intention while the bright sky suggests room to think clearly before stepping ahead.",colours:["white","yellow"],stage:"beginning a journey"},
  1:{image:"the red outer garment, white clothing and tools on the table",reading:"Passion and deliberate effort meet a question of honest purpose: what resources can be used well?",colours:["red","white"],stage:"discovering personal agency"},
  2:{image:"the blue garment and contrasting pillars",reading:"Reflection and deeper understanding sit between opposing possibilities, inviting patience with uncertainty.",colours:["blue"],stage:"learning to listen inwardly"},
  3:{image:"the warm yellow landscape and the green growth around the seated figure",reading:"Creativity is supported by attention and balance; growth needs both space and care.",colours:["yellow","green"],stage:"nurturing what can grow"},
  4:{image:"the red robes and the firm stone throne",reading:"Determination is given form through limits, responsibility and practical structure.",colours:["red"],stage:"learning structure and stewardship"}
};
function imageryInsight(card){
  const profile=resonateImagery[card.id];
  return profile?`<p class="symbolism-insight"><strong>Looking closer:</strong> Notice ${profile.image}. ${profile.reading}</p>`:`<p class="symbolism-insight"><strong>Looking closer:</strong> ${card.symbolism}</p>`;
}
function storyConnection(base,clarifier){
  const a=resonateImagery[base.id],b=resonateImagery[clarifier.id];
  const common=a&&b?a.colours.filter(colour=>b.colours.includes(colour)):[];
  const palette=common.length?` Both images echo ${common.join(' and ')}, linking their visual language.`:'';
  const development=a&&b?` As a story, this moves from ${a.stage} towards ${b.stage}.`:'';
  return `<p class="symbolism-insight"><strong>The conversation between them:</strong> ${cardName(base)} asks about ${cardKeywords(base).slice(0,2).join(' and ').toLowerCase()}, while ${cardName(clarifier)} brings ${cardKeywords(clarifier).slice(0,2).join(' and ').toLowerCase()} into the same question.${palette}${development} Read this as a possible shift in emphasis, not a certainty.</p>`;
}
function existingReadingLenses(card){
  return `<section class="reading-card-lenses" aria-label="Interpretive lenses for ${escapeHtml(card.name)}"><h4>Tao / Wu Wei · ${card.name}</h4><p>${card.wuWei}</p><div class="jungian-lens"><h4>Jungian interpretation · ${card.name}</h4><p>${card.psychological}</p></div></section>`;
}
function readingCorrespondences(card){
  return `<div class="reading-card-correspondences"><p><strong>Astrology:</strong> ${card.astrology} · ${card.element}</p><p><strong>${card.number===null?'Court rank':'Number'}:</strong> ${card.number===null?card.rank:card.number}</p><p>${card.numerology}</p></div>`;
}
// Integrated clarifier reading (team directive, 7 Nov 2026): 1 the original card in its position;
// 2 how Clarifier 1 relates to it; 3 how Clarifier 2 connects to both; 4 what they mean together and
// within the wider spread. The relationships come from clarifier-reading.js, recalculated on every render.
function clarifierReadingHelpers(){ return {reversed:isReversed,keywords:cardKeywords}; }
function relationNotes(step){
  const notes=[...(step.notes||[])];
  if(step.connection)notes.push(`RESONATE's card notes link these two: ${step.connection}`);
  return notes.length?`<p class="relation-notes">${notes.join(' ')}</p>`:'';
}
function readingMeaning(card,label,index){
  const focus=label||'this position';
  const sky=currentSky(card);
  const layers=[];
  if(state.clarifierReadingAt===state.drawnAt&&state.firstLayerClarifiers?.length)layers.push({number:1,id:state.firstLayerClarifiers[index]});
  if(state.additionalClarifierReadingAt===state.drawnAt)(state.additionalClarifierLayers||[]).filter(layer=>layer.number===2).forEach(layer=>layers.push({number:layer.number,id:layer.cards[index]}));
  const actual=layers.map(layer=>({...layer,card:cards.find(c=>c.id===layer.id)})).filter(x=>x.card);
  const R=typeof ResonateClarifierReading!=='undefined'?ResonateClarifierReading:null;
  const H=clarifierReadingHelpers();
  const c1=actual.find(x=>x.number===1)?.card||null, c2=actual.find(x=>x.number===2)?.card||null;
  let step=1;
  const stepLabel=text=>`<span class="reading-step">${++step} · ${text}</span>`;
  const relationHtml=({number,card:clarifier})=>{
    if(!R)return storyConnection(card,clarifier);
    const rel=number===1||!c1?R.firstStep(card,clarifier,focus,H):R.secondStep(card,c1,clarifier,focus,H);
    const basis=rel.basis.length?`<p class="relation-basis">Read this way because ${rel.basis.join('; ')}.</p>`:'';
    const why=number===2&&c1&&c1.arcana==='Major'?`<p class="relation-rule">Clarifier 2 was drawn because Clarifier 1 is also a Major Arcana card (Chas's teaching rule).</p>`:'';
    return `<div class="clarifier-relation" data-relation="${number===1?rel.kind:rel.kinds.join('-')}"><p class="relation-lead">${rel.lead}</p><p class="relation-meaning">${rel.meaning}</p>${basis}${relationNotes(rel)}${why}</div>`;
  };
  const connected=actual.map(x=>{const {number,card:clarifier}=x;return `<div class="integrated-clarifier" data-clarifier="${number}">${R?stepLabel(number===1?'How the first clarifier speaks to it':'How the second clarifier connects to both'):''}<h3>Clarifier ${number} · ${clarifier.roman||clarifier.id} · ${cardName(clarifier)}</h3><p>${cardMeaning(clarifier)}</p>${readingCorrespondences(clarifier)}${imageryInsight(clarifier)}${relationHtml(x)}</div>`;}).join('');
  const spot=typeof ResonateClarifiers!=='undefined'&&state.drawnCardIds?.length?clarifierPlan().positions[index]:null;
  const pendingNote=spot&&spot.needsSecond?`<p class="reading-pending" role="note">Clarifier 1 is a Major Arcana card, so a second clarifier is due here. When it is drawn, this reading updates to include it.</p>`:'';
  let synthesis='';
  if(actual.length&&R&&c1){
    const chosen=state.drawnCardIds.map(id=>cards.find(c=>c.id===id));
    const clarified=chosen.map((_,i)=>readingLayerCards(i).length);
    const s=R.synthesis(card,c1,c2,{pos:focus,index,spreadId:state.spreadId,spreadName:currentSpread().name,labels:positionLabels(),baseCards:chosen,clarified},H);
    synthesis=`<div class="combined-meaning">${stepLabel('What they mean together')}<h3>Together in ${focus}</h3><p class="synthesis-lead">${s.lead}${s.element?' '+s.element:''} ${s.guide}</p>${s.wider?`<p class="synthesis-wider">${s.wider}</p>`:''}<p class="synthesis-close">This is a perspective for reflection, not a fixed prediction.</p><p class="reading-method">${R.METHOD}</p></div>`;
  } else if(actual.length){
    const themes=[card,...actual.map(x=>x.card)].map(c=>cardKeywords(c).slice(0,2).join(' and ').toLowerCase());
    synthesis=`<div class="combined-meaning"><h3>What these cards mean together</h3><p><strong>${cardName(card)}</strong> provides the foundation of ${themes[0]}. ${actual.map(({card:c},k)=>`${cardName(c)} brings ${themes[k+1]} into the picture`).join('; ')}. In the <strong>${focus}</strong> position, consider how these themes interact: what might become possible when they are held together, and which practical response resonates with your situation? This is a perspective for reflection, not a fixed prediction.</p></div>`;
  }
  const firstLabel=actual.length&&R?`<span class="reading-step">1 · The original card in this position</span>`:'';
  return `<article class="reading-meaning" data-position="${index}"><div class="reading-art" style="background-image:url('${whisperCardArt(card)}')" role="img" aria-label="Whisper-style artwork inspired by ${card.name}"></div><div class="reading-meaning-body"><div class="reading-meaning-head"><span>${focus}</span></div><div class="original-card-explanation">${firstLabel}<h3>Original Card · ${card.roman||card.id} · ${cardName(card)}</h3><p class="original-position-label">${focus}</p><div class="reading-astrology"><div><span>CARD CORRESPONDENCE</span><strong>${card.astrology}</strong></div><div><span>SKY AT THIS READING</span><strong>${sky.text}</strong></div></div>${readingCorrespondences(card)}<div class="keyword-row">${cardKeywords(card).slice(0,3).map(k=>`<span>${k}</span>`).join('')}</div><p class="position-context">${positionContext(card,index)}</p><p>${cardMeaning(card)}</p>${imageryInsight(card)}</div>${connected}${pendingNote}${synthesis}${[card,...actual.map(x=>x.card)].map(existingReadingLenses).join('')}<button data-reading-detail="${card.id}" data-index="${index}">Explore ${card.name} ${icon('arrow',14)}</button></div></article>`;
}

function readingLayerCards(index){
  const results=[];
  if(state.clarifierReadingAt===state.drawnAt&&state.firstLayerClarifiers?.length)results.push(cards.find(c=>c.id===state.firstLayerClarifiers[index]));
  if(state.additionalClarifierReadingAt===state.drawnAt)(state.additionalClarifierLayers||[]).filter(l=>l.number===2).forEach(l=>results.push(cards.find(c=>c.id===l.cards[index])));
  return results.filter(Boolean);
}
function numerologyForReading(chosen){
  const all=chosen.flatMap((base,i)=>[base,...readingLayerCards(i)]);
  const numbers=all.map(c=>c.number).filter(n=>Number.isInteger(n));
  const sum=numbers.reduce((a,b)=>a+b,0);
  const reduction=n=>{while(n>9)n=String(n).split('').reduce((a,b)=>a+Number(b),0);return n};
  const dice=Array.isArray(state.openingDice)&&state.openingDice.length===2?state.openingDice:null;
  const numeric=dice?ResonateDice.interpret(dice):'No opening dice were rolled for this reading.';
  const repeat=[...new Set(numbers)].filter(n=>numbers.filter(value=>value===n).length>1);
  return `<section class="reading-number-thread"><h3>Numbers through your reading</h3><p>${all.map((c,i)=>`${i?' · ':''}<strong>${c.name} (${c.number===null?c.rank:c.number})</strong>`).join('')}. ${numbers.length?`Their numbered cards sum to <strong>${sum}</strong>, reducing to <strong>${reduction(sum)}</strong>.`:'Court cards are read by rank rather than assigned an invented tarot number.'} ${numeric}</p>${repeat.length?`<p>Repeated tarot numbers: ${repeat.join(', ')}. Notice whether the cards express a shared theme through different suits.</p>`:''}<p>These numbers are symbolic prompts, not guarantees. Notice whether any patterns resonate with numbers personally meaningful to you.</p></section>`;
}
// The card-to-card thread from the production reading (main @ 8d12cc6), restored alongside the current
// Golden Thread (Chas, 31 Oct: "both", Issue #10 F1). Bridges use each card's own connections text; the two
// generic fallbacks use Deep's softer wording (PR #42 proposals P1, P2) so they suggest rather than predict.
function cardToCardThread(chosen){
  if(chosen.length<2)return '';
  const labels=positionLabels();
  const first=chosen[0],last=chosen[chosen.length-1];
  const opening=`The reading begins with ${cardName(first)} in ${labels[0]||'the opening position'} and moves toward ${cardName(last)} in ${labels[chosen.length-1]||'the final position'}.`;
  const bridges=chosen.slice(1).map((card,k)=>{
    const previous=chosen[k],index=k+1;
    const direct=(previous.connections||[]).find(connection=>normalise(connection.card)===normalise(card.name));
    const reverse=(card.connections||[]).find(connection=>normalise(connection.card)===normalise(previous.name));
    const keyword=(cardKeywords(card)[0]||'its theme').toLowerCase();
    let bridge;
    if(direct)bridge=`Read after ${previous.name}, this develops the thread: ${direct.meaning}`;
    else if(reverse)bridge=`Read after ${previous.name}, this develops the thread: ${reverse.meaning}`;
    else if(previous.arcana==='Major'&&card.arcana==='Major'&&previous.id+1===card.id)bridge=`As the next step in the Major Arcana sequence after ${previous.name}, ${card.name} invites that earlier impulse toward ${keyword}.`;
    else bridge=`Following ${previous.name}, ${card.name} may draw your attention toward ${keyword}.`;
    return `<p class="golden-card-bridge"><strong>${labels[index]||'Next'} · ${cardName(card)}.</strong> ${bridge}</p>`;
  }).join('');
  const movement=`The card-to-card movement is the heart of this reading: ${cardName(first)} opens the question, and ${cardName(last)} shows where that pattern may be heading if the present choices continue.`;
  const resonance='Keep the part that speaks to your lived situation, and use the cards as a prompt for reflection and choice.';
  return `<div class="card-to-card-thread"><div class="eyebrow">FROM CARD TO CARD</div><p class="golden-thread-opening">${opening}</p>${bridges}<p class="golden-thread-connection">${movement}</p><p class="card-to-card-close">${resonance}</p></div>`;
}
function goldenThread(chosen){
  if(!chosen.length)return '';
  const labels=positionLabels();
  const groups=chosen.map((base,i)=>{
    const others=readingLayerCards(i);
    const all=[base,...others];
    const repeats=all.filter((c,j)=>all.findIndex(p=>p.id===c.id)!==j);
    const tone=all.map(c=>`${cardName(c)} (${c.astrology||'its symbolic correspondence'})`).join(' meets ');
    const pair=c=>cardKeywords(c).slice(0,2).join(' and ').toLowerCase();
    const connections=others.length?`The original ${cardName(base)} highlights ${pair(base)}; ${others.map(c=>`${cardName(c)} introduces ${pair(c)}`).join('; ')}. Consider whether these energies support one another or ask for balance.`:`The foundation is ${pair(base)}; clarifiers can deepen this interpretation.`;
    return `<article class="golden-card-reading"><div class="golden-card-heading"><span>${labels[i]||'Guidance'}</span><strong>${all.map(cardName).join(' + ')}</strong></div><p>${connections}</p><p>The astrological correspondences in dialogue are ${tone}. These may suggest qualities in yourself, a situation, or another person's influence; they do not establish someone's zodiac sign.</p>${repeats.length?`<p><strong>Repeated card:</strong> ${[...new Set(repeats.map(c=>c.name))].join(', ')} returns in this reading. Rather than a new message, its reappearance amplifies and asks you to revisit its original theme.</p>`:''}</article>`;
  }).join('');
  const all=chosen.flatMap((c,i)=>[c,...readingLayerCards(i)]);
  const distinct=[...new Set(all.flatMap(cardKeywords))].slice(0,4);
  const reversedCount=all.filter(isReversed).length;
  const reversedNote=reversedCount?` ${reversedCount===all.length?'Every card':reversedCount===1?'One card':`${reversedCount} cards`} came up reversed and ${reversedCount===1?'is':'are'} read through ${reversedCount===1?'its':'their'} reversed meaning.`:'';
  return `<div class="golden-thread-reading"><p class="golden-thread-opening">The Golden Thread follows ${all.length} revealed card${all.length===1?'':'s'} across this reading, including every clarifier.${reversedNote}</p>${groups}${cardToCardThread(chosen)}<div class="golden-thread-summary"><span>THE OVERALL INVITATION</span><p>${distinct.length?`Across these cards, ${distinct.join(', ').toLowerCase()} form the central pattern. Which part speaks to your present circumstances, and what choice might help you respond?`:'Use the shared themes as a prompt for reflection and choice.'} This is a perspective, not a fixed prediction.</p></div>${numerologyForReading(chosen)}<p class="golden-thread-resonance">Take what resonates, and leave the rest.</p></div>`;
}
// Clarifiers follow Chas's teaching rule (Issue #13, clarifier-rules.js): a Major Arcana card gets a
// first clarifier; a second only if that clarifier is also a Major; any other card may be clarified by
// the seeker's choice. Layer arrays keep one entry per position, null where there is no clarifier.
function readingSecondLayer(){
  return state.additionalClarifierReadingAt===state.drawnAt?((state.additionalClarifierLayers||[]).find(l=>l.number===2)?.cards||[]):[];
}
function clarifierPlan(){
  const base=state.drawnCardIds.map(id=>cards.find(c=>c.id===id));
  const first=state.clarifierReadingAt===state.drawnAt?state.firstLayerClarifiers||[]:[];
  return ResonateClarifiers.plan(base,first,readingSecondLayer(),id=>cards.find(c=>c.id===id));
}
function readingUsedIds(){
  const first=state.clarifierReadingAt===state.drawnAt?state.firstLayerClarifiers||[]:[];
  return [...state.drawnCardIds,...first,...readingSecondLayer()].filter(id=>id!=null);
}
// Draws count cards that are not already in this reading.
function drawUnusedCards(count){
  if(count<=0)return [];
  const cardIds=cards.map(card=>card.id);
  const used=readingUsedIds();
  if(cardIds.length===78 && typeof ResonateDeck!=='undefined')return orientCards(ResonateDeck.drawRemaining(cardIds,used,count));
  const pool=cardIds.filter(id=>!used.includes(id));
  for(let i=pool.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
  return orientCards(pool.slice(0,count));
}
// No argument: every Major that is still waiting. With an index: the seeker's choice for that card.
function drawFirstLayerClarifiers(position){
  if(state.clarifierReadingAt!==state.drawnAt||!Array.isArray(state.firstLayerClarifiers)||state.firstLayerClarifiers.length!==state.drawnCardIds.length){
    state.firstLayerClarifiers=state.drawnCardIds.map(()=>null);
    state.clarifierReadingAt=state.drawnAt;
  }
  const plan=clarifierPlan();
  const targets=Number.isInteger(position)?(plan.positions[position]&&plan.positions[position].first==null?[position]:[]):plan.pendingFirst;
  const drawn=drawUnusedCards(targets.length);
  const next=[...state.firstLayerClarifiers];
  targets.forEach((index,k)=>{next[index]=drawn[k];});
  state.firstLayerClarifiers=next;
  state.drawSettled=true;
  renderDraw();
  if(Number.isInteger(position))document.querySelectorAll('.reading-position')[position]?.scrollIntoView({behavior:scrollMotion(),block:'center'});
  else document.querySelector?.('.spread-scroll')?.scrollIntoView({behavior:scrollMotion(),block:'start'});
}
function firstLayerClarifierView(labels){
  const ids=state.clarifierReadingAt===state.drawnAt?state.firstLayerClarifiers||[]:[];
  if(!ids.length)return '';
  return `<section class="reading-interpretation" id="firstLayerClarifiers" aria-label="First layer clarifiers"><div class="eyebrow">FIRST LAYER · CLARIFIERS</div><h2>A closer look at each position</h2><p>These additional cards offer another perspective on your original spread; they do not replace it.</p><div class="reading-meanings">${ids.map((id,i)=>{const card=cards.find(item=>item.id===id);return card?`<article class="golden-card-reading"><div class="golden-card-heading"><span>${i+1} · ${labels[i]||'Position'}</span><strong>${cardName(card)}</strong></div><p>${positionContext(card,i)}</p><p>${cardMeaning(card)}</p></article>`:'';}).join('')}</div></section>`;
}
// No argument: every position waiting for a second clarifier. With an index: that position only.
function drawNextClarifierLayer(position){
  if(state.clarifierReadingAt!==state.drawnAt || !state.firstLayerClarifiers?.length)return;
  const pending=clarifierPlan().pendingSecond;
  const targets=Number.isInteger(position)?pending.filter(i=>i===position):pending;
  if(!targets.length)return;
  if(state.additionalClarifierReadingAt!==state.drawnAt||!(state.additionalClarifierLayers||[]).some(l=>l.number===2)){
    state.additionalClarifierLayers=[{number:2,cards:state.drawnCardIds.map(()=>null)}];
    state.additionalClarifierReadingAt=state.drawnAt;
  }
  const drawn=drawUnusedCards(targets.length);
  state.additionalClarifierLayers=state.additionalClarifierLayers.map(layer=>{
    if(layer.number!==2)return layer;
    const next=[...layer.cards];
    targets.forEach((index,k)=>{next[index]=drawn[k];});
    return {number:2,cards:next};
  });
  state.drawSettled=true;
  clarifierTurnPending=true;
  try{renderDraw();}finally{clarifierTurnPending=false;}
  if(Number.isInteger(position))document.querySelectorAll('.reading-position')[position]?.scrollIntoView({behavior:scrollMotion(),block:'center'});
  else document.querySelector?.('.spread-scroll')?.scrollIntoView({behavior:scrollMotion(),block:'start'});
}
// Clarify one card (team directive, 7 Nov 2026: clarification applies to the selected card, not the whole
// spread). Draws that card's next clarifier under Chas's teaching rule: Clarifier 1 if it has none (due for a
// Major, the seeker's choice otherwise), Clarifier 2 if Clarifier 1 is a Major. Returns what it drew, or ''.
function clarifyStepFor(index){
  const spot=clarifierPlan().positions[index];
  if(!spot)return '';
  if(spot.first==null)return 'first';
  if(spot.needsSecond)return 'second';
  return '';
}
function clarifyPosition(index){
  const step=clarifyStepFor(index);
  if(step==='first')drawFirstLayerClarifiers(index);
  else if(step==='second')drawNextClarifierLayer(index);
  return step;
}
// The first card, in spread order, that the rule is waiting on (a Major without Clarifier 1, or a Major
// Clarifier 1 without Clarifier 2), or -1.
function nextDueClarifier(){
  const plan=clarifierPlan();
  const due=plan.positions.find(p=>p.needsFirst||p.needsSecond);
  return due?due.index:-1;
}
function additionalClarifierView(labels){
  if(state.additionalClarifierReadingAt!==state.drawnAt)return '';
  return (state.additionalClarifierLayers||[]).map(layer=>`<section class="reading-interpretation" id="clarifierLayer${layer.number}" aria-label="Clarifier layer ${layer.number}"><div class="eyebrow">LAYER ${layer.number} · CLARIFIERS</div><h2>Another perspective</h2><p>Each position draws from a newly shuffled tarot deck. A card may reappear across different layers.</p><div class="reading-meanings">${layer.cards.map((id,i)=>{const card=cards.find(x=>x.id===id);return card?`<article class="golden-card-reading"><div class="golden-card-heading"><span>${i+1} · ${labels[i]||'Position'}</span><strong>${cardName(card)}</strong></div><p>${positionContext(card,i)}</p><p>${cardMeaning(card)}</p></article>`:'';}).join('')}</div></section>`).join('');
}
// Set while the second clarifier layer is being drawn, so only that render turns its cards over.
let clarifierTurnPending=false;
// Every revealed clarifier stays visibly attached to the position it explains.
// After the first clarifier, the second slot already waits face down beside it at the same size,
// and the second clarifier turns over in that slot, so nothing jumps or shrinks (Chas, 28 Oct UAT).
function clarifierCardsForPosition(index){
  const layers=[];
  if(state.clarifierReadingAt===state.drawnAt && state.firstLayerClarifiers?.length && state.firstLayerClarifiers[index]!=null)
    layers.push({number:1,id:state.firstLayerClarifiers[index]});
  const second=readingSecondLayer()[index];
  if(second!=null)layers.push({number:2,id:second});
  const spot=typeof ResonateClarifiers!=='undefined'?clarifierPlan().positions[index]:null;
  if(!layers.length){
    if(spot&&spot.needsFirst)return `<button type="button" class="ghost-button clarify-choice clarify-due" data-clarify-position="${index}" aria-label="Draw Clarifier 1 for card ${index+1}, a Major Arcana card">✦ Draw Clarifier 1</button>`;
    return spot&&spot.mayChooseFirst?`<button type="button" class="ghost-button clarify-choice" data-clarify-position="${index}" aria-label="Clarify card ${index+1} (optional)">+ Clarify this card</button>`:'';
  }
  const turn=clarifierTurnPending&&!reducedMotion();
  const waiting=layers.length===1&&spot&&spot.needsSecond?`<div class="position-clarifier-slot" role="img" aria-label="Clarifier 2, not drawn yet"><span class="clarifier-back" aria-hidden="true"><span class="back-mark">R</span><small>RESONATE</small></span><span class="clarifier-layer-label">CLARIFIER 2</span><strong>Not drawn yet</strong></div>`:'';
  return `<div class="position-clarifiers" data-clarifier-count="${layers.length}" aria-label="Clarifiers for position ${index+1}">${layers.map(layer=>{
    const card=cards.find(c=>c.id===layer.id);
    const turning=turn&&layer.number===2;
    return card?`<div class="position-clarifier${turning?' clarifier-turn':''}${isReversed(card)?' is-reversed':''}"><span class="clarifier-layer-label">CLARIFIER ${layer.number}</span><img src="${cardImage(card)}" alt="${cardName(card)}, clarifier layer ${layer.number}" loading="eager" referrerpolicy="no-referrer">${turning?'<span class="clarifier-back clarifier-back-cover" aria-hidden="true"><span class="back-mark">R</span><small>RESONATE</small></span>':''}<strong>${card.roman||card.id} · ${cardName(card)}</strong></div>`:'';
  }).join('')}${waiting}</div>${waiting?`<button type="button" class="ghost-button clarify-choice clarify-due" data-clarify-position="${index}" aria-label="Draw Clarifier 2 for card ${index+1}">✦ Draw Clarifier 2</button>`:''}`;
}
// Text and label for the main clarifier button, from the rule.
// The main button now clarifies one card at a time: the first card the rule is waiting on.
function clarifierNextStep(){
  const plan=clarifierPlan();
  const due=nextDueClarifier();
  const where=i=>state.drawnCardIds.length>1?` for ${String(i+1).padStart(2,'0')} · ${positionLabels()[i]||'Position'}`:'';
  const left=plan.pendingFirst.length+plan.pendingSecond.length;
  const more=left>1?` ${left-1} more card${left===2?' is':'s are'} waiting; each is clarified on its own.`:'';
  if(due>=0&&plan.positions[due].needsFirst)return {action:'first',position:due,label:`Draw First Clarifier${where(due)}`,help:`${cardName(cards.find(c=>c.id===state.drawnCardIds[due]))} is a Major Arcana card, so it receives a clarifier.${more} You can also clarify any other card from the spread above.`};
  if(due>=0)return {action:'second',position:due,label:`Draw Second Clarifier${where(due)}`,help:`Its first clarifier is itself a Major Arcana card, so it receives a second clarifier.${more}`};
  const any=readingUsedIds().length>state.drawnCardIds.length;
  const allTwo=any&&plan.positions.every(p=>p.count===0||p.count===2);
  return {action:'save',label:'Save Reading to Journal',help:allTwo?'Your two clarifiers are complete. Save this reading to your journal for reflection.':any?'Your clarifiers are complete. Save this reading to your journal for reflection.':'No Major Arcana card needs a clarifier in this reading. You can still clarify any card, or save it for reflection.'};
}
function evolvingReading(chosen,labels){
  const sections=chosen.map((base,i)=>{
    const parts=[`<strong>${labels[i]||'Position'}: ${cardName(base)}.</strong> ${cardMeaning(base)}`];
    const layers=[];
    if(state.clarifierReadingAt===state.drawnAt && state.firstLayerClarifiers?.length)layers.push({number:1,id:state.firstLayerClarifiers[i]});
    if(state.additionalClarifierReadingAt===state.drawnAt)(state.additionalClarifierLayers||[]).forEach(layer=>layers.push({number:layer.number,id:layer.cards[i]}));
    layers.forEach(layer=>{const card=cards.find(c=>c.id===layer.id);if(card)parts.push(`<strong>Clarifier ${layer.number}: ${cardName(card)}.</strong> ${cardMeaning(card)}`);});
    return `<p>${parts.join(' ')}</p>`;
  });
  return `<section class="evolving-reading" aria-label="Evolving interpretation"><div class="eyebrow">YOUR EVOLVING READING</div><h2>How the cards speak together</h2><p>The original cards remain the foundation. Each new clarifier adds another perspective without replacing what came before.</p>${sections.join('')}<p>Notice which meanings connect with your situation. Your choices remain yours.</p></section>`;
}
function renderDraw(){
  const labels=positionLabels();
  const chosen=state.drawnCardIds.map(id=>cards.find(c=>c.id===id)).filter(Boolean);
  shell(`${backButton('Back to spreads','reading')}<section class="draw-stage multi"><div class="eyebrow">${icon('spark',15)} ${readingTitle()} · ${state.spreadSize} CARDS</div><h1>Let the cards come to you.</h1>${sampleDeckNotice()}<p class="draw-instruction" id="drawStatus">Drawing your cards…</p><div class="spread-scroll" role="region" aria-label="Card spread" tabindex="0"><div class="spread-board spread-${state.spreadSize} layout-${state.spreadId}">${chosen.map((card,i)=>`<div class="reading-position"><span class="slot-label">${String(i+1).padStart(2,'0')} · ${slotLabelHtml(labels[i]||'Position')}</span><button type="button" class="reading-card is-facedown${isReversed(card)?' is-reversed':''}" data-reading-card="${card.id}" data-index="${i}" aria-label="${i+1}. ${labels[i]} — ${cardName(card)}"><div class="reading-card-inner"><div class="reading-card-back"><div class="back-mark">R</div><small>RESONATE</small></div><div class="reading-card-front"><img src="${cardImage(card)}" alt="${cardName(card)}" referrerpolicy="no-referrer"><strong>${card.roman||card.id} · ${cardName(card)}</strong></div></div></button>${clarifierCardsForPosition(i)}</div>`).join('')}</div></div><section class="reading-interpretation" id="readingInterpretation"><div class="eyebrow">YOUR READING</div><h2>What each position is saying</h2><p class="reading-time">Planetary positions calculated for ${new Date(state.drawnAt||Date.now()).toLocaleString([], {dateStyle:'medium',timeStyle:'short'})}.</p><div class="reading-meanings">${chosen.map((card,i)=>readingMeaning(card,labels[i],i)).join('')}</div>${atmosphericArt("assets/landing-saved.jpg","Whisper atmosphere — reflecting on the whole spread")}<div class="reading-golden-thread"><div class="eyebrow">THE GOLDEN THREAD</div><h2>Read the spread as a whole</h2>${goldenThread(chosen)}</div></section><div class="reading-next-step" aria-label="Continue your reading"><p class="reading-help">${clarifierNextStep().help}</p><button type="button" class="gold-button" id="primaryClarifierAction">${clarifierNextStep().label} →</button></div><div class="draw-actions" id="drawActions"><button type="button" class="ghost-button" id="backToReadingTop">↑ Back to the spread &amp; clarifiers</button><button type="button" class="ghost-button" data-go="saved">${icon('saved',16)} View My Journal</button><button type="button" class="ghost-button" data-go="reading">${icon('spark',16)} Start a New Reading</button><button type="button" class="ghost-button" id="downloadReading">${icon('download',16)} Download Reading PDF</button></div><p class="reading-help">Return to your spread to explore clarifiers, or open your journal to revisit what you saved.</p></section>`, 'draw-page');
  bindBack();
  const cardsEls=[...document.querySelectorAll('.reading-card')]; const reduced=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const interpretation=document.getElementById('readingInterpretation');
  if(state.drawSettled){
    cardsEls.forEach(el=>{el.classList.remove('is-facedown');el.classList.add('revealed');});
    const status=document.getElementById('drawStatus'); if(status) status.textContent='Your spread is ready. Follow the reading below, or tap a card to go deeper.';
  } else {
    if(interpretation) interpretation.classList.add('waiting');
    cardsEls.forEach((el,i)=>drawTimers.push(setTimeout(()=>{el.classList.remove('is-facedown');el.classList.add('revealed'); if(i===cardsEls.length-1){state.drawSettled=true;state.drawPhase='settled';const status=document.getElementById('drawStatus');if(status)status.textContent='Your spread is ready. Follow the reading below, or tap a card to go deeper.'; if(interpretation&&document.body.contains(interpretation)) interpretation.classList.remove('waiting');}}, reduced?0:420+i*430)));
  }
  cardsEls.forEach(el=>el.onclick=()=>openCard(Number(el.dataset.readingCard),'draw',Number(el.dataset.index)));
  document.querySelectorAll('[data-reading-detail]').forEach(el=>el.onclick=()=>openCard(Number(el.dataset.readingDetail),'draw',Number(el.dataset.index)));
  document.getElementById('downloadReading').onclick=downloadReading;
  const clarifyAction=document.getElementById('primaryClarifierAction');
  if(clarifyAction)clarifyAction.onclick=()=>{const step=clarifierNextStep();if(step.action==='first'||step.action==='second')clarifyPosition(step.position);else document.getElementById('saveReadingJournal')?.click();};
  document.querySelectorAll('[data-clarify-position]').forEach(button=>button.onclick=()=>clarifyPosition(Number(button.dataset.clarifyPosition)));
  const backToReading=document.getElementById('backToReadingTop');
  if(backToReading)backToReading.onclick=()=>document.querySelector('.spread-scroll')?.scrollIntoView({block:'start',behavior:scrollMotion()});
}
async function downloadReading(){
  const button=document.getElementById('downloadReading');
  if(button){button.disabled=true;button.textContent='Preparing PDF…';}
  try{
    const chosen=state.drawnCardIds.map(id=>cards.find(c=>c.id===id));
    const textOf=html=>{const div=document.createElement('div');div.innerHTML=html.replace(/<\/(span|strong)>/g,'$& ').replace(/<\/(p|h[1-6]|div|article)>/g,'$&\n');div.querySelectorAll('button').forEach(button=>button.remove());return div.textContent.replace(/\n{3,}/g,'\n\n').trim();};
    const entry=typeof activeJournal==='function'?activeJournal():null;
    const sections=[{title:readingTitle(),text:new Date(state.drawnAt).toLocaleString([], {dateStyle:'full',timeStyle:'long'})}];
    if(state.readingAstrology&&typeof ResonateAstrology!=='undefined')sections.push({title:'Astrology snapshot · preserved session moment',text:ResonateAstrology.report(state.readingAstrology)});
    chosen.forEach((card,i)=>sections.push({title:positionLabels()[i]+' · '+cardName(card),text:textOf(readingMeaning(card,positionLabels()[i],i))}));
    sections.push({title:'The Golden Thread',text:textOf(goldenThread(chosen))});
    if(entry?.reflection)sections.push({title:'Your reflection',text:entry.reflection});
    for(const [index,note] of Object.entries(entry?.cardReflections||{}))if(note.text)sections.push({title:'Card reflection · '+positionLabels()[index],text:note.text});
    const bytes=await ResonatePDF.create(sections,new Date(state.drawnAt).getFullYear(),state.readingAstrology&&typeof ResonateAstrology!=='undefined'?ResonateAstrology.snapshot(state.readingAstrology):null);
    const url=URL.createObjectURL(new Blob([bytes],{type:'application/pdf'}));
    const link=document.createElement('a');link.href=url;link.download='resonate-tarot-reading.pdf';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }catch(error){if(button)button.textContent='PDF failed — try again';console.error('PDF export failed',error);return;}
  finally{if(button)button.disabled=false;}
  if(button)button.textContent='Download Reading PDF';
}

function infoCard(label,title,body) { return `<section class="info-card"><div class="eyebrow">${label}</div><h2>${title}</h2>${body}</section>`; }
function renderDetail() {
  const card=cards.find(c=>c.id===state.cardId)||cards[0]; const upright=state.orientation==='upright'; const keywords=upright?card.uprightKeywords:card.reversedKeywords; const meaning=upright?card.upright:card.reversed; const bookmarked=state.bookmarks.includes(card.id); const fromReading=state.returnView==='draw'&&Number.isInteger(state.readingIndex)&&state.drawnCardIds[state.readingIndex]===card.id; const role=fromReading?positionLabels()[state.readingIndex]:null; const sky=currentSky(card,fromReading?state.drawnAt:Date.now()); const skyLabel=fromReading?'SKY AT THIS READING':'CURRENT SKY';
  shell(`<div class="detail-topbar"><button class="icon-button" id="backBtn" aria-label="Return">${icon('back')}</button><div class="detail-brand">RESONATE <span>·</span> ${card.roman}</div><button class="icon-button ${bookmarked?'bookmarked':''}" id="bookmarkBtn" aria-label="Bookmark ${card.name}">${icon('bookmark')}</button></div><section class="detail-hero"><div class="detail-card-image"><img src="${cardImage(card)}" alt="${card.name}" referrerpolicy="no-referrer"></div><div class="detail-title"><div class="eyebrow">${card.arcana.toUpperCase()} ARCANA${card.suit?' · '+card.suit:''}</div>${fromReading?`<div class="eyebrow reading-role">${readingTitle()} · Position ${state.readingIndex+1} of ${state.drawnCardIds.length}</div>`:''}<h1>${role?`${role} — `:''}${card.name}</h1><p>${card.subtitle}</p><div class="correspondence-row"><span>${card.astrology}</span><span>${card.number===null?card.rank:"Number "+card.number}</span><span>${card.element}</span></div></div></section><section class="content-grid three top-correspondences">${infoCard('ASTROLOGY',card.astrology,`<p>${card.astrology} shapes the card's symbolic rhythm and mode of expression.</p>`)}${infoCard(card.number===null?'COURT RANK':'NUMBER',String(card.number===null?card.rank:card.number),`<p>${card.numerology}</p>`)}${infoCard('ELEMENT',card.element,`<p>${card.element} describes the elemental field through which this card most naturally operates.</p>`)}</section><section class="reading-astrology detail-astrology" aria-label="Card astrology and planetary position"><div><span>CARD CORRESPONDENCE</span><strong>${card.astrology}</strong></div><div><span>${skyLabel}</span><strong>${sky.text}</strong></div></section>${atmosphericArt(whisperCardArt(card),`Whisper artwork inspired by ${card.name}`)}<section class="meaning-panel"><div class="orientation-tabs"><button id="uprightTab" class="${upright?'active':''}">UPRIGHT MEANING</button><button id="reversedTab" class="${!upright?'active':''}">REVERSED MEANING</button></div><div class="keyword-row large">${keywords.map(k=>`<span>${k}</span>`).join('')}</div>${fromReading?`<h2 class="reading-role">${role}</h2><p class="position-context">${positionContext(card,state.readingIndex,upright)}</p>`:''}<p class="meaning-copy">${meaning}</p></section><section class="detail-insight-grid">${infoCard('VISUAL SYMBOLISM','What the image is saying',`<p>${card.symbolism}</p>`)}${infoCard('SPIRITUAL INTERPRETATION','The deeper invitation',`<p>${card.spiritual}</p>`)}${infoCard('TAO / WU WEI','Wu Wei',`<p>${card.wuWei}</p>`)}</section>${atmosphericArt("assets/landing-learn.jpg","Whisper atmosphere — symbols and connections")}<section class="connections-card"><div class="eyebrow">${icon('spark',14)} CONNECTIONS</div><h2>How this card changes in relationship</h2><div class="connection-list">${card.connections.map(c=>`<div class="connection"><div><span>WITH</span><strong>${c.card}</strong></div><section><h3>${c.title}</h3><p>${c.meaning}</p></section></div>`).join('')}</div></section><section class="reflection-card"><div class="eyebrow">YOUR REFLECTION</div><h2>What resonates?</h2><p class="journal-prompt">${card.journalPrompt}</p><textarea id="noteField" placeholder="Write without editing yourself…">${escapeHtml(state.notes[card.id]||'')}</textarea><div class="reflection-note">Saved privately in this browser</div></section>${atmosphericArt("assets/landing-saved.jpg","Whisper atmosphere — the inner journey")}<section class="golden-thread">${infoCard('THE GOLDEN THREAD · JUNGIAN / PSYCHOLOGICAL','Jungian Arc',`<p>${card.psychological}</p><small>This is the final interpretive lens: not a replacement for the traditional card meaning, but the thread connecting symbol, psyche and lived experience.</small>`)}</section><nav class="deck-nav"><button id="prevBtn">${icon('back')} Previous card</button><div><span>${fromReading?state.readingIndex+1:card.id+1}</span> / ${fromReading?state.drawnCardIds.length:cards.length}</div><button id="nextBtn">Next card ${icon('arrow')}</button></nav>`, 'detail-page');
  if(fromReading){
    document.getElementById('backBtn').setAttribute('aria-label','Return to reading');
    if(state.readingIndex===0) document.getElementById('prevBtn').innerHTML=icon('back')+' Return to reading';
    if(state.readingIndex===state.drawnCardIds.length-1) document.getElementById('nextBtn').innerHTML='Return to reading '+icon('arrow');
  }
  document.getElementById('backBtn').onclick=()=>go(state.returnView||'learn');
  document.getElementById('bookmarkBtn').onclick=()=>{state.bookmarks=bookmarked?state.bookmarks.filter(id=>id!==card.id):[...state.bookmarks,card.id];save();renderDetail();};
  document.getElementById('uprightTab').onclick=()=>{state.orientation='upright';renderDetail();}; document.getElementById('reversedTab').onclick=()=>{state.orientation='reversed';renderDetail();};
  document.getElementById('noteField').oninput=e=>{state.notes[card.id]=e.target.value;save();}; document.getElementById('prevBtn').onclick=()=>navigate(card,-1);document.getElementById('nextBtn').onclick=()=>navigate(card,1);
}
function navigate(card,delta){
  if(state.returnView==='draw'&&state.readingReturn)Object.assign(state,JSON.parse(JSON.stringify(state.readingReturn.reading)));
  if(state.returnView==='draw'&&Number.isInteger(state.readingIndex)){
    const next=state.readingIndex+delta;
    if(next<0||next>=state.drawnCardIds.length){go('draw');return;}
    openCard(state.drawnCardIds[next],'draw',next);return;
  }const i=cards.findIndex(c=>c.id===card.id);const n=(i+delta+cards.length)%cards.length;state.cardId=cards[n].id;state.orientation='upright';renderDetail();window.scrollTo({top:0,behavior:scrollMotion()});}
function renderSaved(){
  const saved=cards.filter(c=>state.bookmarks.includes(c.id)||state.notes[c.id]);
  shell(`${backButton('Home','home')}<section class="section-hero"><div class="eyebrow">YOUR PERSONAL JOURNAL</div><h1>Your bookmarks & reflections.</h1><p>Stored privately in this browser.</p></section>${saved.length?`<section class="card-grid">${saved.map(cardTile).join('')}</section>`:`<section class="empty"><h3>Nothing saved yet</h3><p>Bookmark a card or write a reflection and it will appear here.</p><button class="gold-button" data-go="learn">Learn the Cards</button></section>`}`, 'page-home');
  bindBack();document.querySelectorAll('[data-card]').forEach(btn=>btn.onclick=()=>openCard(Number(btn.dataset.card),'saved'));
}
function render(){ if(state.view==='home')renderHome(); else if(state.view==='learn')renderLearn(); else if(state.view==='reading')renderReadingHub(); else if(state.view==='draw')renderDraw(); else if(state.view==='saved')renderSaved(); else renderDetail(); }
render();
