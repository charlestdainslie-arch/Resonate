const test=require('node:test');
const assert=require('node:assert/strict');
const astro=require('../astrology-prelude.js');

test('zodiac wrap and degree boundaries are correct',()=>{
  assert.equal(astro.signAt(0).sign,'Aries');
  assert.equal(astro.signAt(30).sign,'Taurus');
  assert.equal(astro.signAt(359.8).sign,'Pisces');
  assert.equal(astro.signAt(-1).sign,'Pisces');
  assert.equal(astro.signAt(390).sign,'Taurus');
});
test('Chinese new year is honoured rather than 1 January',()=>{
  assert.deepEqual(
    {animal:astro.chineseYear('1968-03-24').animal,element:astro.chineseYear('1968-03-24').element},
    {animal:'Monkey',element:'Earth'}
  );
  assert.equal(astro.chineseYear('1968-01-02').animal,'Goat');
  assert.equal(astro.chineseYear('1968').boundaryKnown,false);
  assert.equal(astro.chineseYear('1968-03-24').boundaryKnown,true);
});
test('historical birthplace time zone changes the UTC instant',()=>{
  assert.equal(astro.localBirthToUTC('1968-03-24','13:10','Europe/London').toISOString(),
    '1968-03-24T12:10:00.000Z');
  assert.throws(()=>astro.localBirthToUTC('1968-03-24','13:10','Mars/Olympus'),/time zone/i);
  assert.throws(()=>astro.localBirthToUTC('1968-02-30','13:10','Europe/London'),/birth date/i);
});
test('quick Aries 1968 profile does not invent Moon or Rising',()=>{
  const p=astro.birthProfile({sunSign:'Aries',birthYear:'1968'});
  assert.equal(p.sunSign,'Aries');
  assert.equal(p.chinese.label,'Earth Monkey');
  assert.equal(p.moon,null);
  assert.equal(p.rising,null);
  assert.ok(p.warnings.some(x=>x.includes('lunar year')));
});
test('more input without time never fabricates Moon or Rising',()=>{
  const p=astro.birthProfile({sunSign:'Aries',birthYear:'1968',birthDate:'1968-03-24'});
  assert.equal(p.chinese.label,'Earth Monkey');
  assert.equal(p.moon,null);
  assert.equal(p.rising,null);
});
test('invalid and contradictory birth fields are rejected',()=>{
  assert.throws(()=>astro.birthProfile({birthYear:'1968',birthDate:'1969-03-24'}),/do not match/);
  assert.throws(()=>astro.birthProfile({birthYear:'1810'}),/1900–2100/);
  assert.throws(()=>astro.birthProfile({birthTime:'13:10'}),/birth date/);
});
test('Rising chooses the eastern ecliptic/horizon intersection',()=>{
  const stub={SiderealTime:()=>0}; // Greenwich sidereal angle 0 degrees
  const longitude=astro.risingLongitude(stub,new Date('2026-10-23T00:00:00Z'),0,0);
  assert.ok(Math.abs(longitude-90)<0.5,'Expected ascending point near Cancer 0°, got '+longitude);
});
test('sky snapshots take their exact requested time and preserve calculated aspects',()=>{
  const positions={Sun:211,Moon:90,Mercury:213,Venus:210,Mars:120,
    Jupiter:130,Saturn:30,Uranus:80,Neptune:0,Pluto:300};
  const fake={Body:Object.fromEntries(Object.keys(positions).map(k=>[k,k])),
    GeoVector:(body)=>({body}),Ecliptic:({body})=>({elon:positions[body]})};
  const at=new Date('2026-10-23T01:02:03Z');
  const reading=astro.buildPrelude({sunSign:'Aries',birthYear:'1968'},fake,at);
  assert.equal(reading.sky.at,at.toISOString());
  assert.equal(reading.sky.positions.Sun.sign,'Scorpio');
  assert.equal(reading.natal.chinese.label,'Earth Monkey');
  assert.ok(reading.sky.aspects.length>0);
  assert.ok(reading.sky.aspects.every(x=>x.orb<=2));
  assert.equal(reading.natal.moon,null);
  assert.equal(reading.natal.rising,null);
});
test('live astronomical library smoke test',()=>{
  const Astronomy=require('../vendor/astronomy.browser.min.js');
  assert.equal(typeof Astronomy.GeoVector,'function');
  assert.equal(typeof Astronomy.SiderealTime,'function');
  const reading=astro.buildPrelude({sunSign:'Aries',birthYear:'1968'},Astronomy,new Date('2026-10-23T01:00:00Z'));
  assert.ok(['Libra','Scorpio'].includes(reading.sky.positions.Sun.sign));
  assert.equal(Object.keys(reading.sky.positions).length,10);
  assert.ok(reading.sky.illumination>=0&&reading.sky.illumination<=100);
  const natal=astro.birthProfile({
    sunSign:'Aries',birthYear:'1968',birthDate:'1968-03-24',birthTime:'13:10',
    timeZone:'Europe/London',latitude:'56.11',longitude:'-3.34'
  },Astronomy);
  assert.equal(natal.sunSign,'Aries');
  assert.ok(natal.moon?.sign);
  assert.ok(natal.rising?.sign);
  assert.ok(natal.birthUTC);
});
