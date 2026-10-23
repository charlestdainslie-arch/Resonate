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
    const day=new Date(sky.at).toLocaleString(undefined,{dateStyle:'full',timeStyle:'short'});
    const cards=[
      ['SUN',natal.sunSign ? natal.sunSign+(natal.natalSun?' · natal exact':' · selected'):'Not supplied'],
      ['NATAL MOON',natal.moon?model.describe(natal.moon):'Optional — needs birth date, time and zone'],
      ['RISING',natal.rising?model.describe(natal.rising):'Optional — needs exact birth time and birthplace coordinates'],
      ['CHINESE',natal.chinese?natal.chinese.label+(natal.chinese.boundaryKnown?'':' · year estimate'):'Optional — birth year needed']
    ];
    if(compact){
      return '<div class="astro-draw-caption"><strong>Cosmic snapshot · '+safe(day)+'</strong>'+
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
    return '<div class="astro-snapshot" aria-live="polite"><div class="eyebrow">LIVE SKY · '+safe(day)+'</div>'+
      '<h3>Your Cosmic Snapshot</h3><div class="astro-profile-grid">'+cards.map(([k,v])=>
        '<div><span>'+k+'</span><strong>'+safe(v)+'</strong></div>').join('')+'</div>'+
      '<p class="astro-theme">'+safe(readingContext.theme)+'</p>'+
      '<h4>Today’s Western (tropical) sky</h4><ul class="astro-planet-grid">'+positions+'</ul>'+
      '<p>The Moon is '+safe(sky.lunarPhase)+' (approximately '+sky.illumination+'% illuminated). '+
      '<strong>Current planetary aspects:</strong> '+safe(aspects)+'.</p>'+
      '<h4>Vedic-style sidereal context</h4><p>Approximate Lahiri sidereal Sun: <strong>'+safe(model.describe(siderealSun))+
      '</strong>; current Moon: <strong>'+safe(model.describe(siderealMoon))+'</strong>.'+
      (natal.siderealSun?'<br>Natal sidereal Sun: <strong>'+safe(model.describe(natal.siderealSun))+
       '</strong>; natal sidereal Moon: <strong>'+safe(model.describe(natal.siderealMoon))+'</strong>.':'')+
      ' Sidereal conversion is approximate, not a fully calculated Vedic birth chart.</p>'+
      (natal.warnings.length?'<div class="astro-accuracy"><strong>Precision notes:</strong> '+natal.warnings.map(safe).join(' ')+'</div>':'')+
      '<p class="astro-explainer">These positions are calculated when you request the snapshot, not taken from a daily horoscope. Astrology provides a symbolic perspective; it cannot determine which tarot cards you will draw or predict events reliably.</p></div>';
  }
  function profileFromForm(form){
    const get=name=>String(form.elements.namedItem(name)?.value||'').trim();
    return {sunSign:get('sunSign'),birthYear:get('birthYear'),birthDate:get('birthDate'),
      birthTime:get('birthTime'),timeZone:get('timeZone'),latitude:get('latitude'),longitude:get('longitude')};
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
      '<p>Choose a quick Sun-sign profile or add your birth details. The sky is calculated fresh for this session. You can leave this blank and still draw tarot.</p>'+
      '<form id="astroProfileForm" class="astro-profile-form"><div class="astro-quick-grid">'+
      '<label>Western Sun sign<select name="sunSign"><option value="">Optional · choose a sign</option>'+
      signs.map(s=>'<option value="'+s+'"'+(p.sunSign===s?' selected':'')+'>'+s+'</option>').join('')+'</select></label>'+
      '<label>Birth year<input name="birthYear" type="number" min="1900" max="2100" inputmode="numeric" placeholder="e.g. 1968" value="'+inputValue(p.birthYear)+'"></label>'+
      '</div><details class="astro-full-birth"><summary>Optional full birth details · Moon and Rising</summary>'+
      '<p>For your natal Moon, supply birth date, local clock time and the time zone at the place of birth. Rising also needs the birthplace latitude and longitude. We never guess missing chart points.</p>'+
      '<div class="astro-detail-grid">'+
      '<label>Birth date<input name="birthDate" type="date" min="1900-01-01" max="2100-12-31" value="'+inputValue(p.birthDate)+'"></label>'+
      '<label>Local birth time<input name="birthTime" type="time" value="'+inputValue(p.birthTime)+'"></label>'+
      '<label>Birthplace time zone<input name="timeZone" type="text" placeholder="e.g. Europe/London" value="'+inputValue(p.timeZone)+'" spellcheck="false" autocomplete="off"></label>'+
      '<label>Birthplace latitude<input name="latitude" type="number" step="any" min="-89" max="89" placeholder="e.g. 56.11" value="'+inputValue(p.latitude)+'"></label>'+
      '<label>Birthplace longitude<input name="longitude" type="number" step="any" min="-180" max="180" placeholder="e.g. -3.34" value="'+inputValue(p.longitude)+'"></label>'+
      '</div><p class="astro-accuracy">Birth details remain in this open page’s memory only. Latitude/longitude and timezone are manual in this first slice; no lookup or third-party birth-data upload occurs.</p></details>'+
      '<div class="astro-buttons"><button type="submit" class="draw-cta">Calculate my sky</button>'+
      '<button type="button" class="ghost-button" id="astroDemo">Example: Aries · 1968</button>'+
      '<button type="button" class="ghost-button" id="astroSkip">Clear birth profile</button></div></form>'+
      '<div id="astroError" class="astro-error" role="alert" hidden></div>'+
      '<div id="astroResult"></div>';
    opening.parentNode.insertBefore(section,opening);
    const form=section.querySelector('#astroProfileForm');
    const result=section.querySelector('#astroResult');
    const error=section.querySelector('#astroError');
    function show(profile){
      try{
        const snap=model.buildPrelude(profile,Astronomy,new Date());
        state.astrologyProfile={...profile};
        state.astrologyPrelude=snap;
        result.innerHTML=snapHtml(snap);
        error.hidden=true;error.textContent='';
      }catch(ex){
        error.hidden=false;error.textContent='Unable to calculate this profile: '+String(ex.message||ex);
        // Do not quietly retain stale readings after invalid input.
        state.astrologyProfile={};state.astrologyPrelude=null;result.innerHTML='';
      }
    }
    form.onsubmit=e=>{e.preventDefault();show(profileFromForm(form));};
    section.querySelector('#astroDemo').onclick=()=>{
      form.elements.namedItem('sunSign').value='Aries';
      form.elements.namedItem('birthYear').value='1968';
      for(const key of ['birthDate','birthTime','timeZone','latitude','longitude'])
        form.elements.namedItem(key).value='';
      show(profileFromForm(form));
    };
    section.querySelector('#astroSkip').onclick=()=>{
      form.reset();
      for(const el of form.elements)if(el.name)el.value='';
      show({});
    };
    show(state.astrologyProfile);
  }
  const originalReadingHub=renderReadingHub;
  renderReadingHub=function(){
    originalReadingHub();
    mountPrelude();
  };
  const originalStartDraw=startDraw;
  startDraw=function(){
    // Preserve the sky at the moment cards are drawn; it must not change
    // during clarifier draws, note edits or navigation.
    try{
      state.readingAstrology=model.buildPrelude(state.astrologyProfile||{},Astronomy,new Date());
    }catch(e){
      state.readingAstrology=null;
    }
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
        snapshot.innerHTML=snapHtml(state.readingAstrology,true);
        heading.parentNode.insertBefore(snapshot,heading);
      }
    }
    return outcome;
  };
})();
