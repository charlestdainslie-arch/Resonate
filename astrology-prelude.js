/* RESONATE live astrology calculation adapter — optional, symbolic reading context.
   No canned 'today' facts, no external requests, no birth details persisted by this module.
   Browser: ResonateAstrology; Node: require('./astrology-prelude.js'). */
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.ResonateAstrology=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const SIGNS=['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
  const ANIMALS=['Rat','Ox','Tiger','Rabbit','Dragon','Snake','Horse','Goat','Monkey','Rooster','Dog','Pig'];
  const ELEMENTS=['Wood','Fire','Earth','Metal','Water'];
  const THEMES={
    Aries:'taking initiative with care',Taurus:'stability and what deserves your patience',
    Gemini:'curiosity and honest conversation',Cancer:'belonging and emotional boundaries',
    Leo:'creative courage and generous leadership',Virgo:'discernment and useful small steps',
    Libra:'fairness and relationships',Scorpio:'change and emotional honesty',
    Sagittarius:'exploration and broader perspective',Capricorn:'commitment and practical structure',
    Aquarius:'original thinking and community',Pisces:'compassion and reflective imagination'
  };
  const mod=(n,m)=>((n%m)+m)%m;
  function signAt(degrees){
    if(!Number.isFinite(degrees))throw Error('Invalid longitude');
    const longitude=mod(degrees,360);
    const position=longitude%30;
    return {sign:SIGNS[Math.floor(longitude/30)],degrees:Math.floor(position),
      minutes:Math.floor((position%1)*60),longitude};
  }
  function describe(position){return position.sign+' '+position.degrees+'°'+String(position.minutes).padStart(2,'0')+'′';}
  function requireDate(value){
    const date=new Date(value);
    if(Number.isNaN(date.getTime()))throw Error('Invalid date');
    return date;
  }
  function longitudeOf(astronomy,body,date){
    if(!astronomy||!astronomy.Body||!astronomy.GeoVector||!astronomy.Ecliptic)throw Error('Astronomy calculations unavailable');
    const b=astronomy.Body[body];
    if(!b)throw Error('Astronomy body unavailable: '+body);
    return mod(astronomy.Ecliptic(astronomy.GeoVector(b,date,true)).elon,360);
  }
  function currentSky(astronomy,at=new Date()){
    const date=requireDate(at);
    const bodies=['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto'];
    const positions={};
    for(const body of bodies)positions[body]=signAt(longitudeOf(astronomy,body,date));
    const elongation=mod(positions.Moon.longitude-positions.Sun.longitude,360);
    const illumination=(1-Math.cos(elongation*Math.PI/180))/2;
    const phase=elongation<180?'waxing':'waning';
    const candidates=[];
    for(let i=0;i<bodies.length;i++)for(let j=i+1;j<bodies.length;j++){
      const a=bodies[i],b=bodies[j];
      let separation=Math.abs(positions[a].longitude-positions[b].longitude);
      separation=Math.min(separation,360-separation);
      const angles=[['conjunction',0],['sextile',60],['square',90],['trine',120],['opposition',180]];
      for(const [kind,angle] of angles){
        const orb=Math.abs(separation-angle);
        if(orb<=2){candidates.push({bodies:[a,b],kind,orb:+orb.toFixed(2)});break;}
      }
    }
    candidates.sort((a,b)=>a.orb-b.orb);
    return {at:date.toISOString(),positions,lunarPhase:phase,illumination:Math.round(illumination*100),
      aspects:candidates.slice(0,5)};
  }
  function validISODate(input){
    if(!/^\d{4}-\d{2}-\d{2}$/.test(String(input||'')))throw Error('Birth date must be YYYY-MM-DD');
    const [y,m,d]=input.split('-').map(Number);
    const check=new Date(Date.UTC(y,m-1,d,12));
    if(check.getUTCFullYear()!==y||check.getUTCMonth()!==m-1||check.getUTCDate()!==d||y<1900||y>2100)throw Error('Invalid birth date');
    return {year:y,month:m,day:d};
  }
  function chineseYear(yearOrDate){
    let year,boundaryKnown=false;
    if(typeof yearOrDate==='string' && /^\d{4}-\d{2}-\d{2}$/.test(yearOrDate)){
      const {year:y,month,day}=validISODate(yearOrDate);
      const d=new Date(Date.UTC(y,month-1,day,12));
      const parts=new Intl.DateTimeFormat('en-u-ca-chinese',{year:'numeric',timeZone:'UTC'}).formatToParts(d);
      year=Number(parts.find(x=>x.type==='relatedYear')?.value);
      if(!Number.isInteger(year))throw Error('Chinese calendar unavailable');
      boundaryKnown=true;
    }else{
      year=Number(yearOrDate);
      if(!Number.isInteger(year)||year<1900||year>2100)throw Error('Birth year must be 1900–2100');
    }
    const animal=ANIMALS[mod(year-2020,12)];
    const element=ELEMENTS[Math.floor(mod(year-1984,10)/2)];
    return {lunarYear:year,animal,element,boundaryKnown,label:element+' '+animal};
  }
  function timeZoneParts(utcTime,timeZone){
    const parts=new Intl.DateTimeFormat('en-GB',{
      timeZone,year:'numeric',month:'2-digit',day:'2-digit',
      hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'
    }).formatToParts(new Date(utcTime));
    const obj={};
    for(const x of parts)if(x.type!=='literal')obj[x.type]=+x.value;
    return obj;
  }
  function localBirthToUTC(birthDate,birthTime,timeZone,disambiguation='reject'){
    const {year,month,day}=validISODate(birthDate);
    if(!/^([01]\d|2[0-3]):[0-5]\d$/.test(String(birthTime||'')))throw Error('Birth time must be HH:MM');
    if(!String(timeZone||'').trim())throw Error('A birth-place time zone is required for Moon and Rising');
    if(!['reject','earlier','later'].includes(disambiguation))throw Error('Choose reject, earlier or later for repeated local times');
    const [h,min]=birthTime.split(':').map(Number),target=Date.UTC(year,month-1,day,h,min);
    const offsets=new Set(),matches=new Set();
    try{
      for(let hours=-48;hours<=48;hours+=6){
        const sample=target+hours*3600000,p=timeZoneParts(sample,timeZone);
        offsets.add(Date.UTC(p.year,p.month-1,p.day,p.hour,p.minute,p.second)-sample);
      }
      for(const offset of offsets){const candidate=target-offset,p=timeZoneParts(candidate,timeZone);
        if(p.year===year&&p.month===month&&p.day===day&&p.hour===h&&p.minute===min&&p.second===0)matches.add(candidate);
      }
    }catch(e){if(e instanceof RangeError)throw Error('Unknown birth time zone: use an IANA zone such as Europe/London');throw e;}
    const ordered=[...matches].sort((a,b)=>a-b);
    if(!ordered.length)throw Error('This local birth time does not exist in the selected time zone (DST change)');
    if(ordered.length>1&&disambiguation==='reject')throw Error('This birth time occurs twice during a clock change. Choose the earlier or later occurrence, or omit the birth time.');
    return new Date(disambiguation==='later'?ordered[ordered.length-1]:ordered[0]);
  }
  function obliquity(date){
    const t=(date.getTime()/86400000+2440587.5-2451545)/36525;
    return 23.439291111-0.013004167*t-0.0000001639*t*t+0.0000005036*t*t*t;
  }
  function risingLongitude(astronomy,date,latitude,longitude){
    if(!Number.isFinite(latitude)||latitude < -89||latitude > 89 || !Number.isFinite(longitude)||longitude < -180||longitude > 180)
      throw Error('Valid latitude and longitude required for Rising');
    if(!astronomy||typeof astronomy.SiderealTime!=='function')throw Error('Sidereal time calculation unavailable');
    const rad=Math.PI/180, phi=latitude*rad,eps=obliquity(date)*rad;
    const localSidereal=mod(astronomy.SiderealTime(date)*15+longitude,360);
    function horizon(lambda){
      const l=lambda*rad;
      const ra=mod(Math.atan2(Math.sin(l)*Math.cos(eps),Math.cos(l))/rad,360);
      const dec=Math.asin(Math.sin(l)*Math.sin(eps));
      const hourAngle=mod(localSidereal-ra+180,360)-180;
      const height=Math.sin(phi)*Math.sin(dec)+Math.cos(phi)*Math.cos(dec)*Math.cos(hourAngle*rad);
      return {height,hourAngle};
    }
    const roots=[];
    let old=horizon(0);
    for(let x=0.5;x<=360;x+=0.5){
      const next=horizon(x);
      if(old.height*next.height<=0){
        let lo=x-0.5,hi=x,negative=old.height<0;
        for(let iteration=0;iteration<35;iteration++){
          const mid=(lo+hi)/2;
          if((horizon(mid).height<0)===negative)lo=mid;else hi=mid;
        }
        const lambda=mod((lo+hi)/2,360);
        roots.push({longitude:lambda,hourAngle:horizon(lambda).hourAngle});
      }
      old=next;
    }
    const eastern=roots.find(x=>x.hourAngle<0);
    if(!eastern)throw Error('Rising sign unavailable for these coordinates/time');
    return eastern.longitude;
  }
  function lahiriApproximation(at){
    const years=(at.getTime()-Date.UTC(2000,0,1,12))/(365.2425*86400000);
    return 23.8531+0.013969*years;
  }
  function birthProfile(profile={},astronomy){
    const sunProvided=SIGNS.includes(profile.sunSign)?profile.sunSign:null;
    const rawYear=String(profile.birthYear||'').trim();
    let birthYear=rawYear?Number(rawYear):null;
    if(rawYear && (!Number.isInteger(birthYear)||birthYear<1900||birthYear>2100))throw Error('Birth year must be 1900–2100');
    const result={sunSign:sunProvided,birthYear,moon:null,rising:null,
      siderealSun:null,siderealMoon:null,chinese:null,precision:'quick',warnings:[]};
    if(profile.birthDate){
      const parts=validISODate(profile.birthDate);
      if(birthYear&&birthYear!==parts.year)throw Error('Birth year and date do not match');
      birthYear=parts.year;result.birthYear=birthYear;
    }
    if(birthYear)result.chinese=chineseYear(profile.birthDate||birthYear);
    if(profile.birthDate && !profile.birthTime){
      result.warnings.push('Birth time is optional; natal Moon and Rising are not calculated without an exact local time.');
    }
    if(profile.birthTime && !profile.birthDate)throw Error('Enter a birth date to calculate natal Moon and Rising.');
    if(profile.birthDate && profile.birthTime){
      const utc=localBirthToUTC(profile.birthDate,profile.birthTime,profile.timeZone,profile.disambiguation||'reject');
      const sun=longitudeOf(astronomy,'Sun',utc),moon=longitudeOf(astronomy,'Moon',utc);
      const natalSun=signAt(sun);
      result.sunSign=natalSun.sign;result.natalSun=natalSun;
      result.moon=signAt(moon);
      result.siderealSun=signAt(sun-lahiriApproximation(utc));
      result.siderealMoon=signAt(moon-lahiriApproximation(utc));
      result.birthUTC=utc.toISOString();result.precision='timed';result.timeResolution=profile.disambiguation||'reject';
      if(sunProvided&&sunProvided!==natalSun.sign)
        result.warnings.push('Calculated Sun sign differs from quick selection; exact birth details take precedence.');
      const lat=String(profile.latitude??'').trim(),lon=String(profile.longitude??'').trim();
      if(lat||lon){
        if(!lat||!lon)throw Error('Both latitude and longitude are required for Rising.');
        result.rising=signAt(risingLongitude(astronomy,utc,Number(lat),Number(lon)));
      }else{
        result.warnings.push('Rising requires birthplace coordinates; no Rising sign has been guessed.');
      }
    }
    if(!result.sunSign && profile.birthDate){
      result.warnings.push('Select your Sun sign, or provide birth time and time zone for a calculated Sun sign.');
    }
    if(result.chinese && !result.chinese.boundaryKnown)
      result.warnings.push('Chinese zodiac shown by calendar year only; January/February birthdays can belong to the previous lunar year.');
    return result;
  }
  function buildPrelude(profile,astronomy,at=new Date()){
    const sky=currentSky(astronomy,at);
    const natal=birthProfile(profile,astronomy);
    return {version:2,sky,natal,provenance:{
      engine:'Astronomy Engine',engineAssetSHA256:'6615b92711c2e4a5760e8761a2047f18c0729ab81de8879fa47ae71e52646d2e',
      adapter:'RESONATE astrology 2',coordinates:'Apparent geocentric ecliptic longitude of date',
      sidereal:'Approximate Lahiri: 23.8531 degrees at J2000 + 0.013969 degrees/year',
      calendar:'Intl Chinese calendar, date-based lunar-year boundary; year-only values are estimates',
      timeZoneRules:'Runtime Intl/IANA historical rules; repeated birth times require explicit choice',
      observationTimeZone:Intl.DateTimeFormat().resolvedOptions().timeZone,
      lunarIllumination:'Approximation from Sun-Moon elongation, rounded to percent',
      birthTimeResolution:natal.timeResolution||'not supplied'
    },readingContext:{
      title:'Your Cosmic Snapshot',
      theme:natal.sunSign?('With '+natal.sunSign+' Sun, you may reflect on '+THEMES[natal.sunSign]+'.'):'Your current sky offers a symbolic lens before the cards.',
      note:'Astrology is interpretive and does not predetermine your tarot draw or your choices.'
    }};
  }
  function snapshot(value){
    if(!value?.sky)return null;
    const clone=x=>x==null?null:JSON.parse(JSON.stringify(x));
    const n=value.natal||{},point=p=>p?{sign:p.sign,degrees:p.degrees,minutes:p.minutes,longitude:p.longitude}:null;
    return {version:value.version,sky:{at:value.sky.at,positions:clone(value.sky.positions),lunarPhase:value.sky.lunarPhase,
      illumination:value.sky.illumination,aspects:clone(value.sky.aspects)},provenance:clone(value.provenance),
      readingContext:{title:value.readingContext?.title,theme:value.readingContext?.theme,note:value.readingContext?.note},
      natal:{sunSign:n.sunSign||null,natalSun:point(n.natalSun),moon:point(n.moon),rising:point(n.rising),
        siderealSun:point(n.siderealSun),siderealMoon:point(n.siderealMoon),
        chinese:n.chinese?{animal:n.chinese.animal,element:n.chinese.element,label:n.chinese.label,boundaryKnown:n.chinese.boundaryKnown}:null,
        precision:n.precision||'quick',warnings:[...(n.warnings||[])]}};
  }
  function report(snapshot){
    if(!snapshot?.sky)return 'No astrology snapshot was recorded for this reading.';
    const {sky,natal:n,provenance:p,readingContext:r}=snapshot;
    const current=Object.entries(sky.positions).map(([body,pos])=>body+': '+describe(pos)).join('\n');
    const natal=['Selected/calculated Sun: '+(n.sunSign||'not supplied'),'Natal Moon: '+(n.moon?describe(n.moon):'not supplied'),
      'Rising: '+(n.rising?describe(n.rising):'not supplied'),'Chinese: '+(n.chinese?.label||'not supplied'),
      'Natal sidereal Sun (approximate): '+(n.siderealSun?describe(n.siderealSun):'not supplied'),
      'Natal sidereal Moon (approximate): '+(n.siderealMoon?describe(n.siderealMoon):'not supplied')].join('\n');
    return ['Session astrology moment (UTC): '+sky.at,natal,'Western tropical sky',current,
      'Approximate current sidereal Sun: '+describe(signAt(sky.positions.Sun.longitude-lahiriApproximation(new Date(sky.at)))),
      'Approximate current sidereal Moon: '+describe(signAt(sky.positions.Moon.longitude-lahiriApproximation(new Date(sky.at)))),
      'Moon: '+sky.lunarPhase+', approximately '+sky.illumination+'% illuminated.',
      'Aspects: '+(sky.aspects||[]).map(a=>a.bodies.join(' / ')+' '+a.kind+' ('+a.orb+' degree orb)').join('; '),
      r?.theme||'',...(n.warnings||[]),
      'Provenance: '+(p?Object.entries(p).map(([k,v])=>k+': '+v).join('; '):'Legacy snapshot; provenance not recorded.'),
      'Sidereal conversion is approximate, not a full Vedic chart. Astrology is a symbolic interpretation, not a scientifically reliable prediction. It does not control Oracle, dice or tarot draws.'].join('\n\n');
  }
  return Object.freeze({SIGNS,signAt,describe,currentSky,chineseYear,localBirthToUTC,risingLongitude,
    lahiriApproximation,birthProfile,buildPrelude,snapshot,report});
});
