// M2 card-stack measurement, v2 (14 Nov 2026, after Deep's detector review D1-D10).
// Paste into the console of presenter-uat.html (the app plus Max's dock) or index.html, then:
//   __m2.majorsFirst(); await __m2.deal('celtic'); await __m2.measure();
//   await __m2.clarifyAll(); await __m2.measure({ expectFull: true });
// Spreads: guidance (One-card), three, seven, relationship, celtic.
// In a hidden or background tab call __m2.backgroundSafe() first: requestAnimationFrame does not fire there.
// Screenshots from a hidden tab can show stale frames; trust the numbers.
//
// What it checks (each list is a defect list; empty = pass):
//   board.*  the spread board: cards, clarifiers, Clarity cards, labels and per-card buttons
//     edge       beyond the left/right viewport edge (D3: from element geometry, not the page scrollWidth)
//     clipped    box cut by an ancestor with overflow other than visible, horizontally or vertically (D8)
//     text       words cut: text range wider/taller than the box that clips it, line-clamp or ellipsis in
//                effect; works for inline labels too (D4, D5)
//     overlap    card over card, or card over label; 0.5 px tolerance (D9)
//     covered    a board control hidden under something else (fixed dock, sticky bar) when scrolled to the
//                middle of the screen (D1)
//   page.*   every visible text element and control in the draw page, outside the board too (D2)
//     edge, text as above
//   fixed.*  fixed and sticky controls, which offsetParent hides (D1)
//     edge       control cut by the viewport
//     covered    control under something else
//     endCovers  at the foot of the page, the last controls of the reading covered by a fixed control
//   player.* Max's player, opened for the scan: transcript, headings, strong text, #mcCaption, card-strip names,
//            #mcPart; edge, text cut, covered buttons (v3, 14 Nov)
//   full     (expectFull) clarifiers still due, or fewer than two clarifiers per position (D7)
// Lists are complete (not capped); defects = the sum of every list; defectsBy splits it by group. meta records the
// SHA (pass opt.sha), viewport, spread and clarifier state.
// Fonts are settled before measuring (D6). positions counts .reading-position only (D10).
window.__m2 = {
  sleep: ms => new Promise(r => setTimeout(r, ms)),
  async until(fn, t = 180000) { const s = Date.now(); while (!fn()) { if (Date.now() - s > t) throw new Error('timeout'); await this.sleep(100); } },
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

  // ---- geometry helpers ----
  // Rendered and meant to be seen. Content folded inside a closed <details> still has boxes here, so it is
  // skipped (it is hidden by design). Transparent-and-click-through layers (a closed menu overlay) are skipped;
  // opacity alone is not used, because an entrance animation frozen in a hidden tab reads as opacity 0.
  visible(e) {
    if (!e.getClientRects().length) return false;
    const cs = getComputedStyle(e); if (cs.visibility === 'hidden' || cs.display === 'none') return false;
    const fold = e.closest('details:not([open])'); if (fold && !e.closest('summary')) return false;
    for (let a = e; a && a !== document.documentElement; a = a.parentElement) { const s = getComputedStyle(a); if (parseFloat(s.opacity) < 0.01 && s.pointerEvents === 'none') return false; }
    return true;
  },
  name(e) { const b = e.closest('.reading-position'); const all = [...document.querySelectorAll('.reading-position')]; return (e.id ? '#' + e.id : e.tagName.toLowerCase() + ([...e.classList][0] ? '.' + [...e.classList][0] : '')) + (b ? ':' + (all.indexOf(b) + 1) : ''); },
  // The box that clips e: e itself if it clips its own content (self=true), then every ancestor that clips,
  // intersected; the viewport clips left/right (not top/bottom: the page scrolls).
  // Inside a container that scrolls sideways (Max's card strip, the card chips), anything past the screen edge can be
  // scrolled to, so the viewport's left/right edge is not a cut there.
  inXScroller(e) { for (let a = e.parentElement; a && a !== document.documentElement; a = a.parentElement) { const ox = getComputedStyle(a).overflowX; if ((ox === 'auto' || ox === 'scroll') && a.scrollWidth > a.clientWidth + 1) return a; } return null; },
  clipBox(e, self) {
    const xs = this.inXScroller(e);
    let box = { l: xs ? -Infinity : 0, r: xs ? Infinity : document.documentElement.clientWidth, t: -Infinity, b: Infinity };
    // Once a scroll container lies between e and an outer box that hides overflow, that outer box no longer cuts e in
    // that direction: scrolling brings e inside the scroller, which sits inside the outer box (Max's full-screen
    // player around its sideways card strip and its scrolling body).
    let pastX = false, pastY = false;
    for (let a = self ? e : e.parentElement; a && a !== document.documentElement; a = a.parentElement) {
      const cs = getComputedStyle(a); const ox = cs.overflowX !== 'visible', oy = cs.overflowY !== 'visible';
      if (!ox && !oy) continue;
      // A scroll container clips, but its content can be scrolled to: count only overflow: hidden/clip here.
      const hx = ox && !pastX && /hidden|clip/.test(cs.overflowX), hy = oy && !pastY && /hidden|clip/.test(cs.overflowY);
      if (a !== e) { if (/auto|scroll/.test(cs.overflowX)) pastX = true; if (/auto|scroll/.test(cs.overflowY)) pastY = true; }
      if (!hx && !hy) continue;
      const r = a.getBoundingClientRect();
      if (hx) { box.l = Math.max(box.l, r.left); box.r = Math.min(box.r, r.right); }
      if (hy) { box.t = Math.max(box.t, r.top); box.b = Math.min(box.b, r.bottom); }
    }
    return box;
  },
  outside(r, box, tol = 1) { return r.left < box.l - tol || r.right > box.r + tol || r.top < box.t - tol || r.bottom > box.b + tol; },
  hasText(e) { return [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()); },
  textRect(e) { const rg = document.createRange(); rg.selectNodeContents(e); return rg.getBoundingClientRect(); },
  textCut(e) {
    const cs = getComputedStyle(e);
    if (cs.webkitLineClamp && cs.webkitLineClamp !== 'none' && e.scrollHeight > e.clientHeight + 1) return 'line-clamp';
    if (cs.textOverflow === 'ellipsis' && e.clientWidth && e.scrollWidth > e.clientWidth + 1) return 'ellipsis';
    const tr = this.textRect(e); if (!tr.width) return '';
    return this.outside(tr, this.clipBox(e, true)) ? 'cut' : '';
  },
  // Is the centre of e's (first) box e itself or inside it? Scrolls e to the middle of the screen first.
  async topmost(e, scroll = true) {
    if (scroll) { e.scrollIntoView({ block: 'center', inline: 'nearest' }); await this.sleep(60); }
    const r = e.getClientRects()[0]; if (!r) return { ok: true };
    const x = Math.min(Math.max(r.left + r.width / 2, 1), innerWidth - 1), y = Math.min(Math.max(r.top + r.height / 2, 1), innerHeight - 1);
    const hit = document.elementFromPoint(x, y);
    return { ok: !!hit && (e === hit || e.contains(hit)), by: hit ? this.name(hit) : 'nothing' };
  },

  async measure(opt = {}) {
    if (document.fonts?.ready) await document.fonts.ready;   // D6
    // Measure the layout at rest: finish one-off entrance animations (a hidden tab freezes them part-way, e.g. the
    // dock's fade-in at opacity 0). Endless ones (glows, the light) cannot finish and are left alone.
    for (const a of document.getAnimations()) { try { if (a.effect?.getComputedTiming().iterations !== Infinity) a.finish(); } catch (e) {} }
    await this.sleep(300);
    // Every list is complete (no cap), and defects is the sum of every list, so the count matches what is listed.
    const vw = document.documentElement.clientWidth;
    const board = document.querySelector('.spread-board'), page = document.querySelector('.draw-page') || document.body;
    const out = { meta: { sha: opt.sha || null, viewport: `${innerWidth}x${innerHeight}`, clientWidth: vw, spread: typeof state !== 'undefined' ? state.spreadId : null,
        clarifierState: opt.expectFull ? 'every clarifier drawn' : (opt.state || 'as dealt'), at: new Date().toISOString() },
      rootOverflowX: getComputedStyle(document.documentElement).overflowX + '/' + getComputedStyle(document.body).overflowX,
      scrollW: document.documentElement.scrollWidth,   // D3: summary only; the edge lists are the detector
      board: { edge: [], clipped: [], text: [], overlap: [], covered: [] }, page: { edge: [], text: [] }, fixed: { edge: [], covered: [], endCovers: [], dockLabels: [] },
      player: { checked: 0, edge: [], text: [], covered: [], opened: false }, full: [] };
    // Board
    const items = [...board.querySelectorAll('.reading-card, .position-clarifier, .position-clarity, .slot-label, .clarifier-layer-label, .reading-position strong, [data-clarify-position], .reading-position small')].filter(e => this.visible(e));
    for (const e of items) {
      const r = e.getBoundingClientRect();
      if (r.left < -0.5 || r.right > vw + 0.5) out.board.edge.push(this.name(e) + ` [${r.left | 0},${r.right | 0}]`);
      if (this.outside(r, this.clipBox(e, false))) out.board.clipped.push(this.name(e));
      if (this.hasText(e) || e.matches('.slot-label, strong, [data-clarify-position]')) { const t = this.textCut(e); if (t) out.board.text.push(this.name(e) + ' ' + t); }
    }
    const cards = [...board.querySelectorAll('.reading-card, .position-clarifier, .position-clarity')].filter(e => this.visible(e)).map(e => ({ e, r: e.getBoundingClientRect() }));
    // Labels include each card's name caption, which hangs below the card (position: absolute) and so is not
    // inside the card's own box; buttons include the per-card Clarify buttons.
    const labels = [...board.querySelectorAll('.slot-label, .clarifier-layer-label, [data-clarify-position], .clarify-choice, .reading-card-front strong, .position-clarifier strong, .position-clarity strong')].filter(e => this.visible(e)).map(e => ({ e, r: e.getBoundingClientRect() }));
    const hit = (a, b) => Math.min(a.right, b.right) - Math.max(a.left, b.left) > 0.5 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 0.5;
    const apart = (a, b) => !a.contains(b) && !b.contains(a);
    for (let i = 0; i < cards.length; i++) for (let j = i + 1; j < cards.length; j++) if (apart(cards[i].e, cards[j].e) && hit(cards[i].r, cards[j].r)) out.board.overlap.push(`card/card ${this.name(cards[i].e)} x ${this.name(cards[j].e)}`);
    for (const c of cards) for (const t of labels) if (apart(c.e, t.e) && hit(c.r, t.r)) out.board.overlap.push(`card/label ${this.name(c.e)} x ${this.name(t.e)}`);
    // A caption or label over another label or a button (the One-card name over "Draw Clarifier 1", 14 Nov).
    for (let i = 0; i < labels.length; i++) for (let j = i + 1; j < labels.length; j++) if (apart(labels[i].e, labels[j].e) && hit(labels[i].r, labels[j].r)) out.board.overlap.push(`label/label ${this.name(labels[i].e)} x ${this.name(labels[j].e)}`);
    // Page-wide (D2): visible text elements and controls in the draw page, outside the board as well
    const pageEls = [...page.querySelectorAll('*')].filter(e => !board.contains(e) && (this.hasText(e) || e.matches('button, a, img, input')) && this.visible(e) && !e.closest('.mc-dock, .mc-player'));
    for (const e of pageEls) {
      const r = e.getBoundingClientRect();
      if (r.width && (r.left < -0.5 || r.right > vw + 0.5)) out.page.edge.push(this.name(e) + ` [${r.left | 0},${r.right | 0}]`);
      if (this.hasText(e)) { const t = this.textCut(e); if (t) out.page.text.push(this.name(e) + ' ' + t); }
    }
    out.pageChecked = pageEls.length;
    // Fixed and sticky controls (D1): offsetParent is null for these, so they are found by computed position
    const fixedCtl = () => [...document.querySelectorAll('body *')].filter(e => { const p = getComputedStyle(e).position; return (p === 'fixed' || p === 'sticky') && this.visible(e); })
      .flatMap(f => [f, ...f.querySelectorAll('button, a')]).filter(e => e.matches('button, a') && this.visible(e));
    const fixedNow = [...new Set(fixedCtl())];
    for (const e of fixedNow) {
      const r = e.getBoundingClientRect();
      if (r.left < -0.5 || r.right > vw + 0.5 || r.top < -0.5 || r.bottom > innerHeight + 0.5) out.fixed.edge.push(this.name(e) + ` [${r.left | 0},${r.top | 0},${r.right | 0},${r.bottom | 0}]`);
      const t = await this.topmost(e, false); if (!t.ok) out.fixed.covered.push(this.name(e) + ' under ' + t.by);
      for (const k of [e, ...e.querySelectorAll('span')]) if (this.hasText(k)) { const c = this.textCut(k); if (c) out.fixed.edge.push(this.name(k) + ' text ' + c); }
    }
    out.fixedControls = fixedNow.map(e => this.name(e));
    // Board controls hidden under a fixed/sticky control when scrolled to the middle of the screen (D1)
    for (const b of [...board.querySelectorAll('[data-clarify-position], .reading-card')].filter(e => this.visible(e))) {
      const t = await this.topmost(b); if (!t.ok) out.board.covered.push(this.name(b) + ' under ' + t.by);
    }
    // Foot of the page: the reading's last controls must not sit under the dock
    window.scrollTo(0, document.documentElement.scrollHeight); await this.sleep(400);
    for (const e of [...document.querySelectorAll('.draw-actions button, .reading-next-step button')].filter(e => this.visible(e))) {
      const r = e.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) continue;
      const t = await this.topmost(e, false); if (!t.ok) out.fixed.endCovers.push(this.name(e) + ' under ' + t.by);
    }
    window.scrollTo(0, 0);
    // The dock names whichever card is in view, so a single snapshot shows one label. Try every position name
    // of this spread (and the other dock texts) in it, and check each is shown whole and the dock still fits.
    const v = document.getElementById('mcClarifyCard'), dockBtn = document.getElementById('mcClarify');
    out.dockTextsTried = 0;
    if (v && dockBtn && this.visible(dockBtn)) {
      const keep = v.textContent, texts = positionLabels().map((l, i) => `${String(i + 1).padStart(2, '0')} · ${l}`).concat(['07 · Clarifier 2', '07 · Clarity card', '07 · 2-card limit', '07 · clarified ✓', 'choose a card']);
      for (const t of texts) {
        v.textContent = t; out.dockTextsTried++; const c = this.textCut(v), r = dockBtn.getBoundingClientRect();
        if (c || r.top < 0 || r.bottom > innerHeight + 0.5 || r.right > vw + 0.5) out.fixed.dockLabels.push(`"${t}" ${c || 'dock off-screen'}`);
      }
      v.textContent = keep;
    }
    // Max's player (.mc-player): transcript lines, headings, strong text, the caption (#mcCaption), the card strip's
    // names and "Part n of N" (#mcPart). Opened for the scan and closed again; opening does not mark the reading heard.
    if (opt.player !== false && window.ResonatePresenter?.openPlayer && !document.querySelector('.mc-player')) {
      await window.ResonatePresenter.openPlayer(); await this.sleep(700);
      for (const a of document.getAnimations()) { try { if (a.effect?.getComputedTiming().iterations !== Infinity) a.finish(); } catch (e) {} }
      await this.sleep(200);
      const root = document.querySelector('.mc-player');
      if (root) {
        out.player.opened = true;
        // The transcript is a fold, closed by default: open every fold as a seeker would, so its lines are measured.
        const folds = [...root.querySelectorAll('details:not([open])')]; folds.forEach(d => d.open = true); out.player.foldsOpened = folds.length; await this.sleep(200);
        const sel = '.mc-transcript li, .mc-transcript p, h1, h2, h3, h4, strong, #mcCaption, #mcCaption p, #mcPart, .mc-card *, .mc-pick button *, #mcPickNote, button';
        const els = [...new Set([...root.querySelectorAll(sel)])].filter(e => this.visible(e) && (this.hasText(e) || e.matches('button')));
        out.player.checked = els.length;
        out.player.required = Object.fromEntries(['#mcCaption', '#mcPart'].map(s => [s, !!root.querySelector(s) && this.visible(root.querySelector(s))]).concat([['transcript lines', root.querySelectorAll('.mc-transcript li').length], ['card-strip names', [...root.querySelectorAll('.mc-card *')].filter(e => this.hasText(e)).length]]));
        for (const e of els) {
          const r = e.getBoundingClientRect();
          if (r.width && !this.inXScroller(e) && (r.left < -0.5 || r.right > vw + 0.5)) out.player.edge.push(this.name(e) + ` [${r.left | 0},${r.right | 0}] "${e.textContent.trim().slice(0, 30)}"`);
          if (this.hasText(e)) { const c = this.textCut(e); if (c) out.player.text.push(this.name(e) + ` ${c} "${e.textContent.trim().slice(0, 30)}"`); }
          // Buttons are brought into view first (the player's own scroll and the sideways strips), then must be topmost.
          if (e.matches('button')) { e.scrollIntoView({ block: 'center', inline: 'nearest' }); await this.sleep(60); const t = await this.topmost(e, false); if (!t.ok) out.player.covered.push(this.name(e) + ` under ${t.by} "${e.textContent.trim().slice(0, 30)}"`); }
        }
        if (!out.player.required['#mcCaption'] || !out.player.required['#mcPart']) out.player.edge.push('caption or Part n of N not on screen');
        window.ResonatePresenter.player?.close(); await this.sleep(300);
      }
    }
    // Completeness (D7). No sentinel: a missing check is reported as such, never as a position.
    out.positions = board.querySelectorAll('.reading-position').length;   // D10
    out.clarifiers = board.querySelectorAll('.position-clarifier').length;
    out.clarity = board.querySelectorAll('.position-clarity').length;
    if (opt.expectFull) {
      if (typeof nextDueClarifier !== 'function') out.full.push('cannot check: nextDueClarifier() is not available on this page');
      else { const due = nextDueClarifier(); if (due >= 0) out.full.push('clarifier still due at position ' + (due + 1)); }
      if (out.clarifiers < 2 * out.positions) out.full.push(`${out.clarifiers} clarifiers for ${out.positions} positions (expected ${2 * out.positions})`);
    }
    const lists = g => Object.values(out[g]).filter(Array.isArray);
    out.defectsBy = Object.fromEntries(['board', 'page', 'fixed', 'player'].map(g => [g, lists(g).reduce((m, a) => m + a.length, 0)]).concat([['full', out.full.length]]));
    out.defects = Object.values(out.defectsBy).reduce((a, b) => a + b, 0);
    return out;
  }
};
