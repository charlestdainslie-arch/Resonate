/* Optional opening dice ritual. Non-predictive symbolic interpretation. */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.ResonateDice=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 const symbols=['potential and new beginnings','initiative and direction','balance and connection','creativity and expression','structure and stability','change and adaptability','care and responsibility','reflection and inner wisdom','confidence and practical progress','completion and renewal'];
 function roll(random=Math.random){
  const values=[random(),random()];
  if(values.some(x=>!Number.isFinite(x)||x<0||x>=1))throw Error('Invalid dice randomness');
  return values.map(x=>Math.floor(x*10));
 }
 function interpret(values){
  if(!Array.isArray(values)||values.length!==2||values.some(x=>!Number.isInteger(x)||x<0||x>9))throw Error('Expected two digits from 0 to 9');
  const [a,b]=values;
  return `Your numbers are ${a} and ${b}. In symbolic numerology, ${a} can represent ${symbols[a]}, while ${b} can suggest ${symbols[b]}. Take whichever associations resonate with your experience, and leave the rest.`;
 }
 return Object.freeze({roll,interpret});
});
