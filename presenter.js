/* Max Chasroom: a deliberately synthetic presenter for a finished reading, in any spread (UAT preview).
   Loaded only by presenter-uat.html, after the app. It narrates the reading the app has already written:
   every interpretive line is lifted word for word from readingMeaning()/goldenThread(), the same functions
   the page and the PDF use. Max's own lines (FRAME) are framing only; they never interpret. Labels only
   name a position and a card. Kept short for a phone: per card, one line on the position and one on the card.
   Clarifiers are separate chapters, so a clarifier drawn later can be heard on its own.
   Voice: a pre-recorded voice pack if one covers the whole script, else the device's own on-device speech,
   else captions alone. Nothing is sent anywhere. */
(function(){
  const DEMO={at:'2026-10-28T09:00:00.000Z',spreadId:'guidance',base:1,clarifiers:[2,3]};
  // Every line Max may say that is not quoted from the reading or a label. Tests check nothing else is spoken.
  const FRAME={
    open:'Good evening. Max Chasroom here, a deliberately synthetic presenter, assembled from pixels and good intentions.',
    demo:'Tonight\'s reading is a demonstration. These cards were chosen for this demo, not drawn for you.',
    short:'I\'ll keep it short. The full reading stays below.',
    card:'First, your card.',
    cards:'Let\'s go through your cards, one position at a time.',
    c1:'Now, your first clarifier.',
    c1s:'Now, your first clarifiers, one for each position.',
    c2:'And your second clarifier.',
    c2s:'And your second clarifiers.',
    back:'Max Chasroom, back for the next part of your reading.',
    ask:'Before I go, one question to carry with you.',
    close:'That\'s the short version. Every word of the full reading is below, and in your PDF. Max Chasroom, signing off.'
  };
  const isDemo=()=>state.drawnAt===DEMO.at&&!state.journalId&&state.drawnCardIds.length===1&&state.drawnCardIds[0]===DEMO.base;
  const norm=text=>String(text).replace(/\s+/g,' ').trim();
  const sentences=text=>norm(text).split(/(?<=[.?!])\s+(?=[A-Z])/).filter(Boolean);
  const frag=html=>{const div=document.createElement('div');div.innerHTML=html;return div;};
  const byId=id=>cards.find(c=>c.id===id);
  // Clarifier layers drawn for this reading: [[layer 1 card per position], [layer 2 card per position]].
  function layers(){
    const out=[];
    if(state.clarifierReadingAt===state.drawnAt&&state.firstLayerClarifiers?.length)out.push(state.firstLayerClarifiers.map(byId));
    if(state.additionalClarifierReadingAt===state.drawnAt)(state.additionalClarifierLayers||[]).filter(l=>l.number===2).forEach(l=>out.push(l.cards.map(byId)));
    return out;
  }
  function provenance(){
    const when=new Date(state.drawnAt).toLocaleString([], {dateStyle:'medium',timeStyle:'short'});
    if(isDemo())return 'Demonstration reading · synthetic · not drawn for you';
    if(state.journalId)return `From your Journal · ${readingTitle()} · ${when}`;
    return `This reading · ${readingTitle()} · ${when} · not saved yet`;
  }

  // The script: [{kind:'frame'|'label'|'quote'|'link', chapter, text, show:[slot keys], clips:[{id,text}]}].
  // Slot keys: 'p<i>' for the card in position i, 'c<i>-<n>' for clarifier n of position i.
  // Clips split each caption into lines that depend on one card or one position at most, so they can be
  // recorded ahead of time (tools/voice).
  function buildScript(){
    const ids=state.drawnCardIds,labels=positionLabels(),spread=state.spreadId,one=ids.length===1;
    const layerCards=layers();
    const script=[];
    const add=(chapter,kind,text,show,clips)=>{if(text)script.push({chapter,kind,text,show,clips:clips||[{id:'',text}]});};
    const frame=(chapter,key,show=[])=>add(chapter,'frame',FRAME[key],show,[{id:'frame-'+key,text:FRAME[key]}]);
    const spoken=label=>label.replace(/ · /g,', ');
    const pos=i=>({id:`pos-${spread}-${i}`,text:spoken(labels[i]||'Position')+':'});

    frame('intro','open');
    if(isDemo())frame('intro','demo');
    add('intro','label',`Tonight: your ${readingTitle()}.`,[],[{id:`title-${spread}`,text:`Tonight: your ${readingTitle()}.`}]);
    frame('intro','short');

    // Cards: the reading's own text for each position, from the same markup the page shows.
    frame('cards',one?'card':'cards');
    const blocks=ids.map((id,i)=>frag(readingMeaning(byId(id),labels[i],i)));
    ids.forEach((id,i)=>{
      const card=byId(id),block=blocks[i],key='p'+i;
      if(!one)add('cards','label',`${labels[i]}: ${card.name}.`,[key],[pos(i),{id:`name-${id}`,text:`${card.name}.`}]);
      else add('cards','label',`${card.name}.`,[key],[{id:`name-${id}`,text:`${card.name}.`}]);
      // How this card follows the one before: the cards' own authored connection where data.js has one,
      // otherwise a plain fact from the card data (same suit, both Major Arcana, same element), else nothing.
      if(i>0)linkLine(byId(ids[i-1]),card,['p'+(i-1),key]);
      // The position lens: its first sentence after "Position: <role> — <card>."
      const lens=sentences(block.querySelector('.original-card-explanation .position-context')?.textContent||'')[1];
      add('cards','quote',lens,[key],[{id:`lens-${spread}-${i}-${id}`,text:lens}]);
      const meaning=sentences(block.querySelector('.original-card-explanation .position-context + p')?.textContent||'')[0];
      add('cards','quote',meaning,[key],[{id:`meaning-${id}`,text:meaning}]);
    });

    function linkLine(prev,card,show){
      const same=(a,b)=>normalise(a)===normalise(b);
      const authored=(card.connections||[]).find(c=>same(c.card,prev.name))||(prev.connections||[]).find(c=>same(c.card,card.name));
      if(authored){add('cards','link',authored.meaning,show,[{id:`conn-${[prev.id,card.id].sort((a,b)=>a-b).join('-')}`,text:authored.meaning}]);return;}
      const like={id:`like-${prev.id}`,text:`Like ${prev.name},`};
      let tail=null;
      if(prev.suit&&prev.suit===card.suit)tail={id:`is-suit-${card.suit}`,text:`this is a ${card.suit} card.`};
      else if(prev.arcana==='Major'&&card.arcana==='Major')tail={id:'is-major',text:'this is a Major Arcana card.'};
      else if(prev.element&&prev.element===card.element)tail={id:`is-element-${card.element}`,text:`this card carries the element of ${card.element}.`};
      if(tail)add('cards','link',`${like.text} ${tail.text}`,show,[like,tail]);
    }

    // Clarifiers: one chapter per layer, each card's first meaning line as written in its position.
    layerCards.forEach((layer,l)=>{
      const n=l+1,chapter='c'+n;
      frame(chapter,one?'c'+n:'c'+n+'s',layer.map((_,i)=>`c${i}-${n}`));
      layer.forEach((c,i)=>{
        if(!c)return;
        const key=`c${i}-${n}`;
        const label=one?`Clarifier ${n}: ${c.name}.`:`Clarifier ${n} · ${labels[i]}: ${c.name}.`;
        add(chapter,'label',label,['p'+i,key],[{id:`label-clarifier-${n}`,text:`Clarifier ${n}${one?':':','}`},...(one?[]:[pos(i)]),{id:`name-${c.id}`,text:`${c.name}.`}]);
        const block=blocks[i].querySelectorAll('.integrated-clarifier')[l];
        const meaning=sentences(block?.querySelector(':scope > p')?.textContent||'')[0];
        add(chapter,'quote',meaning,[key],[{id:`meaning-${c.id}`,text:meaning}]);
      });
    });

    // Close: the reading's own closing question and resonance line.
    const all=ids.flatMap((_,i)=>['p'+i,...layerCards.map((__,l)=>`c${i}-${l+1}`)]);
    const thread=frag(goldenThread(ids.map(byId)));
    const invitation=sentences(thread.querySelector('.golden-thread-summary p')?.textContent||'');
    const ask=invitation.findIndex(t=>/^Which part speaks/.test(t));
    if(ask>=0){frame('close','ask',all);add('close','quote',invitation.slice(ask).join(' '),all,invitation.slice(ask).map((text,i)=>({id:`thread-${i}`,text})));}
    const resonance=norm(thread.querySelector('.golden-thread-resonance')?.textContent||'');
    add('close','quote',resonance,all,[{id:'thread-resonance',text:resonance}]);
    frame('close','close',all);
    return script;
  }
  // What a launcher plays: the whole reading, or one clarifier chapter followed by the close.
  function playlist(script,chapter){
    if(!chapter)return script;
    const back={chapter:'intro',kind:'frame',text:FRAME.back,show:[],clips:[{id:'frame-back',text:FRAME.back}]};
    return [back,...script.filter(p=>p.chapter===chapter||p.chapter==='close')];
  }

  // Pre-recorded voice (voice/chas/manifest.json), used only when every clip a script needs is there.
  const VOICE_DIR='voice/chas/';
  let voicePack;
  async function loadVoicePack(){
    if(voicePack!==undefined)return voicePack;
    try{const res=await fetch(VOICE_DIR+'manifest.json',{cache:'no-cache'});voicePack=res.ok?await res.json():null;}catch{voicePack=null;}
    return voicePack;
  }
  const packCovers=(pack,script)=>!!pack?.clips&&script.every(part=>part.clips.every(clip=>clip.id&&pack.clips[clip.id]));

  // Only on-device voices: a network voice (such as Chrome's "Google" voices) would send the reading away.
  function localVoice(){
    const voices=window.speechSynthesis?.getVoices?.().filter(v=>v.localService&&/^en/i.test(v.lang))||[];
    return voices.find(v=>/en-GB/i.test(v.lang))||voices[0]||null;
  }
  const spokenText=text=>text.replace(/ · /g,', ').replace(/ — /g,', ');

  // The cards on the player: each position's card, with its clarifiers small underneath (1 left, 2 right),
  // matching the reading page. A strip that scrolls sideways when the spread is wider than the phone.
  function cardStrip(){
    const labels=positionLabels(),layerCards=layers();
    const img=(c,cls)=>`<img class="${cls}" src="${cardImage(c)}" alt="${escapeHtml(c.name)}" referrerpolicy="no-referrer">`;
    return `<ol class="mc-cards${state.drawnCardIds.length>3?' is-wide':''}" aria-label="Cards in this reading">${state.drawnCardIds.map((id,i)=>{
      const c=byId(id);
      const clar=layerCards.map((layer,l)=>layer[i]?`<li class="mc-clar" data-slot="c${i}-${l+1}">${img(layer[i],'')}<span>Clarifier ${l+1}</span><strong>${escapeHtml(layer[i].name)}</strong></li>`:'').join('');
      return `<li class="mc-card" data-slot="p${i}">${img(c,'mc-main')}<span>${escapeHtml(labels[i]||'Position')}</span><strong>${escapeHtml(c.name)}</strong>${clar?`<ol class="mc-clars">${clar}</ol>`:''}</li>`;
    }).join('')}</ol>`;
  }

  let player=null;
  async function openPlayer(chapter){
    if(player)return;
    player={pending:true};
    const full=buildScript(),script=playlist(full,typeof chapter==='string'?chapter:null);
    const pack=packCovers(await loadVoicePack(),script)?voicePack:null;
    const opener=document.activeElement;
    const what=typeof chapter==='string'?` · Clarifier ${chapter.slice(1)}`:'';
    document.body.insertAdjacentHTML('beforeend',`<div class="mc-player" role="dialog" aria-modal="true" aria-labelledby="mcTitle">
      <div class="mc-frame">
        <header class="mc-head"><h2 id="mcTitle">MAX CHASROOM <span>· RESONATE</span></h2><button type="button" class="mc-close" id="mcClose" aria-label="Close the presenter">✕</button></header>
        <p class="mc-provenance">${escapeHtml(provenance()+what)}</p>
        <div class="mc-stage">
          <div class="mc-screen" aria-hidden="true">${avatarSvg()}<span class="mc-tag">TEMPORARY PRESENTER · NOT CHAS'S LIKENESS</span></div>
          ${cardStrip()}
        </div>
        <div class="mc-caption" id="mcCaption" aria-live="polite"><p>Press Play when you're ready. Nothing plays until you do.</p></div>
        <div class="mc-progress"><span id="mcPart">Part 0 of ${script.length}</span><div class="mc-bar"><i id="mcBar"></i></div></div>
        <div class="mc-controls">
          <button type="button" class="gold-button" id="mcPlay">▶ Play</button>
          <button type="button" class="ghost-button" id="mcReplay">↺ Replay</button>
          <button type="button" class="ghost-button" id="mcSound" aria-pressed="true">🔇 Mute</button>
          <button type="button" class="ghost-button" id="mcCaptions" aria-pressed="true">Hide words</button>
        </div>
        <p class="mc-voice" id="mcVoice"></p>
        <details class="mc-transcript"><summary>Transcript</summary><ol>${script.map(p=>`<li class="mc-kind-${p.kind}">${escapeHtml(p.text)}</li>`).join('')}</ol></details>
        <button type="button" class="mc-full" id="mcFull">Read the full reading ↓</button>
      </div></div>`);
    const root=document.querySelector('.mc-player');
    const $=id=>root.querySelector('#'+id);
    let index=-1,playing=false,muted=false,captions=true,timer=null,token=0,clip=0;
    const audio=pack?new Audio():null;
    const voiceNote=()=>{$('mcVoice').textContent=muted?'Sound is off. Captions keep time on their own.':pack?`${pack.label}. Pre-recorded, so nothing is sent anywhere.`:localVoice()?`Temporary voice: your device's built-in speech (${localVoice().name}). Nothing is sent anywhere.`:'No on-device voice was found on this device, so Max is on captions only. Nothing is sent anywhere.';};
    voiceNote();window.speechSynthesis?.addEventListener?.('voiceschanged',voiceNote);
    const stopSound=()=>{clearTimeout(timer);token++;try{window.speechSynthesis?.cancel();}catch{}if(audio){audio.onended=audio.onerror=null;audio.pause();}root.classList.remove('is-talking');};
    const motion=()=>window.matchMedia?.('(prefers-reduced-motion: reduce)').matches?'auto':'smooth';
    function show(i){
      const part=script[i];
      $('mcCaption').innerHTML=`<p class="mc-kind-${part.kind}">${escapeHtml(part.text)}</p>`;
      $('mcPart').textContent=`Part ${i+1} of ${script.length}`;
      $('mcBar').style.width=`${(i+1)/script.length*100}%`;
      let focus=null;
      root.querySelectorAll('[data-slot]').forEach(el=>{const on=part.show.includes(el.dataset.slot);el.classList.toggle('is-active',on);el.classList.toggle('is-dim',part.show.length>0&&!on);if(on&&!focus)focus=el;});
      // Keep the card being discussed in view on a wide spread, sideways only.
      const strip=root.querySelector('.mc-cards');
      if(focus&&strip&&strip.scrollWidth>strip.clientWidth&&part.show.length<=2){
        const target=(focus.closest('.mc-card')||focus);
        strip.scrollTo({left:target.offsetLeft-(strip.clientWidth-target.offsetWidth)/2,behavior:motion()});
      }
    }
    // from: the clip to start at, so Resume carries on where Pause stopped in a recorded line.
    function playPart(i,from=0){
      stopSound();index=i;clip=from;
      if(i>=script.length){finish();return;}
      show(i);root.classList.add('is-talking');
      const mine=token,next=()=>{if(mine===token&&playing)playPart(i+1);};
      const voice=!muted&&!pack&&localVoice();
      if(pack&&!muted){
        const playClip=()=>{
          if(mine!==token)return;
          if(clip>=script[i].clips.length){next();return;}
          audio.src=VOICE_DIR+pack.clips[script[i].clips[clip].id];
          audio.onended=()=>{clip++;playClip();};
          audio.onerror=()=>{clip++;playClip();};
          audio.play().catch(()=>{if(mine===token){clip++;playClip();}});
        };
        playClip();
      } else if(voice){
        const utterance=new SpeechSynthesisUtterance(spokenText(script[i].text));
        utterance.voice=voice;utterance.lang=voice.lang;utterance.rate=1;utterance.pitch=0.85;
        const words=script[i].text.split(' ').length;
        const guard=()=>{timer=setTimeout(()=>{if(mine===token&&!window.speechSynthesis.speaking)next();else if(mine===token)guard();},Math.max(4000,words*700));};
        utterance.onend=next;utterance.onerror=e=>{if(e?.error!=='interrupted'&&e?.error!=='canceled')next();};
        timer=setTimeout(()=>{if(mine!==token)return;window.speechSynthesis.speak(utterance);guard();},120);
      } else timer=setTimeout(next,Math.min(12000,Math.max(2600,script[i].text.split(' ').length*400)));
    }
    function finish(){playing=false;stopSound();index=-1;$('mcPlay').textContent='▶ Play again';$('mcCaption').innerHTML='<p>That was the short version. The full reading is waiting below.</p>';root.classList.add('is-finished');}
    function setPlaying(on){
      playing=on;root.classList.toggle('is-playing',on);root.classList.remove('is-finished');
      $('mcPlay').textContent=on?'❚❚ Pause':'▶ Resume';
      if(on)playPart(index<0?0:index,pack&&!muted&&index>=0?clip:0);else stopSound();
    }
    $('mcPlay').onclick=()=>setPlaying(!playing);
    $('mcReplay').onclick=()=>{index=0;clip=0;root.scrollTo?.({top:0});root.querySelector('.mc-cards')?.scrollTo?.({left:0});setPlaying(true);};
    $('mcSound').onclick=()=>{muted=!muted;$('mcSound').textContent=muted?'🔊 Unmute':'🔇 Mute';$('mcSound').setAttribute('aria-pressed',String(!muted));voiceNote();if(playing)playPart(index);};
    $('mcCaptions').onclick=()=>{captions=!captions;root.classList.toggle('captions-off',!captions);$('mcCaptions').textContent=captions?'Hide words':'Show words';$('mcCaptions').setAttribute('aria-pressed',String(captions));};
    const close=()=>{playing=false;stopSound();window.speechSynthesis?.removeEventListener?.('voiceschanged',voiceNote);root.remove();player=null;document.removeEventListener('keydown',onKey);opener?.focus?.();};
    const onKey=e=>{if(e.key==='Escape')close();};
    document.addEventListener('keydown',onKey);
    $('mcClose').onclick=close;
    $('mcFull').onclick=()=>{close();document.getElementById('readingInterpretation')?.scrollIntoView({block:'start',behavior:scrollMotion()});};
    $('mcPlay').focus();
    player={script,root,pack,chapter:typeof chapter==='string'?chapter:null};
  }

  // An original retro presenter: angular gold-edged head on a scan-lined screen. Not anyone's likeness.
  function avatarSvg(){
    return `<svg class="mc-avatar" viewBox="0 0 200 220" role="presentation">
      <defs><linearGradient id="mcSkin" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#3a3326"/><stop offset="1" stop-color="#16130d"/></linearGradient></defs>
      <path class="mc-collar" d="M30 220 L62 170 L100 196 L138 170 L170 220 Z"/>
      <path class="mc-lapel" d="M62 170 L100 220 L86 220 Z M138 170 L100 220 L114 220 Z"/>
      <g class="mc-head-group">
        <path class="mc-skin" d="M58 70 L70 38 L100 28 L130 38 L142 70 L138 120 L122 150 L100 160 L78 150 L62 120 Z"/>
        <path class="mc-hair" d="M56 72 L62 34 L100 18 L140 34 L144 72 L132 50 L100 42 L68 50 Z"/>
        <rect class="mc-visor" x="64" y="76" width="72" height="20" rx="3"/>
        <path class="mc-glint" d="M70 80 L84 80 L80 85 Z M112 80 L126 80 L122 85 Z"/>
        <path class="mc-edge" d="M100 96 L94 118 L104 118"/>
        <g class="mc-mouth"><rect class="mc-lip" x="84" y="130" width="32" height="4" rx="1"/><rect class="mc-jaw" x="86" y="134" width="28" height="4" rx="1"/></g>
      </g></svg>`;
  }

  function launcher(){
    const interpretation=document.getElementById('readingInterpretation');
    if(!interpretation||!state.drawnCardIds?.length)return;
    const drawn=layers().length;
    const extra=[1,2].filter(n=>n<=drawn).map(n=>`<button type="button" class="ghost-button" data-mc-chapter="c${n}">▶ Hear Clarifier ${n}</button>`).join('');
    // At the top of the reading, straight under its heading, so it is seen without scrolling on a phone.
    const anchor=document.querySelector('.mc-demo-banner')||document.querySelector('.draw-stage h1');
    (anchor||interpretation).insertAdjacentHTML(anchor?'afterend':'beforebegin',`<section class="mc-launch"><div class="eyebrow">MAX CHASROOM · PRESENTER PREVIEW</div><p>A short spoken walk through this reading. The full reading stays below.</p><button type="button" class="gold-button" id="mcOpen">▶ Watch Max Chasroom present this reading</button>${extra?`<div class="mc-launch-more">${extra}</div>`:''}</section>`);
    document.getElementById('mcOpen')?.addEventListener('click',()=>openPlayer());
    document.querySelectorAll('[data-mc-chapter]').forEach(b=>b.addEventListener('click',()=>openPlayer(b.dataset.mcChapter)));
  }
  function demoBanner(){
    if(!isDemo())return;
    document.querySelector('.draw-stage h1')?.insertAdjacentHTML('afterend','<p class="mc-demo-banner" role="note"><strong>DEMONSTRATION READING · SYNTHETIC</strong> These cards were chosen for this demo, not drawn for you.</p>');
    // A synthetic reading must not land in the Journal as if it were real.
    const journal=document.querySelector('.reading-journal');
    if(journal)journal.innerHTML='<div class="eyebrow">YOUR PERSONAL JOURNAL</div><p>Saving is turned off for the demonstration reading. Draw your own reading to save it.</p>';
  }
  const presenterRenderDraw=renderDraw;
  renderDraw=function(){const outcome=presenterRenderDraw.apply(this,arguments);demoBanner();launcher();return outcome;};

  function loadDemo(){
    Object.assign(state,{spreadId:DEMO.spreadId,spreadSize:1,drawnCardIds:[DEMO.base],drawnAt:DEMO.at,journalId:null,journalSpread:null,readingReturn:null,
      readingAstrology:null,readingStartedAt:null,openingDice:null,astrologyOff:true,
      clarifierReadingAt:DEMO.at,firstLayerClarifiers:[DEMO.clarifiers[0]],additionalClarifierReadingAt:DEMO.at,additionalClarifierLayers:[{number:2,cards:[DEMO.clarifiers[1]]}],
      readingIndex:null,drawSettled:true,drawPhase:'settled'});
    go('draw');
  }
  window.ResonatePresenter={buildScript,playlist,FRAME,DEMO,VOICE_DIR,isDemo,loadDemo,openPlayer,get player(){return player&&!player.pending?player:null;}};
  // The page now opens as the normal app, for real readings in any spread. ?demo loads the synthetic demo.
  if(/[?&]demo\b/.test(location.search))loadDemo();
})();
