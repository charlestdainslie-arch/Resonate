// Renders one QA sample (tests/helpers/qa-samples.cjs) through the app's own functions on presenter-uat.html:
// the base cards are placed, then each clarifier is drawn with clarifyPosition(pos), the app's own per-card
// clarify (Chas's teaching rule decides Clarifier 1 or 2), with the deck's draw returning the sample's next
// card. Orientations are then set to the sample's, and the page is rendered at a fixed reading time.
// Returns what the page, Max's script and Max's on-screen transcript say. Throws if the app draws a different
// layer than the sample's sequence expects, or refuses a step.
'use strict';
const AT = '2026-11-07T01:00:00.000Z';

async function renderSample(page, sample) {
  const out = await page.evaluate(({ sample, AT }) => {
    // The same loader the preview uses for ?qa=<ID> (qa-loader.js), so evidence and preview cannot differ.
    if (window.ResonateQA.AT !== AT) throw new Error('reading time differs from qa-loader.js');
    const drew = window.ResonateQA.load(sample);
    const name = id => cards.find(c => c.id === id).name;
    const labels = positionLabels(), descs = currentSpread().positions.map(p => p[1]);
    const second = (state.additionalClarifierLayers.find(l => l.number === 2)?.cards) || [];
    document.querySelectorAll('.reading-meaning details').forEach(d => { d.open = true; });
    const txt = el => el ? el.innerText.replace(/\n{3,}/g, '\n\n').trim() : '';
    const positions = state.drawnCardIds.map((id, i) => {
      const art = document.querySelector(`.reading-meaning[data-position="${i}"]`);
      const card = cid => cid == null ? null : { id: cid, name: name(cid), arcana: cards.find(c => c.id === cid).arcana, element: cards.find(c => c.id === cid).element, reversed: isReversed(cards.find(c => c.id === cid)) };
      return {
        n: i + 1, label: labels[i], meaning: descs[i],
        base: card(id), c1: card(state.firstLayerClarifiers?.[i] ?? null), c2: card(second[i] ?? null),
        steps: [...art.querySelectorAll('.reading-step')].map(e => e.textContent.trim()),
        original: txt(art.querySelector('.original-card-explanation')),
        clar1: txt(art.querySelector('.integrated-clarifier[data-clarifier="1"]')),
        clar2: txt(art.querySelector('.integrated-clarifier[data-clarifier="2"]')),
        notes: [...art.querySelectorAll('.reading-pending, .reading-limit')].map(txt).join('\n'),
        together: txt(art.querySelector('.combined-meaning')),
        lenses: txt([...art.querySelectorAll('.reading-card-lenses')].length ? art.querySelector('.reading-card-lenses') : null),
        positionContext: txt(art.querySelector('.position-context')),
        relation1: txt(art.querySelector('.integrated-clarifier[data-clarifier="1"] .clarifier-relation')),
        relation2: txt(art.querySelector('.integrated-clarifier[data-clarifier="2"] .clarifier-relation')),
        synthesisLead: txt(art.querySelector('.synthesis-lead')), synthesisWider: txt(art.querySelector('.synthesis-wider')),
        limit: !!art.querySelector('.reading-limit'), pending: !!art.querySelector('.reading-pending')
      };
    });
    const valid = ResonateClarifiers.validate(state.drawnCardIds.map(id => cards.find(c => c.id === id)), state.firstLayerClarifiers, second, x => cards.find(c => c.id === x));
    return {
      spreadName: currentSpread().name, drew, valid, positions,
      goldenThread: txt(document.querySelector('.reading-golden-thread')),
      pageText: txt(document.getElementById('readingInterpretation')),
      script: ResonatePresenter.buildScript().map(p => ({ chapter: p.chapter, kind: p.kind, text: p.text }))
    };
  }, { sample, AT });
  // Max's on-screen transcript, as the player shows it.
  await page.evaluate(() => document.getElementById('mcOpen').click());
  await page.waitForSelector('.mc-player .mc-transcript li', { state: 'attached' });
  out.transcript = await page.$$eval('.mc-player .mc-transcript li', lis => lis.map(li => li.textContent));
  await page.evaluate(() => document.getElementById('mcClose').click());
  await page.waitForSelector('.mc-player', { state: 'detached' });
  return out;
}
module.exports = { renderSample, AT };
