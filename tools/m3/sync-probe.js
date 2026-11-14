// M3 sync probe (14 Nov 2026). Measures how the Golden Thread light keeps pace with Max, without changing app code:
// it tears down the page's light (ResonateKiss.destroy) and loads an identical copy of golden-thread-kiss.js
// with one read-only getter added, so the light's position can be sampled every frame.
// Use in presenter-uat.html with the browser pane VISIBLE (hidden tabs throttle animation frames):
//   await __m3.install();  await __m3.deal('celtic');  await __m3.runMax();  __m3.report()
// Spreads: guidance, three, seven, relationship, celtic.
window.__m3 = {
  sleep: ms => new Promise(r => setTimeout(r, ms)),
  async until(f, t = 180000) { const s = Date.now(); while (!f()) { if (Date.now() - s > t) throw new Error('timeout'); await this.sleep(100); } },
  async install() {
    if (window.ResonateKiss?.__light) return 'already';
    const src = await fetch('/golden-thread-kiss.js?probe=' + Date.now()).then(r => r.text());
    const marker = "var api = window.ResonateKiss = { version: 'tinkerbell-8-follow' };";
    if (!src.includes(marker)) throw new Error('light source changed: probe marker not found');
    window.ResonateKiss?.destroy?.();
    // The copy is the page's own file plus one getter that reads (never writes) the light.
    (0, eval)(src.replace(marker, marker + " api.__light = function () { return light ? { x: light.x, y: light.y, visible: light.visible, alpha: light.alpha } : null; };"));
    return window.ResonateKiss.version;
  },
  async deal(sp) {
    try { speechSynthesis.speak = () => {}; } catch (e) {}
    go('reading'); await this.sleep(300);
    document.querySelector(`[data-spread="${sp}"]`).click();
    await this.until(() => document.querySelector('.dt-deck'));
    document.getElementById('shuffleCardsBtn').click();
    await this.until(() => !window.ResonateDeckTheatre.busy);
    const t = performance.now(); document.getElementById('stageDrawBtn').click();
    await this.until(() => state.view === 'draw' && state.drawSettled);
    this.dealMs = Math.round(performance.now() - t);
    this.dealKissed = document.querySelectorAll('.gtk-kissed').length; this.dealCards = state.drawnCardIds.length;
    await this.sleep(600);
  },
  // Plays Max (muted: captions keep time) from the start to the end, sampling the light every frame.
  async runMax(opt = {}) {
    if (!document.querySelector('.mc-player')) { await ResonatePresenter.openPlayer(); await this.sleep(600); }
    const root = document.querySelector('.mc-player'); if (!opt.sound) document.getElementById('mcSound').click();
    this.parts = []; let cur = null; const parts = this.parts;
    const target = slot => { const el = root.querySelector(`[data-slot="${slot}"]`); const pic = el && (el.querySelector('img') || el); return pic; };
    const onShow = e => { const now = performance.now(); if (cur) cur.end = now;
      const fresh = (e.detail.show || []).filter(s => /^(p\d+|c\d+-\d+|k\d+)$/.test(s));
      cur = { index: e.detail.index, start: now, end: null, show: e.detail.show || [], slot: fresh[fresh.length - 1] || null, arrived: null, restOn: null, text: ResonatePresenter.player?.script?.[e.detail.index]?.text?.slice(0, 50) };
      parts.push(cur); };
    document.addEventListener('maxchasroom:show', onShow);
    let running = true; const self = this;
    (function frame() { if (!running) return; const L = window.ResonateKiss?.__light?.(); if (cur && cur.slot && L && L.visible) {
        const pic = target(cur.slot); if (pic) { const r = pic.getBoundingClientRect(); const hx = r.left + r.width / 2, hy = r.top - 14;
          const lx = L.x - scrollX, ly = L.y - scrollY, d = Math.hypot(lx - hx, ly - hy);
          // Arrival = the light reaches the card itself (the kiss lands mid-card), not the hover point above it.
          if (cur.arrived == null && lx >= r.left && lx <= r.right && ly >= r.top && ly <= r.bottom) cur.arrived = performance.now();
          if (cur.hover == null && d < 12) cur.hover = performance.now();
          cur.lastD = Math.round(d); cur.lastOver = [...root.querySelectorAll('[data-slot]')].filter(el => { const q = (el.querySelector('img') || el).getBoundingClientRect(); return lx >= q.left && lx <= q.right && ly >= q.top - 30 && ly <= q.bottom; }).map(el => el.dataset.slot); } }
      requestAnimationFrame(frame); })();
    document.getElementById('mcPlay').click();
    await this.until(() => root.classList.contains('is-finished'), opt.timeout || 600000);
    if (cur) cur.end = performance.now(); running = false; document.removeEventListener('maxchasroom:show', onShow);
    return this.report();
  },
  report() {
    const withSlot = this.parts.filter(p => p.slot);
    const rows = withSlot.map(p => { const dur = Math.round(p.end - p.start), lag = p.arrived == null ? null : Math.round(p.arrived - p.start);
      return { i: p.index, slot: p.slot, durMs: dur, lagMs: lag, hoverMs: p.hover == null ? null : Math.round(p.hover - p.start), lateHalf: lag == null || lag > dur / 2, endDistPx: p.lastD, endOver: p.lastOver, text: p.text }; });
    const firstVisit = {}; rows.forEach(r => { firstVisit[r.slot] = (firstVisit[r.slot] || 0) + 1; });
    const named = [...new Set(rows.map(r => r.slot))];
    const lags = rows.filter(r => r.lagMs != null).map(r => r.lagMs).sort((a, b) => a - b);
    return { spread: state.spreadId, vw: innerWidth, dealMs: this.dealMs, dealKissed: this.dealKissed, dealCards: this.dealCards,
      parts: this.parts.length, cardParts: rows.length, slotsNamed: named.length,
      neverArrived: rows.filter(r => r.lagMs == null).map(r => `${r.i}:${r.slot}`),
      lateHalf: rows.filter(r => r.lateHalf).map(r => `${r.i}:${r.slot} lag ${r.lagMs} of ${r.durMs}`),
      wrongAtEnd: rows.filter(r => r.endDistPx > 40 && !(r.endOver || []).includes(r.slot)).map(r => `${r.i}:${r.slot} light ${r.endDistPx}px away, over [${(r.endOver || []).join(',')}]`),
      lagMedianMs: lags[Math.floor(lags.length / 2)] ?? null, lagMaxMs: lags[lags.length - 1] ?? null, rows };
  }
};
