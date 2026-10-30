/* Max Chasroom: a deliberately synthetic presenter for a finished reading, in any spread (UAT preview).
   Loaded only by presenter-uat.html, after the app. It narrates the reading the app has already written:
   every interpretive line is lifted word for word from readingMeaning()/goldenThread(), the same functions
   the page and the PDF use. Max's own lines (FRAME) are framing only; they never interpret. Labels only
   name a position and a card. Kept short for a phone: per card, one line on the position and one on the card.
   Clarifiers are separate chapters, so a clarifier drawn later can be heard on its own.
   Voice: swappable providers behind one interface (window.MaxVoice), tried in order: any registered voice
   (for Chas's own consented voice later), a pre-recorded voice pack if one covers the whole script, the
   device's own on-device speech, else captions alone. Device speech is labelled "synthetic temporary voice,
   not Chas", and is dropped for captions if it turns out not to work. Nothing is sent anywhere. */
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

  // The script: [{kind:'frame'|'label'|'quote', chapter, text, show:[slot keys], clips:[{id,text}]}].
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
      // The position lens: its first sentence after "Position: <role> — <card>."
      const lens=sentences(block.querySelector('.original-card-explanation .position-context')?.textContent||'')[1];
      add('cards','quote',lens,[key],[{id:`lens-${spread}-${i}-${id}`,text:lens}]);
      const meaning=sentences(block.querySelector('.original-card-explanation .position-context + p')?.textContent||'')[0];
      add('cards','quote',meaning,[key],[{id:`meaning-${id}`,text:meaning}]);
    });

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
  // Samsung's Chrome names voices 'en_AU' or 'zh_HK_#Hans'; the standard tag is 'en-AU'
  // (Chas's Android, 30 Oct). Read both, and only ever hand the standard form back.
  const bcp47=lang=>String(lang||'').split('_#')[0].replace(/_/g,'-');
  function localVoice(){
    const voices=window.speechSynthesis?.getVoices?.().filter(v=>v.localService&&/^en\b/i.test(bcp47(v.lang)))||[];
    return voices.find(v=>/^en-GB$/i.test(bcp47(v.lang)))||voices.find(v=>/^en-AU$/i.test(bcp47(v.lang)))||voices[0]||null;
  }
  const spokenText=text=>text.replace(/ · /g,', ').replace(/ — /g,', ');

  // ---- Voice providers -------------------------------------------------------------------------------
  // One interface, so a consented clone of Chas's voice can replace the temporary voice later without
  // touching the script, captions or controls. A provider is:
  //   { id, prepare(script) -> Promise<bool>   can it voice this whole script?
  //     note() -> string                       what the listener is told about the voice
  //     speak(part, fromClip, on)              on.clip(n) as each recorded clip starts, on.done() when the
  //                                            part has been voiced, on.fail(reason) if the voice cannot work
  //     stop() }                               silence now; a stopped part never calls on.done
  // A provider must not send the reading off the device without Chas's consent recorded in the repo.
  const registered=[];
  window.MaxVoice={register(provider){if(provider&&provider.id&&!registered.includes(provider))registered.push(provider);},providers:()=>[...registered,packVoice,deviceVoice]};

  const packAudio=typeof Audio==='function'?new Audio():null;
  let packToken=0;
  const packVoice={
    id:'pack',pack:null,
    async prepare(script){this.pack=packCovers(await loadVoicePack(),script)?voicePack:null;return !!this.pack&&!!packAudio;},
    note(){return `${this.pack.label}. Pre-recorded, so nothing is sent anywhere.`;},
    speak(part,from,on){
      const mine=++packToken,pack=this.pack;let n=from;
      const playClip=()=>{
        if(mine!==packToken)return;
        if(n>=part.clips.length){on.done();return;}
        on.clip(n);
        packAudio.src=VOICE_DIR+pack.clips[part.clips[n].id];
        packAudio.onended=()=>{n++;playClip();};
        packAudio.onerror=()=>{n++;playClip();};
        packAudio.play().catch(()=>{if(mine===packToken){n++;playClip();}});
      };
      playClip();
    },
    stop(){packToken++;if(packAudio){packAudio.onended=packAudio.onerror=null;packAudio.pause();}}
  };

  // The device's own speech. Some phones list a voice that then never makes a sound. One dropped line is
  // a known Android quirk and is skipped; two silent lines in a row, or an engine error, mean the voice
  // does not work here, so Max says so and carries on with captions (Si Aye, 30 Oct: no claimed audio).
  const FATAL=/synthesis-failed|synthesis-unavailable|audio-hardware|not-allowed|voice-unavailable|language-unavailable/;
  let deviceTimer=null,deviceToken=0;
  const deviceVoice={
    id:'device',broken:null,silent:0,
    async prepare(){return !this.broken&&!!localVoice();},
    note(){return `Synthetic temporary voice — not Chas. Your device's built-in speech (${localVoice().name}). Nothing is sent anywhere.`;},
    speak(part,from,on){
      const mine=++deviceToken,voice=localVoice(),self=this;
      if(!voice){on.fail('no-voice');return;}
      let started=false,settled=false;
      const finish=ok=>{if(settled||mine!==deviceToken)return;settled=true;clearTimeout(deviceTimer);if(ok)self.silent=0;on.done();};
      const fail=reason=>{if(settled||mine!==deviceToken)return;settled=true;clearTimeout(deviceTimer);self.broken=reason;on.fail(reason);};
      const utterance=new SpeechSynthesisUtterance(spokenText(part.text));
      utterance.voice=voice;utterance.lang=bcp47(voice.lang);utterance.rate=1;utterance.pitch=0.85;
      utterance.onstart=()=>{started=true;self.warm=true;};
      utterance.onend=()=>finish(true);
      utterance.onerror=e=>{const err=e?.error||'';if(err==='interrupted'||err==='canceled')return;if(FATAL.test(err))fail(err);else finish(false);};
      const words=part.text.split(' ').length;
      // Has the line actually started? If not after a few seconds, it was dropped.
      const check=()=>{deviceTimer=setTimeout(()=>{
        if(mine!==deviceToken||settled)return;
        if(started||window.speechSynthesis.speaking){started=true;self.warm=true;deviceTimer=setTimeout(guard,Math.max(4000,words*700));return;}
        if(++self.silent>=2)fail('silent');else finish(false);
      },self.warm?3000:7000);};
      // Started but no end event (Android): move on once speech has stopped.
      const guard=()=>{if(mine!==deviceToken||settled)return;if(!window.speechSynthesis.speaking)finish(true);else deviceTimer=setTimeout(guard,1500);};
      deviceTimer=setTimeout(()=>{if(mine!==deviceToken)return;window.speechSynthesis.speak(utterance);check();},120);
    },
    stop(){deviceToken++;clearTimeout(deviceTimer);try{window.speechSynthesis?.cancel();}catch{}}
  };
  async function pickVoice(script){
    for(const provider of window.MaxVoice.providers()){try{if(await provider.prepare(script))return provider;}catch{}}
    return null;
  }

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
    let voice=await pickVoice(script);
    const pack=voice===packVoice?packVoice.pack:null;
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
    const voiceNote=()=>{
      let note;
      if(muted)note='Sound is off. Captions keep time on their own.';
      else if(voice)note=voice.note();
      else if(deviceVoice.broken)note='This device lists a voice but it did not speak, so Max is on captions only. Nothing is sent anywhere.';
      else note='No on-device voice was found on this device, so Max is on captions only. Nothing is sent anywhere.';
      $('mcVoice').textContent=note;
    };
    // Voices often arrive late on Android: pick again when they do, unless a part is already playing.
    const onVoices=async()=>{if(!playing&&(!voice||voice===deviceVoice)){voice=await pickVoice(script);}voiceNote();};
    voiceNote();window.speechSynthesis?.addEventListener?.('voiceschanged',onVoices);
    const stopSound=()=>{clearTimeout(timer);token++;window.MaxVoice.providers().forEach(p=>{try{p.stop();}catch{}});root.classList.remove('is-talking');};
    const motion=()=>window.matchMedia?.('(prefers-reduced-motion: reduce)').matches?'auto':'smooth';
    function show(i){
      const part=script[i];
      // Lets the Golden Thread (max-golden-thread.js) follow the card being discussed.
      document.dispatchEvent(new CustomEvent('maxchasroom:show',{detail:{root,index:i,show:part.show}}));
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
    const captionTime=i=>Math.min(12000,Math.max(2600,script[i].text.split(' ').length*400));
    // from: the clip to start at, so Resume carries on where Pause stopped in a recorded line.
    function playPart(i,from=0){
      stopSound();index=i;clip=from;
      if(i>=script.length){finish();return;}
      show(i);root.classList.add('is-talking');
      const mine=token,next=()=>{if(mine===token&&playing)playPart(i+1);};
      const v=!muted&&voice;
      if(!v){timer=setTimeout(next,captionTime(i));return;}
      v.speak(script[i],from,{
        clip:n=>{if(mine===token)clip=n;},
        done:next,
        // The voice does not work here: say so, and carry on from this part with the next voice or captions.
        fail:async()=>{if(mine!==token)return;voice=await pickVoice(script);voiceNote();if(mine===token&&playing)playPart(i);}
      });
    }
    function finish(){playing=false;stopSound();index=-1;$('mcPlay').textContent='▶ Play again';$('mcCaption').innerHTML='<p>That was the short version. The full reading is waiting below.</p>';root.classList.add('is-finished');}
    function setPlaying(on){
      playing=on;root.classList.toggle('is-playing',on);root.classList.remove('is-finished');
      $('mcPlay').textContent=on?'❚❚ Pause':'▶ Resume';
      if(on)playPart(index<0?0:index,voice===packVoice&&!muted&&index>=0?clip:0);else stopSound();
    }
    $('mcPlay').onclick=()=>setPlaying(!playing);
    $('mcReplay').onclick=()=>{index=0;clip=0;root.scrollTo?.({top:0});root.querySelector('.mc-cards')?.scrollTo?.({left:0});setPlaying(true);};
    $('mcSound').onclick=()=>{muted=!muted;$('mcSound').textContent=muted?'🔊 Unmute':'🔇 Mute';$('mcSound').setAttribute('aria-pressed',String(!muted));voiceNote();if(playing)playPart(index);};
    $('mcCaptions').onclick=()=>{captions=!captions;root.classList.toggle('captions-off',!captions);$('mcCaptions').textContent=captions?'Hide words':'Show words';$('mcCaptions').setAttribute('aria-pressed',String(captions));};
    // Leaving the page or switching away pauses Max: nothing carries on speaking in the background.
    const onHide=()=>{if(document.hidden&&playing)setPlaying(false);};
    const onPageHide=()=>{if(playing)setPlaying(false);};
    document.addEventListener('visibilitychange',onHide);window.addEventListener('pagehide',onPageHide);
    const close=()=>{playing=false;stopSound();document.dispatchEvent(new CustomEvent('maxchasroom:close',{detail:{root}}));window.speechSynthesis?.removeEventListener?.('voiceschanged',onVoices);document.removeEventListener('visibilitychange',onHide);window.removeEventListener('pagehide',onPageHide);root.remove();player=null;document.removeEventListener('keydown',onKey);opener?.focus?.();};
    const onKey=e=>{if(e.key==='Escape')close();};
    document.addEventListener('keydown',onKey);
    $('mcClose').onclick=close;
    $('mcFull').onclick=()=>{close();document.getElementById('readingInterpretation')?.scrollIntoView({block:'start',behavior:scrollMotion()});};
    $('mcPlay').focus();
    player={script,root,pack,get voice(){return muted?null:(voice?voice.id:null);},chapter:typeof chapter==='string'?chapter:null};
    document.dispatchEvent(new CustomEvent('maxchasroom:open',{detail:{root,chapter:player.chapter}}));
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
  window.ResonatePresenter={voiceInventory,buildScript,playlist,FRAME,DEMO,VOICE_DIR,isDemo,loadDemo,openPlayer,get player(){return player&&!player.pending?player:null;}};
  // The page now opens as the normal app, for real readings in any spread. ?demo loads the synthetic demo.
  if(/[?&]demo\b/.test(location.search))loadDemo();

  // ?voices: a plain list of this device's speech voices, for the Android check (Si Aye, 30 Oct).
  // Reads the list only; nothing is spoken and nothing is sent anywhere.
  function voiceInventory(){
    const all=window.speechSynthesis?.getVoices?.()||[];
    const pick=localVoice();
    return {supported:!!window.speechSynthesis,picked:pick?`${pick.name} (${bcp47(pick.lang)})`:null,
      voices:all.map(v=>({name:v.name,lang:v.lang,onDevice:!!v.localService,english:/^en\b/i.test(bcp47(v.lang))}))};
  }
  function showInventory(){
    const inv=voiceInventory();
    const rows=inv.voices.map(v=>`<tr${v.onDevice&&v.english?' class="mc-usable"':''}><td>${escapeHtml(v.name)}</td><td>${escapeHtml(v.lang)}</td><td>${v.onDevice?'On this device':'Online (never used)'}</td></tr>`).join('');
    const summary=!inv.supported?'This browser has no speech at all. Max will use captions only.'
      :inv.picked?`Max would use: ${inv.picked}. Synthetic temporary voice — not Chas.`
      :inv.voices.length?'No English voice on this device. Max will use captions only.':'No voices listed yet. Wait a moment, or tap Check again.';
    let box=document.getElementById('mcInventory');
    if(!box){document.body.insertAdjacentHTML('afterbegin','<section class="mc-inventory" id="mcInventory" role="region" aria-label="Voice check"></section>');box=document.getElementById('mcInventory');}
    box.innerHTML=`<h2>VOICE CHECK</h2><p><strong>${escapeHtml(summary)}</strong></p><p>${inv.voices.length} voice${inv.voices.length===1?'':'s'} listed. Highlighted ones can be used. Please screenshot this for the team.</p>${rows?`<div class="mc-inv-scroll"><table><thead><tr><th>Voice</th><th>Language</th><th>Where</th></tr></thead><tbody>${rows}</tbody></table></div>`:''}<button type="button" class="ghost-button" id="mcInvAgain">Check again</button>`;
    document.getElementById('mcInvAgain').onclick=showInventory;
  }
  if(/[?&]voices\b/.test(location.search)){
    const run=()=>showInventory();
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
    window.speechSynthesis?.addEventListener?.('voiceschanged',run);
  }
})();
