// M2 card-stack measurement (14 Nov 2026). Paste into the console of index.html (any viewport), then:
//   await __m2.deal('celtic'); __m2.measure();  await __m2.clarifyAll(); __m2.measure();
// Spreads: guidance (One-card), three, seven, relationship, celtic.
// Majors-first deck: call __m2.majorsFirst() before dealing, so every position gets two clarifiers (and Clarity
// cards where three Majors meet), the fullest layout. Same rule as tests/helpers/majors-first.cjs.
// In a hidden or background tab, call __m2.backgroundSafe() first: requestAnimationFrame does not fire there, so the
// deal never settles. Screenshots from a hidden tab can show stale frames; trust the numbers, not those images.
// measure() returns, for the spread board only: horizontal page overflow (scrollW vs vw), inner scroll of the spread
// region, elements beyond the viewport edge, card/card and card/label overlaps, and clipped labels.
window.__m2 = {
  sleep: ms => new Promise(r => setTimeout(r, ms)),
  async until(fn, t = 120000) { const s = Date.now(); while (!fn()) { if (Date.now() - s > t) throw new Error('timeout'); await this.sleep(100); } },
  backgroundSafe() { window.requestAnimationFrame = cb => setTimeout(() => cb(performance.now()), 16); },
  majorsFirst() {
    const api = window.__deckOrig || window.ResonateDeck; window.__deckOrig = api;
    const isMajor = id => id < 22;
    const shuffle = (ids, random) => { const out = api.shuffle(ids, random); return [...out.filter(isMajor), ...out.filter(id => !isMajor(id))]; };
    window.ResonateDeck = Object.freeze({ ...api, shuffle, drawRemaining(ids, used, count, random) { const u = new Set(used); return shuffle(ids.filter(id => !u.has(id)), random).slice(0, count); } });
  },
  async deal(spread) {
    try { speechSynthesis.speak = () => {}; } catch (e) {}
    go('reading'); await this.sleep(300);
    document.querySelector(`[data-spread="${spread}"]`).click();
    await this.until(() => document.querySelector('.dt-deck'));
    document.getElementById('shuffleCardsBtn').click();
    await this.until(() => !window.ResonateDeckTheatre.busy);
    document.getElementById('stageDrawBtn').click();
    await this.until(() => state.view === 'draw' && state.drawSettled);
    await this.sleep(800);
  },
  async clarifyAll() {
    let n = 0;
    for (; n < 40; n++) { const d = [...document.querySelectorAll('[data-clarify-position].clarify-due')].find(b => /Clarifier 1/.test(b.textContent) && !b.disabled); if (!d) break; d.click(); await this.sleep(400); }
    for (; n < 90; n++) { const b = document.getElementById('primaryClarifierAction'); if (!b || b.disabled || !/Clarifier|Clarity card/.test(b.textContent)) break; b.click(); await this.sleep(400); }
    await this.sleep(1500); return n;
  },
  measure() {
    const vw = document.documentElement.clientWidth, out = { vw, scrollW: document.documentElement.scrollWidth, overflowRight: [], overlaps: [], clippedLabels: [] };
    const board = document.querySelector('.spread-board');
    const els = [...board.querySelectorAll('.reading-card, .slot-label, .position-clarifier, .clarifier-layer-label, .reading-position strong, [data-clarify-position]')].filter(e => e.offsetParent);
    const name = e => (e.className.baseVal ?? e.className).toString().split(' ')[0] + ':' + (e.closest('.reading-position') ? [...board.children].indexOf(e.closest('.reading-position')) + 1 : '?');
    for (const e of els) { const r = e.getBoundingClientRect(); if (r.right > vw + 0.5 || r.left < -0.5) out.overflowRight.push(name(e) + ` [${r.left | 0},${r.right | 0}]`); if (e.scrollWidth > e.clientWidth + 1 && /label|strong/i.test(e.tagName + e.className)) out.clippedLabels.push(name(e)); }
    const cards = [...board.querySelectorAll('.reading-card, .position-clarifier')].filter(e => e.offsetParent).map(e => ({ e, r: e.getBoundingClientRect() }));
    const texts = [...board.querySelectorAll('.slot-label, .clarifier-layer-label, [data-clarify-position]')].filter(e => e.offsetParent).map(e => ({ e, r: e.getBoundingClientRect() }));
    const hit = (a, b) => Math.min(a.right, b.right) - Math.max(a.left, b.left) > 2 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 2;
    for (let i = 0; i < cards.length; i++) for (let j = i + 1; j < cards.length; j++) if (!cards[i].e.contains(cards[j].e) && !cards[j].e.contains(cards[i].e) && hit(cards[i].r, cards[j].r)) out.overlaps.push('card/card ' + name(cards[i].e) + ' x ' + name(cards[j].e));
    for (const c of cards) for (const t of texts) if (!c.e.contains(t.e) && !t.e.contains(c.e) && hit(c.r, t.r)) out.overlaps.push('card/text ' + name(c.e) + ' x ' + name(t.e));
    const sc = document.querySelector('.spread-scroll'); out.innerScroll = sc ? sc.scrollWidth - sc.clientWidth : 0;
    out.positions = board.children.length; out.clarifiers = board.querySelectorAll('.position-clarifier').length;
    return out;
  }
};
