(function installClarifiers() {
  // A reversible extension. No changes to the five-card baseline or reading-stage renderer.
  const maxLayers=2;
  state.clarifiers={};
  state.clarifierPool=[];
  function getCard(id){return cards.find(c=>c.id===id);}
  function valid(value) {
    const result={};
    if (!value || typeof value!=="object" || Array.isArray(value)) return result;
    for (const [key,items] of Object.entries(value)) {
      if (!/^\d+$/.test(key) || !Array.isArray(items)) continue;
      const filtered=items.slice(0,maxLayers).filter(x=>x && x.deck==="second-tarot" && getCard(x.cardId));
      if (filtered.length) result[key]=filtered.map(x=>({deck:"second-tarot",cardId:x.cardId}));
    }
    return result;
  }
  function newPool() {
    const pile=cards.map(c=>c.id);
    for(let i=pile.length-1;i>0;i--) {
      const j=Math.floor(Math.random()*(i+1));
      [pile[i],pile[j]]=[pile[j],pile[i]];
    }
    state.clarifierPool=pile; // Independent of shuffledDeck and the cards on the table.
  }
  function layers(index) {
    return (state.clarifiers[index]||[]).map(x=>getCard(x.cardId)).filter(Boolean);
  }
  function meaning(base,clar) {
    const own=(base.uprightKeywords?.[0]||"the central theme").toLowerCase();
    const extra=(clar.uprightKeywords?.[0]||"another perspective").toLowerCase();
    if(base.id===clar.id) return `The same card appears in two independently shuffled decks. It repeats the theme of ${own}; notice what deserves closer attention rather than treating repetition as a prediction.`;
    const direct=(base.connections||[]).find(x=>normalise(x.card)===normalise(clar.name));
    const reverse=(clar.connections||[]).find(x=>normalise(x.card)===normalise(base.name));
    if(direct||reverse) return `${(direct||reverse).meaning} Notice how this connection reframes the original position.`;
    return `${base.name} explores ${own}; ${clar.name} adds ${extra}. How does the clarifier support, challenge, or deepen the base card in this position?`;
  }
  function description(index) {
    const base=getCard(state.drawnCardIds[index]);
    if (!base) return "";
    return layers(index).map((clar,n)=>`Clarifier ${n+1} — ${clar.name}: ${meaning(base,clar)}`).join(" ");
  }
  function saveIfAlreadySaved() {
    if (!activeJournal()) return;
    const entry=readingEntry();
    entry.updatedAt=new Date().toISOString();
    writeJournal(entry,document.getElementById("journalSaveStatus"));
  }
  function add(index) {
    if(!state.drawSettled || index<0 || index>=state.drawnCardIds.length) return;
    const existing=state.clarifiers[index]||[];
    if(existing.length>=maxLayers || !cards.length) return;
    if(!state.clarifierPool.length) newPool();
    existing.push({deck:"second-tarot",cardId:state.clarifierPool.pop()});
    state.clarifiers[index]=existing;
    saveIfAlreadySaved();
    paint();
  }
  function undo(index) {
    const existing=state.clarifiers[index]||[];
    if(!existing.length) return;
    existing.pop();
    if(!existing.length) delete state.clarifiers[index];
    saveIfAlreadySaved();
    paint();
  }
  function paint() {
    if(state.view!=="draw") return;
    const board=document.querySelector(".draw-stage .spread-board");
    const golden=document.querySelector(".reading-golden-thread");
    if(!board||!golden) return;
    [...board.querySelectorAll(".reading-position")].forEach((slot,index)=>{
      let target=slot.querySelector(".clarifier-layer");
      if(!target) {
        target=document.createElement("div");
        target.className="clarifier-layer";
        slot.appendChild(target);
      }
      const stack=layers(index), canAdd=stack.length<maxLayers;
      target.innerHTML=`<div class="clarifier-stack">${stack.map((c,i)=>`<div class="clarifier-mini" aria-label="Clarifier ${i+1}: ${escapeHtml(c.name)}"><img src="${cardImage(c)}" alt="" loading="lazy"><span><small>CLARIFIER ${i+1}</small><strong>${escapeHtml(c.name)}</strong></span></div>`).join("")}</div><button type="button" class="clarifier-add" ${!state.drawSettled||!canAdd?"disabled":""} aria-label="Clarify ${escapeHtml(positionLabels()[index]||`position ${index+1}`)}">${canAdd?"+ Clarify":"2 added"}</button>${stack.length?'<button type="button" class="clarifier-undo">Undo last</button>':""}`;
      target.querySelector(".clarifier-add").onclick=()=>add(index);
      const remove=target.querySelector(".clarifier-undo");
      if(remove) remove.onclick=()=>undo(index);
    });
    let summary=golden.querySelector(".clarifier-golden");
    if(!summary){
      summary=document.createElement("section");
      summary.className="clarifier-golden";
      golden.appendChild(summary);
    }
    const indexes=Object.keys(state.clarifiers).map(Number).filter(i=>layers(i).length).sort((a,b)=>a-b);
    summary.innerHTML=`<div class="eyebrow">SECOND DECK · CLARIFIERS</div><h3>The cards in conversation</h3><p class="clarifier-note">Each clarifier comes from a separately shuffled tarot deck, so a main card can appear again. This version supports the full ${cards.length}-card Rider–Waite–Smith tarot deck; separate oracle decks are planned.</p>${indexes.length?indexes.map(i=>`<article class="clarifier-pair"><h4>${escapeHtml(positionLabels()[i]||`Position ${i+1}`)} · ${escapeHtml(getCard(state.drawnCardIds[i]).name)}</h4><p>${escapeHtml(description(i))}</p></article>`).join(""):'<p class="clarifier-note">When the cards settle, select “+ Clarify” beneath any position to explore its meaning.</p>'}<p class="clarifier-note">Clarifiers are included in saved readings and text downloads. Reflective guidance only — not a fixed prediction.</p>`;
  }
  const oldStart=startDraw;
  startDraw=function(){
    state.clarifiers={};
    state.clarifierPool=[];
    oldStart();
  };
  const oldEntry=readingEntry;
  readingEntry=function(){
    const entry=oldEntry();
    entry.clarifiers=valid(state.clarifiers);
    return entry;
  };
  const oldOpen=openJournalReading;
  openJournalReading=function(id) {
    const entry=journalEntries.find(x=>x.id===id);
    state.clarifiers=valid(entry?.clarifiers);
    state.clarifierPool=[];
    oldOpen(id);
  };
  const oldRender=renderDraw;
  renderDraw=function() {
    oldRender();
    paint();
    if(!state.drawSettled) {
      const board=document.querySelector(".draw-stage .spread-board");
      let count=0;
      const timer=setInterval(()=>{
        count++;
        if(count>60||state.view!=="draw"||!document.body.contains(board)) clearInterval(timer);
        else if(state.drawSettled) {
          clearInterval(timer);
          paint();
        }
      },100);
    }
  };
  // Export the narrative and all clarifier layers, not just the initial spread.
  downloadReading=function(){
    const labels=positionLabels();
    const chosen=state.drawnCardIds.map(getCard).filter(Boolean);
    const el=document.createElement("div");
    el.innerHTML=goldenThread(chosen);
    const lines=[
      "RESONATE Tarot Reading",readingTitle(),
      currentSpread().positions.length>cards.length?"Prototype: sample cards repeat to fill positions.":"",
      "",...chosen.map((c,i)=>`${i+1}. ${labels[i]||"Position"} — ${c.name}\n${positionContext(c,i)}\n${c.upright}`),
      "","THE GOLDEN THREAD",el.innerText.trim(),"",
      "CLARIFIERS — SEPARATELY SHUFFLED SECOND TAROT DECK",
      ...Object.keys(state.clarifiers).map(Number).sort((a,b)=>a-b).filter(i=>layers(i).length).map(i=>`${i+1}. ${labels[i]||"Position"} — ${description(i)}`),
      "","For reflection only."
    ];
    const blob=new Blob([lines.join("\n")],{type:"text/plain"});
    const url=URL.createObjectURL(blob),a=document.createElement("a");
    a.href=url;
    a.download="resonate-tarot-reading.txt";
    a.click();
    setTimeout(()=>URL.revokeObjectURL(url),500);
  };
})();
