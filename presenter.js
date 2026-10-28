/* Max Chasroom: a deliberately synthetic presenter for a finished One-card Guidance reading (UAT demo).
   Loaded only by presenter-uat.html, after the app. It narrates the reading the app has already written:
   every interpretive line is lifted word for word from readingMeaning()/goldenThread(), the same functions
   the page and the PDF use. Max's own lines (FRAME) are framing and jokes only; they never interpret.
   Voice is the device's own on-device speech synthesis; if none is available it runs on captions alone. */
(function(){
  const DEMO={at:'2026-10-28T09:00:00.000Z',spreadId:'guidance',base:1,clarifiers:[2,3]};
  // Every line Max may say that is not quoted from the reading. Tests check nothing else is ever spoken.
  const FRAME={
    open:'Good evening. Max Chasroom here, a deliberately synthetic presenter, assembled from pixels and good intentions.',
    demo:'Tonight\'s reading is a demonstration. These cards were chosen for this demo, not drawn for you.',
    yours:'Tonight, your One-card Guidance. I\'ll keep it short. The full reading stays below.',
    card:'First, your card.',
    thread:'And now, the Golden Thread, which ties it all together.',
    close:'That\'s the short version. Every word of the full reading is below, and in your PDF. Max Chasroom, signing off.'
  };
  const isDemo=()=>state.drawnAt===DEMO.at&&!state.journalId&&state.drawnCardIds.length===1&&state.drawnCardIds[0]===DEMO.base;
  const norm=text=>String(text).replace(/\s+/g,' ').trim();
  const sentences=text=>norm(text).split(/(?<=[.?!])\s+(?=[A-Z])/).filter(Boolean);
  const frag=html=>{const div=document.createElement('div');div.innerHTML=html;return div;};
  const first=(el,n=1)=>el?sentences(el.textContent).slice(0,n).join(' '):'';

  function provenance(){
    const when=new Date(state.drawnAt).toLocaleString([], {dateStyle:'medium',timeStyle:'short'});
    if(isDemo())return 'Demonstration reading · synthetic · not drawn for you';
    if(state.journalId)return `From your Journal · ${readingTitle()} · ${when}`;
    return `This reading · ${readingTitle()} · ${when} · not saved yet`;
  }
  // The script: [{kind:'frame'|'label'|'quote', text, show:[card slot indexes]}].
  function buildScript(){
    const card=cards.find(c=>c.id===state.drawnCardIds[0]);
    const label=positionLabels()[0];
    const meaning=frag(readingMeaning(card,label,0)),thread=frag(goldenThread([card]));
    const clarifiers=readingLayerCards(0);
    const all=[0,...clarifiers.map((_,i)=>i+1)];
    const script=[{kind:'frame',text:FRAME.open,show:[]},{kind:'frame',text:isDemo()?FRAME.demo:FRAME.yours,show:[]},{kind:'frame',text:FRAME.card,show:[0]}];
    const quote=(text,show)=>{if(text)script.push({kind:'quote',text,show});};
    quote(first(meaning.querySelector('.original-card-explanation .position-context'),2),[0]);
    quote(first(meaning.querySelector('.original-card-explanation .position-context + p'),2),[0]);
    meaning.querySelectorAll('.integrated-clarifier').forEach((block,i)=>{
      script.push({kind:'label',text:`Clarifier ${i+1}: ${clarifiers[i].name}.`,show:[i+1]});
      quote(first(block.querySelector(':scope > p')),[i+1]);
      const conversation=[...block.querySelectorAll('.symbolism-insight')].find(p=>/^The conversation between them/.test(norm(p.textContent)));
      if(conversation){conversation.querySelector('strong')?.remove();quote(first(conversation),[0,i+1]);}
    });
    quote(first(meaning.querySelector('.combined-meaning p'),2),all);
    script.push({kind:'frame',text:FRAME.thread,show:all});
    quote(first(thread.querySelector('.golden-thread-summary p'),3),all);
    quote(norm(thread.querySelector('.golden-thread-resonance')?.textContent||''),all);
    script.push({kind:'frame',text:FRAME.close,show:all});
    return script;
  }

  // Only on-device voices: a network voice (such as Chrome's "Google" voices) would send the reading away.
  function localVoice(){
    const voices=window.speechSynthesis?.getVoices?.().filter(v=>v.localService&&/^en/i.test(v.lang))||[];
    return voices.find(v=>/en-GB/i.test(v.lang))||voices[0]||null;
  }
  const spoken=text=>text.replace(/ · /g,', ');

  let player=null;
  function openPlayer(){
    const script=buildScript();
    const slots=[cards.find(c=>c.id===state.drawnCardIds[0]),...readingLayerCards(0)];
    const slotNames=[positionLabels()[0],'Clarifier 1','Clarifier 2'];
    // Same left-to-right order as the One-card spread on the page: Clarifier 1, the card, Clarifier 2.
    const order=i=>slots.length>1?[1,0,2][i]:i;
    const opener=document.activeElement;
    document.body.insertAdjacentHTML('beforeend',`<div class="mc-player" role="dialog" aria-modal="true" aria-labelledby="mcTitle">
      <div class="mc-frame">
        <header class="mc-head"><h2 id="mcTitle">MAX CHASROOM <span>· RESONATE</span></h2><button type="button" class="mc-close" id="mcClose" aria-label="Close the presenter">✕</button></header>
        <p class="mc-provenance">${escapeHtml(provenance())}</p>
        <div class="mc-stage">
          <div class="mc-screen" aria-hidden="true">${avatarSvg()}<span class="mc-tag">TEMPORARY PRESENTER · NOT CHAS'S LIKENESS</span></div>
          <ol class="mc-cards" aria-label="Cards in this reading">${slots.map((c,i)=>[c,i]).sort((a,b)=>order(a[1])-order(b[1])).map(([c,i])=>`<li class="mc-card" data-slot="${i}"><img src="${cardImage(c)}" alt="${escapeHtml(c.name)}" referrerpolicy="no-referrer"><span>${escapeHtml(slotNames[i])}</span><strong>${escapeHtml(c.name)}</strong></li>`).join('')}</ol>
        </div>
        <div class="mc-caption" id="mcCaption" aria-live="polite"><p>Press Play when you're ready. Nothing plays until you do.</p></div>
        <div class="mc-progress"><span id="mcPart">Part 0 of ${script.length}</span><div class="mc-bar"><i id="mcBar"></i></div></div>
        <div class="mc-controls">
          <button type="button" class="gold-button" id="mcPlay">▶ Play</button>
          <button type="button" class="ghost-button" id="mcReplay">↺ Replay</button>
          <button type="button" class="ghost-button" id="mcSound" aria-pressed="true">Sound on</button>
          <button type="button" class="ghost-button" id="mcCaptions" aria-pressed="true">Captions on</button>
        </div>
        <p class="mc-voice" id="mcVoice"></p>
        <button type="button" class="mc-full" id="mcFull">Read the full reading ↓</button>
      </div></div>`);
    const root=document.querySelector('.mc-player');
    const $=id=>root.querySelector('#'+id);
    let index=-1,playing=false,muted=false,captions=true,timer=null,token=0;
    const voiceNote=()=>{$('mcVoice').textContent=muted?'Sound is off. Captions keep time on their own.':localVoice()?`Temporary voice: your device's built-in speech (${localVoice().name}). Nothing is sent anywhere.`:'No on-device voice was found on this device, so Max is on captions only. Nothing is sent anywhere.';};
    voiceNote();window.speechSynthesis?.addEventListener?.('voiceschanged',voiceNote);
    const stopSound=()=>{clearTimeout(timer);token++;try{window.speechSynthesis?.cancel();}catch{}root.classList.remove('is-talking');};
    function show(i){
      const part=script[i];
      $('mcCaption').innerHTML=`<p class="mc-kind-${part.kind}">${escapeHtml(part.text)}</p>`;
      $('mcPart').textContent=`Part ${i+1} of ${script.length}`;
      $('mcBar').style.width=`${(i+1)/script.length*100}%`;
      root.querySelectorAll('.mc-card').forEach(el=>{const on=part.show.includes(Number(el.dataset.slot));el.classList.toggle('is-active',on);el.classList.toggle('is-dim',part.show.length>0&&!on);});
    }
    function playPart(i){
      stopSound();index=i;
      if(i>=script.length){finish();return;}
      show(i);root.classList.add('is-talking');
      const mine=token,next=()=>{if(mine===token&&playing)playPart(i+1);};
      const voice=!muted&&localVoice();
      if(voice){
        const utterance=new SpeechSynthesisUtterance(spoken(script[i].text));
        utterance.voice=voice;utterance.lang=voice.lang;utterance.rate=1;utterance.pitch=0.85;
        utterance.onend=next;utterance.onerror=next;
        window.speechSynthesis.speak(utterance);
      } else timer=setTimeout(next,Math.min(12000,Math.max(2600,script[i].text.split(' ').length*400)));
    }
    function finish(){playing=false;stopSound();index=-1;$('mcPlay').textContent='▶ Play again';$('mcCaption').innerHTML='<p>That was the short version. The full reading is waiting below.</p>';root.classList.add('is-finished');}
    function setPlaying(on){
      playing=on;root.classList.toggle('is-playing',on);root.classList.remove('is-finished');
      $('mcPlay').textContent=on?'❚❚ Pause':'▶ Resume';
      if(on)playPart(index<0?0:index);else stopSound();
    }
    $('mcPlay').onclick=()=>setPlaying(!playing);
    $('mcReplay').onclick=()=>{index=0;setPlaying(true);};
    $('mcSound').onclick=()=>{muted=!muted;$('mcSound').textContent=muted?'Sound off':'Sound on';$('mcSound').setAttribute('aria-pressed',String(!muted));voiceNote();if(playing)playPart(index);};
    $('mcCaptions').onclick=()=>{captions=!captions;root.classList.toggle('captions-off',!captions);$('mcCaptions').textContent=captions?'Captions on':'Captions off';$('mcCaptions').setAttribute('aria-pressed',String(captions));};
    const close=()=>{playing=false;stopSound();window.speechSynthesis?.removeEventListener?.('voiceschanged',voiceNote);root.remove();player=null;document.removeEventListener('keydown',onKey);opener?.focus?.();};
    const onKey=e=>{if(e.key==='Escape')close();};
    document.addEventListener('keydown',onKey);
    $('mcClose').onclick=close;
    $('mcFull').onclick=()=>{close();document.getElementById('readingInterpretation')?.scrollIntoView({block:'start',behavior:scrollMotion()});};
    $('mcPlay').focus();
    player={script,root};
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
    if(!interpretation)return;
    const ready=state.spreadId==='guidance'&&state.drawnCardIds.length===1;
    interpretation.insertAdjacentHTML('beforebegin',`<section class="mc-launch"><div class="eyebrow">MAX CHASROOM · PRESENTER DEMO</div>${ready?`<p>A short spoken walk through this reading. The full reading stays below.</p><button type="button" class="gold-button" id="mcOpen">▶ Watch Max Chasroom present this reading</button>`:`<p>The presenter demo covers One-card Guidance only for now.</p>`}</section>`);
    document.getElementById('mcOpen')?.addEventListener('click',openPlayer);
  }
  function demoBanner(){
    if(!isDemo())return;
    document.querySelector('.draw-stage h1')?.insertAdjacentHTML('afterend','<p class="mc-demo-banner" role="note"><strong>DEMONSTRATION READING · SYNTHETIC</strong> These cards were chosen for this demo, not drawn for you.</p>');
    // A synthetic reading must not land in the Journal as if it were real.
    const journal=document.querySelector('.reading-journal');
    if(journal)journal.innerHTML='<div class="eyebrow">YOUR PERSONAL JOURNAL</div><p>Saving is turned off for the demonstration reading. Draw your own One-card Guidance to save it.</p>';
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
  window.ResonatePresenter={buildScript,FRAME,DEMO,isDemo,loadDemo,get player(){return player;}};
  if(!/[?&]own\b/.test(location.search))loadDemo();
})();
