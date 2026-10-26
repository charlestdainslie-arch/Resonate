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
  state.readingAstrology=null;
  const signs=model.SIGNS;
  function snapHtml(snapshot,compact=false){
    const {sky,natal,readingContext}=snapshot;
    const day=new Date(sky.at).toISOString()+' UTC';
    const cards=[
      ['SUN',natal.sunSign ? natal.sunSign+(natal.natalSun?' · natal exact':' · selected'):'Not supplied'],
      ['NATAL MOON',natal.moon?model.describe(natal.moon):'Optional — needs birth date, time and zone'],
      ['RISING',natal.rising?model.describe(natal.rising):'Optional — needs exact birth time and birthplace coordinates'],
      ['CHINESE',natal.chinese?natal.chinese.label+(natal.chinese.boundaryKnown?'':' · year estimate'):'Optional — birth year needed']
    ];
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
      '<p class="astro-accuracy">Calculated locally with Astronomy Engine. The calculation method and library fingerprint stay with this snapshot. Birth time uses historical time-zone rules; repeated times require your earlier/later choice. Historical or high-latitude chart points need specialist verification.</p>'+  
      (natal.warnings.length?'<div class="astro-accuracy"><strong>Precision notes:</strong> '+natal.warnings.map(safe).join(' ')+'</div>':'')+
      '<p class="astro-explainer">These positions are calculated when you request the snapshot, not taken from a daily horoscope. Astrology provides a symbolic perspective; it cannot determine which tarot cards you will draw or predict events reliably.</p></div>';
  }
  // UAT D1/D2: plain text fields with the number keyboard instead of native date/time pickers,
  // which did not open on Chas's Android in-app browser. The model still receives YYYY-MM-DD and HH:MM.
  const DATE_HELP='Enter your birth date as DD/MM/YYYY, for example 15/03/1968.';
  const TIME_HELP='Enter your birth time as HH:MM on a 24-hour clock, for example 09:30 or 21:45.';
  function isoToDisplayDate(iso){const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso||''));return m?m[3]+'/'+m[2]+'/'+m[1]:String(iso||'');}
  function formatDateDigits(value){const d=String(value).replace(/\D/g,'').slice(0,8);return d.length>4?d.slice(0,2)+'/'+d.slice(2,4)+'/'+d.slice(4):d.length>2?d.slice(0,2)+'/'+d.slice(2):d;}
  function formatTimeDigits(value){const d=String(value).replace(/\D/g,'').slice(0,4);return d.length>2?d.slice(0,2)+':'+d.slice(2):d;}
  function parseBirthDate(text){
    const t=String(text||'').trim();if(!t)return '';
    if(/^\d{4}-\d{2}-\d{2}$/.test(t))return t;
    const parts=/^\d{8}$/.test(t)?[t.slice(0,2),t.slice(2,4),t.slice(4)]:t.split(/[\/.\-\s]+/);
    if(parts.length!==3||!/^\d{1,2}$/.test(parts[0])||!/^\d{1,2}$/.test(parts[1])||!/^\d{4}$/.test(parts[2]))throw Error(DATE_HELP);
    const [day,month,year]=parts.map(Number),check=new Date(Date.UTC(year,month-1,day));
    if(check.getUTCFullYear()!==year||check.getUTCMonth()!==month-1||check.getUTCDate()!==day)throw Error('That date does not exist. '+DATE_HELP);
    if(year<1900||year>2100)throw Error('Birth dates from 1900 to 2100 are supported.');
    return String(year)+'-'+String(month).padStart(2,'0')+'-'+String(day).padStart(2,'0');
  }
  function parseBirthTime(text){
    const t=String(text||'').trim();if(!t)return '';
    const m=/^(\d{1,2})(?:[:.\s]?(\d{2}))$/.exec(t);
    if(!m||Number(m[1])>23||Number(m[2])>59)throw Error(TIME_HELP);
    return m[1].padStart(2,'0')+':'+m[2];
  }
  function profileFromForm(form){
    const get=name=>String(form.elements.namedItem(name)?.value||'').trim();
    return {sunSign:get('sunSign'),birthYear:get('birthYear'),birthDate:parseBirthDate(get('birthDate')),
      birthTime:parseBirthTime(get('birthTime')),timeZone:get('timeZone'),latitude:get('latitude'),longitude:get('longitude'),disambiguation:get('disambiguation')||'reject'};
  }
  function inputValue(s){return safe(s||'');}
  function mountPrelude(){
    const opening=document.querySelector('.opening-dice');
    if(!opening||document.getElementById('astroPrelude'))return;
    const p=state.astrologyProfile||{};
    const section=document.createElement('section');
    section.className='astro-prelude';
    section.id='astroPrelude';
    section.setAttribute('aria-labelledby','astroPreludeTitle');
    section.innerHTML='<div class="eyebrow">BEFORE YOUR CARDS</div><h2 id="astroPreludeTitle">The sky at the start of your reading</h2>'+
      '<p>Choose a quick Sun-sign profile or add your birth details. The sky is calculated fresh for this session. You can leave this blank and still draw tarot. Select Calculate my sky to use edited details; changing the snapshot resets opening numbers.</p>'+
      '<form id="astroProfileForm" class="astro-profile-form"><div class="astro-quick-grid">'+
      '<label>Western Sun sign<select name="sunSign"><option value="">Optional · choose a sign</option>'+
      signs.map(s=>'<option value="'+s+'"'+(p.sunSign===s?' selected':'')+'>'+s+'</option>').join('')+'</select></label>'+
      '<label>Birth year<input name="birthYear" type="number" min="1900" max="2100" inputmode="numeric" placeholder="e.g. 1968" value="'+inputValue(p.birthYear)+'"></label>'+
      '</div><details class="astro-full-birth"><summary>Optional full birth details · Moon and Rising</summary>'+
      '<p>For your natal Moon, supply birth date, local clock time and the time zone at the place of birth. Rising also needs the birthplace latitude and longitude. We never guess missing chart points.</p>'+
      '<div class="astro-detail-grid">'+
      '<label>Birth date<input name="birthDate" type="text" inputmode="numeric" autocomplete="bday" maxlength="10" placeholder="DD/MM/YYYY" aria-describedby="astroDateHelp" value="'+inputValue(isoToDisplayDate(p.birthDate))+'"><small id="astroDateHelp" class="astro-field-help">Day / month / year, e.g. 15/03/1968</small></label>'+
      '<label>Local birth time<input name="birthTime" type="text" inputmode="numeric" maxlength="5" placeholder="HH:MM" aria-describedby="astroTimeHelp" value="'+inputValue(p.birthTime)+'"><small id="astroTimeHelp" class="astro-field-help">24-hour clock, e.g. 09:30 or 21:45</small></label>'+
      '<label>Birthplace time zone<input name="timeZone" type="text" placeholder="e.g. Europe/London" value="'+inputValue(p.timeZone)+'" spellcheck="false" autocomplete="off"></label>'+
      '<label>Repeated clock time<select name="disambiguation" aria-describedby="astroRepeatHelp"><option value="reject">Ask me if it happens twice</option><option value="earlier">The earlier one</option><option value="later">The later one</option></select><small id="astroRepeatHelp" class="astro-field-help">Only matters if the clocks went back at your birth time, so that time happened twice.</small></label>'+
      '<label>Birthplace latitude<input name="latitude" type="number" step="any" min="-89" max="89" placeholder="e.g. 56.11" value="'+inputValue(p.latitude)+'"></label>'+
      '<label>Birthplace longitude<input name="longitude" type="number" step="any" min="-180" max="180" placeholder="e.g. -3.34" value="'+inputValue(p.longitude)+'"></label>'+
      '</div><p class="astro-accuracy">Birth details remain in this open page’s memory only. Latitude/longitude and timezone are manual in this first slice; no lookup or third-party birth-data upload occurs.</p></details>'+
      '<div class="astro-buttons"><button type="submit" class="draw-cta">Calculate my sky</button>'+
      '<button type="button" class="ghost-button" id="astroDemo">Preview example (not used for your reading)</button>'+
      '<button type="button" class="ghost-button" id="astroSkip">Clear birth profile</button></div>'+
      '<p id="astroStatus" class="astro-status" role="status" aria-live="polite"></p></form>'+
      '<div id="astroError" class="astro-error" role="alert" hidden></div>'+
      '<div id="astroResult"></div><div id="astroExampleResult"></div>';
    opening.parentNode.insertBefore(section,opening);
    const form=section.querySelector('#astroProfileForm');
    form.elements.namedItem('disambiguation').value=p.disambiguation||'reject';
    const result=section.querySelector('#astroResult');
    const error=section.querySelector('#astroError');
    function resetOpeningNumbers(){
      if(!state.openingDice)return;
      state.openingDice=null;
      const values=document.getElementById('openingDiceValues'),meaning=document.getElementById('openingDiceMeaning');
      if(values)values.textContent='– · –';
      if(meaning)meaning.textContent='The session moment changed. Roll opening numbers again, or continue without them.';
    }
    const status=section.querySelector('#astroStatus');
    function show(profile){
      resetOpeningNumbers();
      try{
        const snap=model.buildPrelude(profile,Astronomy,new Date());
        state.astrologyProfile={...profile};
        state.astrologyPrelude=model.snapshot(snap);
        result.innerHTML=snapHtml(snap);
        error.hidden=true;error.textContent='';
      }catch(ex){
        error.hidden=false;error.textContent='Unable to calculate this profile: '+String(ex.message||ex);
        // Do not quietly retain stale readings after invalid input.
        state.astrologyProfile={};state.astrologyPrelude=null;result.innerHTML='';
      }
    }
    const dateInput=form.elements.namedItem('birthDate'),timeInput=form.elements.namedItem('birthTime');
    dateInput.addEventListener('input',()=>{if(!/[^\d\/]/.test(dateInput.value))dateInput.value=formatDateDigits(dateInput.value);});
    timeInput.addEventListener('input',()=>{if(!/[^\d:]/.test(timeInput.value))timeInput.value=formatTimeDigits(timeInput.value);});
    // UAT D6: always give visible feedback and bring the result into view, even when the snapshot looks the same.
    function used(profile){
      const parts=[];
      if(profile.sunSign)parts.push('Sun sign '+profile.sunSign);
      if(profile.birthYear)parts.push('birth year '+profile.birthYear);
      if(profile.birthDate)parts.push('birth date '+isoToDisplayDate(profile.birthDate));
      if(profile.birthTime)parts.push('birth time '+profile.birthTime);
      if(profile.latitude&&profile.longitude)parts.push('birthplace coordinates');
      return parts;
    }
    form.onsubmit=e=>{
      e.preventDefault();
      status.textContent='';
      let profile;
      try{profile=profileFromForm(form);}
      catch(ex){
        // Same rule as show(): never quietly keep a stale snapshot after invalid input.
        resetOpeningNumbers();state.astrologyProfile={};state.astrologyPrelude=null;result.innerHTML='';
        error.hidden=false;error.textContent=String(ex.message||ex);error.scrollIntoView({block:'center'});return;
      }
      show(profile);
      if(!state.astrologyPrelude){error.scrollIntoView({block:'center'});return;}
      const time=new Date(state.astrologyPrelude.sky.at).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'});
      const parts=used(profile);
      status.textContent='\u2713 Sky calculated at '+time+(parts.length?' using your '+parts.join(', ')+'.':'. No birth details entered, so this shows the sky right now only.');
      result.scrollIntoView({block:'start',behavior:typeof scrollMotion==='function'?scrollMotion():'auto'});
    };
    section.querySelector('#astroDemo').onclick=()=>{
      const example=model.snapshot(model.buildPrelude({sunSign:'Aries',birthYear:'1968'},Astronomy,new Date()));
      section.querySelector('#astroExampleResult').innerHTML='<h3>Example only — not your profile or session</h3>'+snapHtml(example);
    };
    section.querySelector('#astroSkip').onclick=()=>{
      status.textContent='';
      form.reset();
      for(const el of form.elements)if(el.name)el.value='';
      show({});
    };
    show(state.astrologyProfile);
    for(const button of document.querySelectorAll('[data-spread]')){
      const chooseSpread=button.onclick;
      button.onclick=()=>{if(!state.astrologyPrelude){error.hidden=false;error.textContent='Correct the profile or select Clear birth profile to continue anonymously.';error.scrollIntoView({block:'center'});return;}chooseSpread();};
    }
  }
  const originalReadingHub=renderReadingHub;
  renderReadingHub=function(){
    originalReadingHub();
    mountPrelude();
  };
  const originalStartDraw=startDraw;
  startDraw=function(){
    if(!state.astrologyPrelude)return;
    // One pre-draw moment: never recalculate after the dice or during a return.
    state.readingAstrology=model.snapshot(state.astrologyPrelude);
    state.readingStartedAt=state.readingAstrology.sky.at;
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
