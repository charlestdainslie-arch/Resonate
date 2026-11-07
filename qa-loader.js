/* RESONATE · QA sample loader (UAT preview page only; not loaded by index.html).
   Opening presenter-uat.html?qa=<ID> (for example ?qa=B03) shows that QA sample exactly as the test suite and
   the evidence files do: the sample's cards are placed, each clarifier is drawn with the app's own per-card
   clarify (Chas's teaching rule decides Clarifier 1 or 2), the sample's orientations are applied, and the
   reading is fixed at the same time as the evidence. Max then presents it like any reading.
   Samples: audit/qa-samples/samples.json (inputs only; card IDs from the 78-card registry in data.js).
   Purpose: Deep and Dev can open the same reading the evidence files show, on any device, without Node. */
(function () {
  const AT = '2026-11-07T01:00:00.000Z';
  // Render one sample through the app. Returns the steps the app took. Throws on any mismatch.
  function load(sample) {
    const queue = sample.steps.map(s => s.id);
    const original = window.ResonateDeck;
    window.ResonateDeck = { ...original, drawRemaining(ids, used, count) { const got = queue.splice(0, count); if (got.length !== count) throw new Error('sample queue empty'); got.forEach(id => { if (used.includes(id)) throw new Error('queued card already in reading: ' + id); }); return got; } };
    try {
      state.spreadId = sample.spread; state.spreadSize = currentSpread().positions.length;
      Object.assign(state, { drawnCardIds: [...sample.base], drawnAt: AT, view: 'draw', drawSettled: true, drawPhase: 'settled', journalId: null, journalSpread: null, readingReturn: null,
        readingAstrology: null, readingStartedAt: null, openingDice: null, astrologyOff: true,
        firstLayerClarifiers: [], clarifierReadingAt: null, additionalClarifierLayers: [], additionalClarifierReadingAt: null,
        drawnOrientations: { readingAt: AT, reversed: [] } });
      render();
      const drew = sample.steps.map(s => {
        const step = clarifyPosition(s.pos);
        if (step !== (s.layer === 1 ? 'first' : 'second')) throw new Error(`${sample.id}: position ${s.pos + 1} drew "${step}", sample expects Clarifier ${s.layer}`);
        return step;
      });
      state.drawnOrientations = { readingAt: AT, reversed: [...sample.reversed] };
      renderDraw();
      return drew;
    } finally { window.ResonateDeck = original; }
  }
  window.ResonateQA = { load, AT };
  const id = new URLSearchParams(location.search).get('qa');
  if (!id) return;
  const banner = text => document.querySelector('.draw-stage h1')?.insertAdjacentHTML('afterend', `<p class="mc-demo-banner" role="note" id="qaBanner"><strong>QA SAMPLE ${text}</strong></p>`);
  window.addEventListener('load', async () => {
    try {
      const res = await fetch('audit/qa-samples/samples.json', { cache: 'no-store' });
      const sample = (await res.json()).find(s => s.id === id.toUpperCase());
      if (!sample) throw new Error('no sample ' + id);
      load(sample);
      banner(`${sample.id} · fixed cards for testing, not drawn for you. ${sample.note}.`);
    } catch (e) { go('home'); document.querySelector('.page')?.insertAdjacentHTML('afterbegin', `<p class="mc-demo-banner" role="alert">QA sample could not be loaded: ${String(e.message).replace(/</g, '&lt;')}</p>`); }
  });
})();
