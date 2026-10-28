/* RESONATE Astrology Prelude integration — loaded AFTER reading-stage.js.
   Preserves the existing draw, clarifier, dice and spread handlers.
   Only current session state; never writes birth information to localStorage. */
(function(){
  'use strict';
  if(typeof ResonateAstrology==='undefined'||typeof Astronomy==='undefined')return;
  const model=ResonateAstrology;
  const safe=(s)=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  state.astrologyProfile=state.astrologyProfile||{};
  state.astrologyPrelude=null;
  state.astrologyOff=false;
  state.readingAstrology=null;
  const signs=model.SIGNS;
  function snapHtml(snapshot,compact=false){
    const {sky,natal,readingContext}=snapshot;
    const day=new Date(sky.at).toISOString()+' UTC';
    // Moon and Rising are not asked for any more; they appear only in older saved readings that have them.
    const cards=[
      ['SUN',natal.sunSign ? natal.sunSign+(natal.natalSun?' · natal exact':' · selected'):'Not supplied'],
      natal.moon&&['NATAL MOON',model.describe(natal.moon)],
      natal.rising&&['RISING',model.describe(natal.rising)],
      ['CHINESE',natal.chinese?natal.chinese.label+(natal.chinese.boundaryKnown?'':' · year estimate'):'Not supplied: add a birth year']
    ].filter(Boolean);
    if(compact){
      return '<div class="astro-draw-caption"><strong>Session snapshot · '+safe(day)+'</strong>'+
        '<span>'+safe(natal.sunSign||'No natal sign')+' · Sun in '+safe(sky.positions.Sun.sign)+' · Moon in '+safe(sky.positions.Moon.sign)+
        ' · '+safe(sky.lunarPhase)+' Moon</span><p>Symbolic context only; cards were drawn independently.</p></div>';
    }
    const keyPlanets=['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn'];
    const positions=keyPlanets.map(key=>'<li><strong>'+key+'</strong> '+safe(model.describe(sky.positions[key]))+'</li>').join('');
    const aspects=sky.aspects.length
      ?sky.aspects.slice(0,3).map(a=>a.bodies.join('–')+' '+a.kind+' ('+a.orb.toFixed(1)+'° orb)').join(' · ')
      :'No tight major aspects within 2° among these planets';
    const siderealMoon=model.signAt(sky.positions.Moon.longitude-model.lahiriApproximation(new Date(sky.at)));
    const siderealSun=model.signAt(sky.positions.Sun.longitude-model.lahiriApproximation(new Date(sky.at)));
    return '<div class="astro-snapshot" aria-live="polite"><div class="eyebrow">SESSION SKY · '+safe(day)+'</div>'+
      '<h3>Your Cosmic Snapshot</h3><div class="astro-profile-grid">'+cards.map(([k,v])=>
        '<div><span>'+k+'</span><strong>'+safe(v)+'</strong></div>').join('')+'</div>'+
      '<p class="astro-theme">'+safe(readingContext.theme)+'</p>'+
      '<h4>Western (tropical) sky at session start</h4><ul class="astro-planet-grid">'+positions+'</ul>'+
      '<p>The Moon is '+safe(sky.lunarPhase)+' (approximately '+sky.illumination+'% illuminated). '+
      '<strong>Planetary aspects at session start:</strong> '+safe(aspects)+'.</p>'+
      '<h4>Vedic-style sidereal context</h4><p>Approximate Lahiri sidereal Sun: <strong>'+safe(model.describe(siderealSun))+
      '</strong>; session Moon: <strong>'+safe(model.describe(siderealMoon))+'</strong>.'+
      (natal.siderealSun?'<br>Natal sidereal Sun: <strong>'+safe(model.describe(natal.siderealSun))+
       '</strong>; natal sidereal Moon: <strong>'+safe(model.describe(natal.siderealMoon))+'</strong>.':'')+
      ' Sidereal conversion is approximate, not a fully calculated Vedic birth chart.</p>'+
      '<p class="astro-accuracy">Calculated locally with Astronomy Engine. The calculation method and library fingerprint stay with this snapshot.'+(natal.birthUTC?' Birth time uses historical time-zone rules. Historical or high-latitude chart points need specialist verification.':'')+'</p>'+
      (natal.warnings.length?'<div class="astro-accuracy"><strong>Precision notes:</strong> '+natal.warnings.map(safe).join(' ')+'</div>':'')+
      '<p class="astro-explainer">These positions are calculated when you request the snapshot, not taken from a daily horoscope. Astrology provides a symbolic perspective; it cannot determine which tarot cards you will draw or predict events reliably.</p></div>';
  }
  // Chas, 28 Oct UAT: the journey asks only for Sun sign and birth year, both optional. Birth date,
  // time, time zone and coordinates are not asked for, so no Moon or Rising sign is ever shown.
  function inputValue(s){return safe(s||'');}
  function mountPrelude(){
    const opening=document.querySelector('.opening-dice');
    if(!opening||document.getElementById('astroPrelude'))return;
    const p=state.astrologyProfile||{};
    const section=document.createElement('section');
    section.className='astro-prelude';
    section.id='astroPrelude';
    section.setAttribute('aria-labelledby','astroPreludeTitle');
    section.innerHTML='<div class="eyebrow">BEFORE YOUR CARDS · OPTIONAL</div><h2 id="astroPreludeTitle">Add astrology to your reading</h2>'+
      '<p>Astrology is optional. Add your Sun sign, your birth year, both or neither, or go straight to the cards.</p>'+
      '<div class="astro-buttons astro-skip-row"><button type="button" class="ghost-button astro-continue" id="astroContinue">Continue to tarot without astrology</button></div>'+
      '<form id="astroProfileForm" class="astro-profile-form" novalidate><div class="astro-quick-grid">'+
      '<label>Western Sun sign<select name="sunSign" aria-describedby="astroSignHelp"><option value="">Optional · choose a sign</option>'+
      signs.map(s=>'<option value="'+s+'"'+(p.sunSign===s?' selected':'')+'>'+s+'</option>').join('')+'</select><small id="astroSignHelp" class="astro-field-help">Your star sign, from your birthday.</small></label>'+
      '<label>Birth year<input name="birthYear" type="text" inputmode="numeric" maxlength="4" enterkeyhint="done" autocomplete="bday-year" placeholder="Optional, e.g. 1968" aria-describedby="astroYearHelp" value="'+inputValue(p.birthYear)+'"><small id="astroYearHelp" class="astro-field-help">For your Chinese zodiac sign.</small></label>'+
      '</div><p class="astro-accuracy">These stay in this open page only. Nothing is looked up or sent anywhere. Moon and Rising signs need an exact birth time and place, so they are not part of this reading.</p>'+
      '<div class="astro-buttons"><button type="submit" class="draw-cta">Calculate my sky</button>'+
      '<button type="button" class="ghost-button" id="astroSkip">Clear my details</button>'+
      '<button type="button" class="ghost-button" id="astroDemo">Show an example (doesn’t change your reading)</button></div>'+
      '<p id="astroStatus" class="astro-status" role="status" aria-live="polite"></p></form>'+
      '<div id="astroError" class="astro-error" role="alert" hidden></div>'+
      '<div id="astroResult"></div><div id="astroExampleResult"></div>';
    opening.parentNode.insertBefore(section,opening);
    // Shown beside the spread buttons when a choice is needed, so they never just scroll away.
    const picker=document.querySelector('.spread-picker');
    const gate=document.createElement('div');
    gate.className='astro-gate';gate.id='astroGate';gate.setAttribute('role','alert');gate.hidden=true;
    if(picker)picker.parentNode.insertBefore(gate,picker);
    const form=section.querySelector('#astroProfileForm');
    const result=section.querySelector('#astroResult');
    const error=section.querySelector('#astroError');
    const status=section.querySelector('#astroStatus');
    const yearInput=form.elements.namedItem('birthYear');
    let dirty=false,failed=false;
    function resetOpeningNumbers(){
      if(!state.openingDice)return;
      state.openingDice=null;
      const values=document.getElementById('openingDiceValues'),meaning=document.getElementById('openingDiceMeaning');
      if(values)values.textContent='– · –';
      if(meaning)meaning.textContent='The session moment changed. Roll opening numbers again, or continue without them.';
    }
    function clearMessages(){
      error.hidden=true;error.innerHTML='';gate.hidden=true;gate.innerHTML='';
      form.querySelectorAll('.astro-field-error').forEach(n=>n.remove());
      yearInput.removeAttribute('aria-invalid');yearInput.setAttribute('aria-describedby','astroYearHelp');
    }
    function fail(message){
      // Never keep a previous result once the details on screen are not usable.
      resetOpeningNumbers();
      state.astrologyProfile={};state.astrologyPrelude=null;state.astrologyOff=false;result.innerHTML='';failed=true;
      const note=document.createElement('small');
      note.className='astro-field-error';note.id='astroMsg-birthYear';note.textContent=message;
      yearInput.closest('label').appendChild(note);
      yearInput.setAttribute('aria-invalid','true');yearInput.setAttribute('aria-describedby','astroYearHelp astroMsg-birthYear');
      error.hidden=false;
      error.innerHTML='<p>Please check the birth year above, or continue to tarot without astrology.</p><button type="button" class="ghost-button" data-astro-continue>Continue to tarot without astrology</button>';
      error.querySelector('[data-astro-continue]').onclick=()=>continueWithout();
      yearInput.focus({preventScroll:true});
      yearInput.scrollIntoView({block:'center'});
    }
    function readProfile(){
      const sunSign=String(form.elements.namedItem('sunSign').value||''),birthYear=yearInput.value.trim();
      if(birthYear&&!/^\d{4}$/.test(birthYear))return {problem:'Enter a four-digit year, for example 1968, or leave it blank.'};
      if(birthYear&&(Number(birthYear)<1900||Number(birthYear)>2100))return {problem:'Birth years from 1900 to 2100 are supported.'};
      return {profile:{sunSign,birthYear}};
    }
    function calculate(profile){
      resetOpeningNumbers();
      try{
        const snap=model.buildPrelude({sunSign:profile.sunSign||'',birthYear:profile.birthYear||''},Astronomy,new Date());
        state.astrologyProfile={sunSign:profile.sunSign||'',birthYear:profile.birthYear||''};
        state.astrologyPrelude=model.snapshot(snap);
        state.astrologyOff=false;dirty=false;failed=false;
        result.innerHTML=snapHtml(snap);
        return true;
      }catch(ex){fail(String(ex.message||ex));return false;}
    }
    // UAT D6: always give visible feedback and bring the result into view, even when the snapshot looks the same.
    function submit(){
      clearMessages();status.textContent='';
      const {profile,problem}=readProfile();
      if(problem){fail(problem);return false;}
      if(!calculate(profile))return false;
      const parts=[];
      if(profile.sunSign)parts.push('Sun sign '+profile.sunSign);
      if(profile.birthYear)parts.push('birth year '+profile.birthYear);
      const time=new Date(state.astrologyPrelude.sky.at).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'});
      status.textContent='✓ Sky calculated at '+time+(parts.length?' using your '+parts.join(' and ')+'.':'. No details entered, so this shows the sky right now only.')+' Choose a spread below when you’re ready.';
      return true;
    }
    function clearFields(){form.reset();form.elements.namedItem('sunSign').value='';yearInput.value='';}
    function scrollToSpreads(){(picker||gate).scrollIntoView({block:'start',behavior:typeof scrollMotion==='function'?scrollMotion():'auto'});}
    // Astrology off: no personal details and no snapshot go into the reading.
    function continueWithout(spreadButton){
      clearMessages();clearFields();resetOpeningNumbers();
      state.astrologyProfile={};state.astrologyPrelude=null;state.astrologyOff=true;dirty=false;failed=false;
      result.innerHTML='';section.querySelector('#astroExampleResult').innerHTML='';
      status.textContent='Astrology is off for this reading. Choose a spread below. To add it back, choose a sign or year and select Calculate my sky.';
      if(spreadButton)chooseSpreads.get(spreadButton)();else scrollToSpreads();
    }
    form.onsubmit=e=>{e.preventDefault();if(submit())result.scrollIntoView({block:'start',behavior:typeof scrollMotion==='function'?scrollMotion():'auto'});};
    form.addEventListener('input',()=>{dirty=true;});
    form.addEventListener('change',()=>{dirty=true;});
    section.querySelector('#astroContinue').onclick=()=>continueWithout();
    section.querySelector('#astroDemo').onclick=()=>{
      const example=model.snapshot(model.buildPrelude({sunSign:'Aries',birthYear:'1968'},Astronomy,new Date()));
      section.querySelector('#astroExampleResult').innerHTML='<h3>Example only — not your profile or session</h3>'+snapHtml(example);
    };
    section.querySelector('#astroSkip').onclick=()=>{
      clearMessages();clearFields();calculate({});
      status.textContent='Your details are cleared. The reading will show the sky right now only.';
    };
    if(state.astrologyOff)status.textContent='Astrology is off for this reading. To add it, choose a sign or year and select Calculate my sky.';
    else calculate(state.astrologyProfile);
    // Spread buttons always answer. If the details on screen can't be used yet, say so right here
    // and offer both ways forward, instead of jumping back up the page.
    const chooseSpreads=new Map();
    for(const button of document.querySelectorAll('[data-spread]')){
      const chooseSpread=button.onclick;
      chooseSpreads.set(button,chooseSpread);
      button.onclick=()=>{
        if(!failed&&!dirty&&(state.astrologyOff||state.astrologyPrelude)){gate.hidden=true;chooseSpread();return;}
        const changed=!failed;
        gate.innerHTML='<p>'+(changed?'You changed your Sun sign or birth year but haven’t calculated it yet.':'Your birth year can’t be used yet.')+'</p><div class="astro-buttons">'+
          '<button type="button" class="draw-cta" data-gate="calc">'+(changed?'Calculate and continue':'Fix my birth year')+'</button>'+
          '<button type="button" class="ghost-button" data-gate="skip">Continue without astrology</button></div>';
        gate.hidden=false;
        gate.querySelector('[data-gate="skip"]').onclick=()=>continueWithout(button);
        gate.querySelector('[data-gate="calc"]').onclick=()=>{
          if(!changed){gate.hidden=true;submit();return;}
          if(submit()){gate.hidden=true;chooseSpread();}
        };
        gate.scrollIntoView({block:'nearest'});
      };
    }
  }
  const originalReadingHub=renderReadingHub;
  renderReadingHub=function(){
    originalReadingHub();
    mountPrelude();
  };
  const originalStartDraw=startDraw;
  startDraw=function(){
    // One pre-draw moment: never recalculate after the dice or during a return. With astrology off,
    // or no usable snapshot, the reading carries no astrology at all rather than refusing to draw.
    state.readingAstrology=state.astrologyOff||!state.astrologyPrelude?null:model.snapshot(state.astrologyPrelude);
    state.readingStartedAt=state.readingAstrology?.sky.at||null;
    return originalStartDraw.apply(this,arguments);
  };
  const originalRenderDraw=renderDraw;
  renderDraw=function(){
    const outcome=originalRenderDraw.apply(this,arguments);
    const stage=document.querySelector('.draw-stage.multi');
    if(stage&&state.readingAstrology&&!stage.querySelector('.astro-draw-caption')){
      const heading=stage.querySelector('#readingInterpretation');
      if(heading){
        const snapshot=document.createElement('section');
        snapshot.className='astro-reading-summary';
        snapshot.setAttribute('aria-label','Astrology snapshot at the time of your reading');
        snapshot.innerHTML=snapHtml(state.readingAstrology,true)+'<details><summary>Full preserved astrology snapshot</summary>'+snapHtml(state.readingAstrology)+'</details>';
        heading.parentNode.insertBefore(snapshot,heading);
      }
    }
    return outcome;
  };
})();
