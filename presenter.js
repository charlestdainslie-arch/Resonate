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
    c1s:'Now, your first clarifiers, card by card.',
    c2:'And your second clarifier.',
    c2s:'And your second clarifiers.',
    k:'And your clarity card, from the Minor Arcana.',
    ks:'And a clarity card, from the Minor Arcana, where three Major Arcana cards met.',
    back:'Max Chasroom, back for the next part of your reading.',
    // Narration lifecycle (Chas, Samsung UAT, 8 Nov 2026): until the seeker finishes, Max invites, never signs off.
    first:'That\'s the first layer of your reading.',
    sofar:'That\'s your reading so far.',
    invite:'If a card calls for more, choose it below and tap Clarify. When you have finished, tap Finish reading.',
    final:'Here is your whole spread, brought together.',
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
  function buildScript(opts={finished:readingFinished()}){
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
    // Positions in reading order: a Seven-card question reading takes position 4 last (approved 7 Nov 2026).
    const order=typeof readingOrder==='function'?readingOrder():ids.map((_,i)=>i);
    order.map(i=>[ids[i],i]).forEach(([id,i])=>{
      const card=byId(id),block=blocks[i],key='p'+i;
      // A reversed card has its own name, lens and meaning lines, so a recorded voice pack keeps them apart.
      const r=isReversed(card)?'-r':'',name={id:`name-${id}${r}`,text:`${cardName(card)}.`};
      if(!one)add('cards','label',`${labels[i]}: ${cardName(card)}.`,[key],[pos(i),name]);
      else add('cards','label',`${cardName(card)}.`,[key],[name]);
      // The position lens: its first sentence after "Position: <role> — <card>."
      const lens=sentences(block.querySelector('.original-card-explanation .position-context')?.textContent||'')[1];
      add('cards','quote',lens,[key],[{id:`lens-${spread}-${i}-${id}${r}`,text:lens}]);
      const meaning=sentences(block.querySelector('.original-card-explanation .position-context + p')?.textContent||'')[0];
      add('cards','quote',meaning,[key],[{id:`meaning-${id}${r}`,text:meaning}]);
    });

    // Clarifiers: one chapter per layer, each card's first meaning line as written in its position.
    layerCards.forEach((layer,l)=>{
      const n=l+1,chapter='c'+n;
      frame(chapter,one?'c'+n:'c'+n+'s',layer.map((_,i)=>`c${i}-${n}`));
      order.map(i=>[layer[i],i]).forEach(([c,i])=>{
        if(!c)return;
        const key=`c${i}-${n}`;
        const r=isReversed(c)?'-r':'';
        const label=one?`Clarifier ${n}: ${cardName(c)}.`:`Clarifier ${n} · ${labels[i]}: ${cardName(c)}.`;
        add(chapter,'label',label,['p'+i,key],[{id:`label-clarifier-${n}`,text:`Clarifier ${n}${one?':':','}`},...(one?[]:[pos(i)]),{id:`name-${c.id}${r}`,text:`${cardName(c)}.`}]);
        const block=blocks[i].querySelector(`.integrated-clarifier[data-clarifier="${n}"]`)||blocks[i].querySelectorAll('.integrated-clarifier')[l];
        const meaning=sentences(block?.querySelector(':scope > p')?.textContent||'')[0];
        add(chapter,'quote',meaning,[key],[{id:`meaning-${c.id}${r}`,text:meaning}]);
        // The integrated reading (7 Nov): how this clarifier relates to the card(s) before it, then, after the
        // last clarifier drawn for this position, what they mean together. Quoted word for word from the page,
        // so the captions are exactly what Max says. Rebuilt every time Max opens, so a newly drawn clarifier
        // replaces the earlier synthesis rather than leaving an outdated one.
        const rel=[block?.querySelector('.relation-lead'),block?.querySelector('.relation-meaning')].map(el=>norm(el?.textContent||'')).filter(Boolean);
        const relShow=n===1?['p'+i,key]:['p'+i,`c${i}-1`,key];
        rel.forEach((text,k)=>add(chapter,'quote',text,relShow,[{id:`rel-${spread}-${i}-${n}-${k}`,text}]));
        const clarityId=readingClarity()[i];
        const last=!layerCards.slice(l+1).some(layer=>layer[i])&&clarityId==null;
        const together=blocks[i].querySelector('.combined-meaning');
        if(last&&together){
          const show=['p'+i,...layerCards.map((layer,m)=>layer[i]?`c${i}-${m+1}`:null).filter(Boolean)];
          const lead=sentences(together.querySelector('.synthesis-lead')?.textContent||'');
          const wider=sentences(together.querySelector('.synthesis-wider')?.textContent||'');
          [...lead,...wider].filter((t,k,a)=>t&&a.indexOf(t)===k).forEach((text,k)=>add(chapter,'quote',text,show,[{id:`together-${spread}-${i}-${k}`,text}]));
        }
      });
    });

    // Clarity card (Option B, approved 7 Nov 2026): after a card whose original and both clarifiers are Major.
    const clarity=readingClarity().map(id=>id==null?null:byId(id));
    if(clarity.some(Boolean)){
      frame('c3',one?'k':'ks');
      order.map(i=>[clarity[i],i]).forEach(([c,i])=>{
        if(!c)return;
        const r=isReversed(c)?'-r':'',show=['p'+i,`c${i}-1`,`c${i}-2`];
        add('c3','label',one?`Clarity card: ${cardName(c)}.`:`Clarity card · ${labels[i]}: ${cardName(c)}.`,show,[{id:'label-clarity',text:`Clarity card${one?':':','}`},...(one?[]:[pos(i)]),{id:`name-${c.id}${r}`,text:`${cardName(c)}.`}]);
        const block=blocks[i].querySelector('.integrated-clarity');
        const meaning=sentences(block?.querySelector(':scope > p')?.textContent||'')[0];
        add('c3','quote',meaning,show,[{id:`meaning-${c.id}${r}`,text:meaning}]);
        [block?.querySelector('.relation-lead'),block?.querySelector('.relation-meaning')].map(el=>norm(el?.textContent||'')).filter(Boolean).forEach((text,k)=>add('c3','quote',text,show,[{id:`rel-${spread}-${i}-3-${k}`,text}]));
        const together=blocks[i].querySelector('.combined-meaning');
        if(together){
          const lead=sentences(together.querySelector('.synthesis-lead')?.textContent||'');
          const wider=sentences(together.querySelector('.synthesis-wider')?.textContent||'');
          [...lead,...wider].filter((t,k,a)=>t&&a.indexOf(t)===k).forEach((text,k)=>add('c3','quote',text,show,[{id:`together-${spread}-${i}-${k}`,text}]));
        }
      });
    }

    // Ending (narration lifecycle, 8 Nov 2026). Until the seeker taps Finish reading, Max ends by inviting
    // clarification ('invite'), never by signing off. After Finish: the whole spread together ('final'), then the
    // closing question, "Take what resonates, and leave the rest." and the sign-off ('close'), once.
    const all=ids.flatMap((_,i)=>['p'+i,...layerCards.map((__,l)=>`c${i}-${l+1}`)]);
    if(!opts.finished){
      frame('invite',layerCards.length||readingClarity().some(x=>x!=null)?'sofar':'first',all);
      frame('invite','invite',all);
      return script;
    }
    const thread=frag(goldenThread(ids.map(byId)));
    // The Overall Invitation is two parts on the page: the pattern across the spread, and the question to carry.
    const pattern=norm(thread.querySelector('.golden-thread-pattern')?.textContent||'');
    const askLines=sentences(thread.querySelector('.golden-thread-ask')?.textContent||'');
    frame('final','final',all);
    add('final','quote',pattern,all,[{id:'thread-pattern',text:pattern}]);
    if(askLines.length){frame('close','ask',all);add('close','quote',askLines.join(' '),all,askLines.map((text,i)=>({id:`thread-${i}`,text})));}
    const resonance=norm(thread.querySelector('.golden-thread-resonance')?.textContent||'');
    add('close','quote',resonance,all,[{id:'thread-resonance',text:resonance}]);
    frame('close','close',all);
    return script;
  }
  // What a launcher plays: the whole reading, or one clarifier chapter followed by the ending (the invitation,
  // or, once the reading is finished, the final synthesis and the close).
  const ENDING=['invite','final','close'];
  function playlist(script,chapter){
    if(!chapter)return script;
    const back={chapter:'intro',kind:'frame',text:FRAME.back,show:[],clips:[{id:'frame-back',text:FRAME.back}]};
    return [back,...script.filter(p=>p.chapter===chapter||ENDING.includes(p.chapter))];
  }
  // The new part of the reading after one card was clarified inside Max: that card's new clarifier (or Clarity
  // card) with how it relates to the original, the updated "together", then the invitation again.
  function deltaFor(full,position,step){
    const chapter=step==='first'?'c1':step==='second'?'c2':'c3';
    const mine=p=>p.chapter===chapter&&p.show.some(k=>k==='p'+position||k.startsWith(`c${position}-`));
    const key=chapter==='c3'?'k':chapter;
    const lead={chapter,kind:'frame',text:FRAME[key],show:[],clips:[{id:'frame-'+key,text:FRAME[key]}]};
    return [lead,...full.filter(mine),...full.filter(p=>p.chapter==='invite')];
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
    const img=(c,cls)=>`<img class="${[cls,isReversed(c)?'is-reversed':''].filter(Boolean).join(' ')}" src="${cardImage(c)}" alt="${escapeHtml(cardName(c))}" referrerpolicy="no-referrer">`;
    return `<ol class="mc-cards${state.drawnCardIds.length>3?' is-wide':''}" aria-label="Cards in this reading">${state.drawnCardIds.map((id,i)=>{
      const c=byId(id);
      const kId=typeof readingClarity==='function'?readingClarity()[i]:null;
      const clar=layerCards.map((layer,l)=>layer[i]?`<li class="mc-clar" data-slot="c${i}-${l+1}">${img(layer[i],'')}<span>Clarifier ${l+1}</span><strong>${escapeHtml(cardName(layer[i]))}</strong></li>`:'').join('')
        +(kId!=null?`<li class="mc-clar mc-clarity" data-slot="k${i}">${img(byId(kId),'')}<span>Clarity card</span><strong>${escapeHtml(cardName(byId(kId)))}</strong></li>`:'');
      return `<li class="mc-card" data-slot="p${i}">${img(c,'mc-main')}<span>${escapeHtml(labels[i]||'Position')}</span><strong>${escapeHtml(cardName(c))}</strong>${clar?`<ol class="mc-clars">${clar}</ol>`:''}</li>`;
    }).join('')}</ol>`;
  }

  let player=null,clarifyingInPlayer=false;
  // The clarify bar inside Max (Chas, Samsung UAT, 8 Nov 2026): always at the bottom of Max's screen, so the
  // seeker never leaves the narration to clarify. Pick an original card; one button does what the rule allows.
  function clarifyBar(){
    const labels=positionLabels(),n=state.drawnCardIds.length,canClarify=typeof clarifyPosition==='function'&&!isDemo();
    const chips=n>1?`<div class="mc-pick" role="radiogroup" aria-label="Choose the card to clarify">${state.drawnCardIds.map((id,i)=>`<button type="button" role="radio" aria-checked="false" data-pick="${i}"><b>${String(i+1).padStart(2,'0')}</b><small>${escapeHtml(labels[i]||'')}</small></button>`).join('')}</div>`:'';
    return `<div class="mc-clarify-bar" id="mcClarifyBar" role="group" aria-label="Clarify a card or finish the reading">${canClarify?chips:''}<p class="mc-pick-note" id="mcPickNote" aria-live="polite"></p><div class="mc-bar-actions">${canClarify?'<button type="button" class="gold-button" id="mcClarifyGo">✦ Clarify this card</button>':''}<button type="button" class="ghost-button" id="mcFinish">Finish reading</button></div></div>`;
  }
  // Decision 5 (Si Aye, 7 Nov): adding a clarifier stops Max's current narration and offers
  // "Replay Updated Reading". heardSig is the reading as it stood when Max was last opened.
  const readingSig=()=>JSON.stringify([state.drawnAt,layers().map(l=>l.map(c=>c?c.id:null)),typeof readingClarity==='function'?readingClarity():[]]);
  // The reading is finished when the seeker taps Finish reading; adding a card afterwards reopens it.
  const readingFinished=()=>!!state.maxFinishedSig&&state.maxFinishedSig===readingSig();
  let heardSig=null;
  const updatedSinceHeard=()=>!!heardSig&&JSON.parse(heardSig)[0]===state.drawnAt&&heardSig!==readingSig();
  async function openPlayer(chapter){
    if(player)return;
    player={pending:true};
    let full=buildScript(),script=playlist(full,typeof chapter==='string'?chapter:null);
    const sig=readingSig();heardSig=sig;
    let voice=await pickVoice(script);
    const pack=voice===packVoice?packVoice.pack:null;
    const opener=document.activeElement;
    const what=typeof chapter==='string'?` · Clarifier ${chapter.slice(1)}`:'';
    document.body.insertAdjacentHTML('beforeend',`<div class="mc-player" role="dialog" aria-modal="true" aria-labelledby="mcTitle">
      <div class="mc-frame">
        <header class="mc-head"><h2 id="mcTitle">MAX CHASROOM <span>· RESONATE</span></h2><button type="button" class="mc-close" id="mcClose" aria-label="Close the presenter">✕</button></header>
        <p class="mc-provenance">${escapeHtml(provenance()+what)}</p>
        <div class="mc-body">
        <div class="mc-stage">
          <div class="mc-screen" aria-hidden="true">${avatarSvg()}<span class="mc-tag">TEMPORARY PRESENTER · NOT CHAS'S LIKENESS</span></div>
          ${cardStrip()}
        </div>
        <p class="mc-voice" id="mcVoice"></p>
        <details class="mc-transcript"><summary>Transcript</summary><ol>${script.map(p=>`<li class="mc-kind-${p.kind}">${escapeHtml(p.text)}</li>`).join('')}</ol></details>
        <button type="button" class="mc-full" id="mcFull">Read the full reading ↓</button>
        </div>
        <div class="mc-panel">
        <div class="mc-caption" id="mcCaption" aria-live="polite"><p>Press Play when you're ready. Nothing plays until you do.</p></div>
        <div class="mc-progress"><span id="mcPart">Part 0 of ${script.length}</span><div class="mc-bar"><i id="mcBar"></i></div></div>
        <div class="mc-controls">
          <button type="button" class="gold-button" id="mcPlay">▶ Play</button>
          <button type="button" class="ghost-button" id="mcReplay">↺ Replay</button>
          <button type="button" class="ghost-button" id="mcSound" aria-pressed="true">🔇 Mute</button>
          <button type="button" class="ghost-button" id="mcCaptions" aria-pressed="true">Hide words</button>
        </div>
        ${clarifyBar()}
        </div>
      </div></div>`);
    const root=document.querySelector('.mc-player');
    const $=id=>root.querySelector('#'+id);
    let index=-1,playing=false,muted=false,captions=true,timer=null,token=0,clip=0;
    // Has the seeker heard Max read the cards? True once he reaches the ending of the reading (the "So far…"
    // and the invitation come only after every card), or when Max opens on one clarifier chapter, which
    // follows a reading already heard.
    let heardCards=typeof chapter==='string';
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
    // Brings a card into the wide strip without leaving a cut-off card at its left edge, beside Max (9 Nov UAT,
    // laptop: centring the card being discussed left the card before it half hidden). The strip starts on a
    // whole card, as far along as keeps the target near the centre and fully in view.
    const stripTo=(strip,card)=>{
      if(!strip||!card||strip.scrollWidth<=strip.clientWidth)return;
      const cards=[...strip.querySelectorAll(':scope > .mc-card')];
      if(!cards.includes(card)){strip.scrollTo({left:card.offsetLeft-(strip.clientWidth-card.offsetWidth)/2,behavior:motion()});return;}
      const pad=parseFloat(getComputedStyle(strip).scrollPaddingLeft)||parseFloat(getComputedStyle(strip).paddingLeft)||0;
      const starts=cards.map(c=>Math.max(0,c.offsetLeft-pad));
      const centred=card.offsetLeft-(strip.clientWidth-card.offsetWidth)/2;
      let left=0;for(const s of starts)if(s<=centred)left=s;
      if(card.offsetLeft+card.offsetWidth+pad>left+strip.clientWidth)left=Math.max(0,card.offsetLeft-pad);
      strip.scrollTo({left:Math.min(left,strip.scrollWidth-strip.clientWidth),behavior:motion()});
    };
    function show(i){
      const part=script[i];
      // Lets the Golden Thread (max-golden-thread.js) follow the card being discussed.
      document.dispatchEvent(new CustomEvent('maxchasroom:show',{detail:{root,index:i,show:part.show}}));
      $('mcCaption').innerHTML=`<p class="mc-kind-${part.kind}">${escapeHtml(part.text)}</p>`;
      $('mcPart').textContent=`Part ${i+1} of ${script.length}`;
      if(picked==null)updateBar();
      // (8 Nov, P2) On phones the caption, controls and clarify bar share a fixed panel, so nothing covers the
      // caption and no scrolling is needed to keep it in view.
      $('mcBar').style.width=`${(i+1)/script.length*100}%`;
      let focus=null;
      root.querySelectorAll('[data-slot]').forEach(el=>{const on=part.show.includes(el.dataset.slot);el.classList.toggle('is-active',on);el.classList.toggle('is-dim',part.show.length>0&&!on);if(on&&!focus)focus=el;});
      // Keep the card being discussed in view on a wide spread, sideways only.
      const strip=root.querySelector('.mc-cards');
      if(focus&&strip&&strip.scrollWidth>strip.clientWidth&&part.show.length<=2){
        stripTo(strip,focus.closest('.mc-card')||focus);
      }
    }
    const captionTime=i=>Math.min(12000,Math.max(2600,script[i].text.split(' ').length*400));
    // from: the clip to start at, so Resume carries on where Pause stopped in a recorded line.
    function playPart(i,from=0){
      stopSound();index=i;clip=from;
      if(i>=script.length){finish();return;}
      show(i);root.classList.add('is-talking');
      if(ENDING.includes(script[i].chapter))heardCards=true;
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
    function finish(){
      playing=false;stopSound();index=-1;$('mcPlay').textContent='▶ Play again';root.classList.add('is-finished');
      // A card just clarified as far as the rule allows: let go of it, so the bar moves on to the next card due.
      if(picked!=null&&!clarifyStepFor(picked))picked=null;
      $('mcCaption').innerHTML=readingFinished()?'<p>Your reading is complete. Every word is waiting below, and in your PDF.</p>':'<p>Choose a card below and tap Clarify, or tap Finish reading when you are done.</p>';
      updateBar();
    }
    function setPlaying(on){
      playing=on;root.classList.toggle('is-playing',on);root.classList.remove('is-finished');
      $('mcPlay').textContent=on?'❚❚ Pause':'▶ Resume';
      if(on)playPart(index<0?0:index,voice===packVoice&&!muted&&index>=0?clip:0);else stopSound();
    }
    // Replace what Max is about to say (after a card is clarified here, or Finish reading): stop at once, so no
    // stale line or caption carries on, then play the new part from its start.
    function load(next){
      stopSound();playing=false;script=next;index=-1;clip=0;
      root.querySelector('.mc-transcript ol').innerHTML=script.map(p=>`<li class="mc-kind-${p.kind}">${escapeHtml(p.text)}</li>`).join('');
      $('mcPart').textContent=`Part 0 of ${script.length}`;$('mcBar').style.width='0%';
      const strip=root.querySelector('.mc-cards');if(strip)strip.outerHTML=cardStrip();
      if(player&&!player.pending)player.script=script;
      pickVoice(script).then(v=>{voice=v;voiceNote();});
      setPlaying(true);
    }
    // The in-player clarify bar: pick an original card, then one action for it under Chas's teaching rule.
    let picked=null;   // null: follow the card Max is talking about; a number once the seeker picks one
    const pickedIndex=()=>{
      if(picked!=null)return picked;
      const part=index>=0?script[index]:null;
      // Follow the card Max is talking about only when the part is about one card. The ending ("So far…",
      // the invitation) shows the whole spread: that used to pick card 01 every time, so after the last card
      // of the first layer Max never went back to the card whose clarifier is due (9 Nov UAT, laptop).
      const own=(part?.show||[]).map(k=>/^p(\d+)$/.exec(k)).filter(Boolean);
      if(own.length===1)return Number(own[0][1]);
      // Before Max has read the cards, start at card 01: opening on the first card due a clarifier (card 02
      // when it is a Major) looked as if the reading began at card 02 (9 Nov UAT, laptop).
      if(!heardCards)return 0;
      const due=typeof nextDueClarifier==='function'?nextDueClarifier():-1;
      return due>=0?due:0;
    };
    function updateBar(){
      const bar=$('mcClarifyBar');if(!bar)return;
      const i=pickedIndex(),step=clarifyStepFor(i),labels=positionLabels();
      bar.querySelectorAll('[data-pick]').forEach(b=>{const on=Number(b.dataset.pick)===i;b.setAttribute('aria-checked',String(on));b.classList.toggle('is-picked',on);const st=clarifyStepFor(Number(b.dataset.pick));b.dataset.state=st?(clarifierPlan().positions[Number(b.dataset.pick)].mayChooseFirst?'optional':'due'):'done';});
      const go=$('mcClarifyGo'),name=cardName(byId(state.drawnCardIds[i])),where=state.drawnCardIds.length>1?`${String(i+1).padStart(2,'0')} · ${labels[i]}: `:'';
      $('mcFinish').textContent=readingFinished()?'Reading finished ✓':'Finish reading';
      $('mcFinish').disabled=readingFinished();
      if(!go){$('mcPickNote').textContent='';return;}
      go.disabled=!step;go.dataset.step=step||'done';
      go.textContent=step==='first'?'✦ Clarify this card':step==='second'?'✦ Add second clarifier':step==='clarity'?'✦ Draw Clarity card':'Card complete ✓';
      const spot=clarifierPlan().positions[i];
      $('mcPickNote').textContent=where+name+(step==='first'?(spot.needsFirst?' is a Major Arcana card: a clarifier is due.':' — you may clarify it if you wish.'):step==='second'?' — its first clarifier is a Major, so a second is due.':step==='clarity'?' — three Major Arcana cards: a Clarity card is due.':' — fully clarified.');
      root.querySelectorAll('.mc-card').forEach((el,k)=>el.classList.toggle('is-picked',k===i));
      const strip=root.querySelector('.mc-cards'),card=root.querySelectorAll('.mc-card')[i];
      // Only follow a card once Max is speaking or the seeker has picked one: on opening, the strip starts at
      // card 1 (8 Nov, P2: the first card must be fully visible without sideways scrolling).
      // Once the narration ends, go back to the card to clarify next, even from the far end of the strip.
      if((picked!=null||index>=0||root.classList.contains('is-finished'))&&strip&&card&&strip.scrollWidth>strip.clientWidth)setTimeout(()=>stripTo(strip,card),260);
    }
    root.addEventListener('click',e=>{
      const pick=e.target.closest('[data-pick]');
      if(pick){picked=Number(pick.dataset.pick);updateBar();const card=root.querySelectorAll('.mc-card')[picked];const strip=root.querySelector('.mc-cards');stripTo(strip,card);}
    });
    $('mcClarifyGo')?.addEventListener('click',()=>{
      const i=pickedIndex(),step=clarifyStepFor(i);
      if(!step)return;
      clarifyingInPlayer=true;
      try{clarifyPosition(i);}finally{clarifyingInPlayer=false;}
      full=buildScript();heardSig=readingSig();if(player)player.sig=heardSig;
      picked=i;
      load(deltaFor(full,i,step));
      updateBar();
    });
    $('mcFinish')?.addEventListener('click',()=>{
      if(readingFinished())return;
      state.maxFinishedSig=readingSig();
      full=buildScript();
      // Finish reading used to jump straight to the ending even when Max had not read a single card, so
      // the seeker heard "Before I go…" and no reading (9 Nov UAT, laptop). If the cards have not been
      // heard yet, Max reads the whole reading first, then the ending.
      load(heardCards?full.filter(p=>p.chapter==='final'||p.chapter==='close'):full);
      updateBar();
    });
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
    player={script,root,pack,sig,close,get voice(){return muted?null:(voice?voice.id:null);},chapter:typeof chapter==='string'?chapter:null};
    updateBar();
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
    (anchor||interpretation).insertAdjacentHTML(anchor?'afterend':'beforebegin',`<section class="mc-launch"><div class="eyebrow">MAX CHASROOM · PRESENTER PREVIEW</div><p>A short spoken walk through this reading. The full reading stays below.</p><button type="button" class="gold-button" id="mcOpen">${updatedSinceHeard()?'↻ Replay Updated Reading':'▶ Watch Max Chasroom present this reading'}</button>${updatedSinceHeard()?'<p class="mc-updated" role="status">Your reading has changed since Max presented it. Replay to hear the updated reading.</p>':''}${extra?`<div class="mc-launch-more">${extra}</div>`:''}</section>`);
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
  // Floating dock: [✦ Clarify NN] [▶ Watch Max] (Samsung UAT 6 Nov; team directive 7 Nov 2026).
  // The launcher sits at the top of the reading; on a phone, following a Celtic Cross down the page leaves it
  // far above the screen. Once every card is revealed, the dock stays at the bottom of the screen wherever you
  // are, so both controls are always one tap away. Clarify acts on one card only: the card you are looking at
  // (the spread position or its written reading nearest the middle of the screen), and its label names that
  // card. It draws that card's next clarifier under Chas's teaching rule, or shows that the card is complete.
  // Both controls stay together in the dock throughout the reading. The dock hides while Max is open and
  // goes away when you leave the reading. (Without Clarify, as in the demo, ▶ Watch Max alone hides while
  // the top launcher is visible, as before.)
  // One dock at a time: a re-render tears down the previous dock's timer and observer. (Fixed 7 Nov: the old
  // observer outlived its dock and, on its next callback, cleared the new dock's timer, freezing its label.)
  let floatTimer=0,floatIO=null,dockTarget=-1;
  function focusedPosition(){
    const mid=innerHeight/2;
    let best=-1,dist=Infinity;
    const consider=(el,i)=>{const r=el.getBoundingClientRect();if(!r.height||r.bottom<0||r.top>innerHeight)return;const d=r.top<=mid&&r.bottom>=mid?0:Math.min(Math.abs(r.top-mid),Math.abs(r.bottom-mid));if(d<dist){dist=d;best=i;}};
    document.querySelectorAll('.reading-position').forEach((el,i)=>consider(el,i));
    document.querySelectorAll('.reading-meaning[data-position]').forEach(el=>consider(el,Number(el.dataset.position)));
    return best;
  }
  function selectPrompt(){
    document.getElementById('mcSelectPrompt')?.remove();
    const spread=document.querySelector('.spread-scroll');
    spread?.insertAdjacentHTML('beforebegin','<p class="mc-select-prompt" id="mcSelectPrompt" role="status">Choose the card to clarify: scroll to it, or to its reading, then tap ✦ Clarify. Only that card is clarified.</p>');
    spread?.scrollIntoView({behavior:scrollMotion(),block:'start'});
  }
  function floatWatch(){
    clearInterval(floatTimer);floatIO?.disconnect();floatIO=null;
    document.getElementById('mcDock')?.remove();
    const top=document.querySelector('.mc-launch');
    if(!top)return;
    const canClarify=typeof clarifyPosition==='function'&&!isDemo();
    document.body.insertAdjacentHTML('beforeend',`<div class="mc-dock" id="mcDock" role="toolbar" aria-label="Reading controls" hidden>${canClarify?'<button type="button" class="mc-clarify" id="mcClarify"><span class="mc-clarify-k">✦ Clarify</span><span class="mc-clarify-v" id="mcClarifyCard"></span></button>':''}${updatedSinceHeard()?'<button type="button" class="mc-float is-updated" id="mcFloat" aria-label="Replay the updated reading with Max Chasroom"><span class="mc-float-screen" aria-hidden="true"></span>↻ Replay Updated</button>':'<button type="button" class="mc-float" id="mcFloat" aria-label="Watch Max Chasroom present this reading"><span class="mc-float-screen" aria-hidden="true"></span>▶ Watch Max</button>'}</div>`);
    document.body.classList.add('has-mc-dock');
    const dock=document.getElementById('mcDock'),btn=document.getElementById('mcFloat'),clar=document.getElementById('mcClarify');
    btn.addEventListener('click',()=>openPlayer());
    // BT-09 (QA matrix, 7 Nov): with no card in view, Clarify never guesses: it asks you to choose a card.
    clar?.addEventListener('click',()=>{
      if(dockTarget<0){selectPrompt();return;}
      if(clarifyStepFor(dockTarget))clarifyPosition(dockTarget);
    });
    let topVisible=true;
    const io=floatIO='IntersectionObserver' in window?new IntersectionObserver(e=>{topVisible=e[0].isIntersecting;update();}):null;
    io?.observe(top);
    let timer=0;
    let shown='';
    function update(){
      if(state.view!=='draw'||!document.body.contains(top)){clearInterval(timer);io?.disconnect();if(floatTimer===timer){dock.remove();document.body.classList.remove('has-mc-dock');}return;}
      const open=!!document.querySelector('.mc-player');
      dock.hidden=!(state.drawSettled&&!open);
      if(!clar)dock.hidden=dock.hidden||topVisible;
      // Watch Max ↔ Replay Updated Reading follows whether the reading has changed since Max last presented it.
      const upd=updatedSinceHeard();
      if(btn.classList.contains('is-updated')!==upd){
        btn.classList.toggle('is-updated',upd);
        btn.innerHTML=`<span class="mc-float-screen" aria-hidden="true"></span>${upd?'↻ Replay Updated':'▶ Watch Max'}`;
        btn.setAttribute('aria-label',upd?'Replay the updated reading with Max Chasroom':'Watch Max Chasroom present this reading');
        const top=document.getElementById('mcOpen');
        if(top)top.textContent=upd?'↻ Replay Updated Reading':'▶ Watch Max Chasroom present this reading';
        if(!upd)document.querySelector('.mc-updated')?.remove();
      }
      if(!clar||dock.hidden)return;
      dockTarget=focusedPosition();
      if(dockTarget<0){
        if(shown==='select')return;
        shown='select';
        clar.disabled=false;clar.dataset.position='';clar.dataset.step='select';
        document.getElementById('mcClarifyCard').textContent='choose a card';
        clar.setAttribute('aria-label','Clarify: no card is in view. Choose a card first.');
        return;
      }
      const n=String(dockTarget+1).padStart(2,'0'),label=positionLabels()[dockTarget]||'Card';
      const step=clarifyStepFor(dockTarget);
      const count=readingLayerCards(dockTarget).length;
      const key=dockTarget+'|'+step+'|'+count;
      if(key===shown)return;
      shown=key;
      const name=cardName(byId(state.drawnCardIds[dockTarget]));
      const pair=layers().map(l=>l[dockTarget]);
      const atLimit=!step&&pair.length===2&&pair.every(c=>c&&c.arcana==='Major')&&readingClarity()[dockTarget]==null;
      clar.disabled=!step;
      clar.dataset.position=dockTarget;
      clar.dataset.step=step||'done';
      document.getElementById('mcClarifyCard').textContent=step==='second'?`${n} · Clarifier 2`:step==='clarity'?`${n} · Clarity card`:step?`${n} · ${label}`:(atLimit?`${n} · 2-card limit`:`${n} · clarified ✓`);
      clar.setAttribute('aria-label',step==='clarity'?`Draw a Clarity card for card ${n}, ${label}: ${name}`:step==='first'?`Clarify card ${n}, ${label}: ${name}`:step==='second'?`Draw Clarifier 2 for card ${n}, ${label}: ${name}`:(atLimit?`Card ${n}, ${label}: two clarifiers, both Major Arcana; the two-card limit is reached`:`Card ${n}, ${label}, is fully clarified`));
    }
    floatTimer=timer=setInterval(update,250);
    update();
  }
  // Leaving the reading removes the dock at once (the timer would also catch it within 250 ms).
  if(typeof go==='function'){const presenterGo=go;go=function(){const out=presenterGo.apply(this,arguments);if(state.view!=="draw"){clearInterval(floatTimer);floatIO?.disconnect();floatIO=null;document.getElementById("mcDock")?.remove();document.body.classList.remove('has-mc-dock');}return out;};}
  const presenterRenderDraw=renderDraw;
  renderDraw=function(){
    if(player&&player.sig&&player.sig!==readingSig()&&!clarifyingInPlayer)player.close();   // a card was added outside Max: stop narrating the old reading
    if(heardSig&&JSON.parse(heardSig)[0]!==state.drawnAt)heardSig=null; // a new reading starts fresh
    const outcome=presenterRenderDraw.apply(this,arguments);demoBanner();launcher();floatWatch();return outcome;
  };

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
