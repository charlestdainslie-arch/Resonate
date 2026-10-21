/* Canonical Rider–Waite–Smith tarot catalogue.
   Identity/ordering only; interpretive text and artwork are separate launch work.
   Majors 0–21, Wands 22–35, Cups 36–49, Swords 50–63, Pentacles 64–77.
   Does not replace the five fully authored cards in data.js yet. */
(function(root,factory){
 const catalogue=factory();
 if(typeof module==='object'&&module.exports)module.exports=catalogue;
 else root.ResonateTarotCatalogue=catalogue;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 const major=['The Fool','The Magician','The High Priestess','The Empress','The Emperor','The Hierophant','The Lovers','The Chariot','Strength','The Hermit','Wheel of Fortune','Justice','The Hanged Man','Death','Temperance','The Devil','The Tower','The Star','The Moon','The Sun','Judgement','The World'];
 const ranks=['Ace','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Page','Knight','Queen','King'];
 const suits=['Wands','Cups','Swords','Pentacles'];
 const cards=[
  ...major.map((name,id)=>Object.freeze({id,name,arcana:'major',suit:null,rank:null,deckId:'rws-tarot'})),
  ...suits.flatMap(suit=>ranks.map((rank,index)=>Object.freeze({id:22+suits.indexOf(suit)*14+index,name:`${rank} of ${suit}`,arcana:'minor',suit,rank,deckId:'rws-tarot'})))
 ];
 return Object.freeze(cards);
});
