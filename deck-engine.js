/* RESONATE v1.0 — pure tarot deck utilities.
   Foundation for primary spread and independently shuffled clarifier layers.
   Browser global: window.ResonateDeck; Node: require('./deck-engine.js').
   This module does not change the currently deployed reading flow. */
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.ResonateDeck=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  function validateDeck(cardIds){
    if(!Array.isArray(cardIds)||cardIds.length!==78)throw new Error('A full tarot deck must have exactly 78 cards');
    if(new Set(cardIds).size!==78)throw new Error('Tarot deck card identifiers must be unique');
    if(cardIds.some(id=>!(typeof id==='string'||Number.isSafeInteger(id))))throw new Error('Invalid card identifier');
    return true;
  }
  function shuffle(cardIds,random=Math.random){
    const result=[...cardIds];
    for(let i=result.length-1;i>0;i--){
      const n=random();
      if(!Number.isFinite(n)||n<0||n>=1)throw new Error('Random source must return [0,1)');
      const j=Math.floor(n*(i+1));
      [result[i],result[j]]=[result[j],result[i]];
    }
    return result;
  }
  function newLayer(cardIds,{readingId,layer,slotCount,random=Math.random}={}){
    validateDeck(cardIds);
    if(!readingId||!Number.isInteger(layer)||layer<0)throw new Error('Reading id and nonnegative layer required');
    if(!Number.isInteger(slotCount)||slotCount<1||slotCount>78)throw new Error('Invalid slot count');
    const draw=shuffle(cardIds,random).slice(0,slotCount);
    return {readingId,layer,deckId:'rider-waite-tarot',deckInstanceId:`${readingId}:tarot:${layer}`,cards:draw};
  }
  function drawRemaining(cardIds,usedIds,count,random=Math.random){
    validateDeck(cardIds);
    const used=new Set(usedIds);
    const available=cardIds.filter(id=>!used.has(id));
    if(!Number.isInteger(count)||count<1||count>available.length)throw new Error('Not enough unused tarot cards');
    return shuffle(available,random).slice(0,count);
  }
  return Object.freeze({validateDeck,shuffle,newLayer,drawRemaining});
});
