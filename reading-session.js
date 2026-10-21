/* Reading sessions and independent clarifier-deck layers.
   Pure state operations. No UI or billing dependencies. */
(function(root,factory){
  const api=factory(typeof module==='object'&&module.exports?require('./deck-engine.js'):root.ResonateDeck);
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.ResonateReadingSession=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(deck){
  if(!deck)throw new Error('ResonateDeck must load first');
  const MAX_CLARIFIER_LAYERS=3;
  function createSession({id,cardIds,spreadPositions,random=Math.random}){
    if(typeof id!=='string'||!id.trim())throw new Error('Reading id required');
    if(!Array.isArray(spreadPositions)||spreadPositions.length<1||spreadPositions.length>78)throw new Error('Invalid spread positions');
    if(spreadPositions.some(x=>typeof x!=='string'||!x.trim()))throw new Error('Position labels required');
    const base=deck.newLayer(cardIds,{readingId:id,layer:0,slotCount:spreadPositions.length,random});
    return {id,deckId:base.deckId,positions:[...spreadPositions],baseCards:base.cards,layers:[],createdAt:new Date().toISOString(),schemaVersion:1};
  }
  function appendClarifierLayer(session,cardIds,{random=Math.random,targetPositions}={}){
    if(!session||!Array.isArray(session.layers)||!Array.isArray(session.positions))throw new Error('Invalid reading session');
    if(session.layers.length>=MAX_CLARIFIER_LAYERS)throw new Error('Maximum clarifier layers reached');
    const positions=targetPositions===undefined?session.positions.map((_,i)=>i):targetPositions;
    if(!Array.isArray(positions)||!positions.length||new Set(positions).size!==positions.length||positions.some(i=>!Number.isInteger(i)||i<0||i>=session.positions.length))throw new Error('Invalid clarifier targets');
    const number=session.layers.length+1;
    const draw=deck.newLayer(cardIds,{readingId:session.id,layer:number,slotCount:positions.length,random});
    const layer={number,deckId:draw.deckId,deckInstanceId:draw.deckInstanceId,entries:positions.map((position,i)=>({position,cardId:draw.cards[i]}))};
    return {...session,layers:[...session.layers,layer]};
  }
  return Object.freeze({createSession,appendClarifierLayer,MAX_CLARIFIER_LAYERS});
});
