/* Pure reading journey event sequence. Safe foundation for filament choreography and Phase 2 stages. */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.ResonateJourney=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 function events(session){
  if(!session||!Array.isArray(session.baseCards)||!Array.isArray(session.positions)||session.baseCards.length!==session.positions.length)throw Error('Invalid reading');
  const result=session.baseCards.map((cardId,position)=>({kind:'reveal',layer:0,position,cardId}));
  for(const layer of session.layers||[]){
   if(!Number.isInteger(layer.number)||!Array.isArray(layer.entries))throw Error('Invalid layer');
   for(const entry of layer.entries)result.push({kind:'clarifier',layer:layer.number,position:entry.position,cardId:entry.cardId});
  }
  for(let i=0;i<session.positions.length;i++){
   result.push({kind:'interpretation',position:i,layer:0,cardId:session.baseCards[i]});
   for(const layer of session.layers||[]){
    for(const entry of layer.entries.filter(x=>x.position===i))result.push({kind:'clarifier-interpretation',position:i,layer:layer.number,cardId:entry.cardId});
   }
  }
  result.push({kind:'synthesis'});
  return result;
 }
 return Object.freeze({events});
});
