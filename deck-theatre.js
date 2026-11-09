/* RESONATE · Deck theatre — the full 78-card deck on the reading table, a cinematic shuffle and a deal
   into the spread (Chas / Si Aye, 6 Nov 2026).

   Flow on the reading table (renderReadingStage):
     rest     78 face-down RESONATE backs as one physical stack on the table; empty outlines where the
              spread will go.
     Shuffle  the data deck is shuffled FIRST (prepareDeck: Fisher–Yates over all 78 ids, unchanged);
              then the stack lifts, splits in two, riffles together, is cut and squared, and settles.
     Deal     the cards are chosen FIRST (selectDraw: the top of the shuffled data deck, unchanged);
              then the deck moves to a dock at the bottom of the screen and deals one face-down card
              to each position in order, the page following on a phone; the deck recedes; the chosen
              ids go through the normal startDraw() chain (journal + astrology wrappers) via
              state.pendingDraw, and the existing reading page reveals them (Golden Thread).

   Integrity: the animation never chooses, reorders or re-draws a card. Visual randomness (riffle
   clumps, cut point, sparks) uses its own generator, never Math.random, which the draw uses.
   Reversals, meanings, labels and the clarifier rule are untouched (they happen after the deal).
   Reduced motion: no flight or riffle; the deck shuffles and the cards are placed at once.
   Skip: one button finishes the current animation at once. Busy lock: no double shuffle or deal.
   Leaving the table mid-animation cancels it (no late deal). */
(function () {
  'use strict';
  if (typeof renderReadingStage !== 'function' || typeof selectDraw !== 'function' || typeof prepareDeck !== 'function') return;

  var N = 78;
  var vs = (Date.now() % 2147483646) + 1;                       // visual-only generator (Park–Miller)
  function vr() { vs = (vs * 48271) % 2147483647; return vs / 2147483647; }
  var token = 0, busy = false, skipping = false, anims = [], theatre = null, deck = null, cardsEls = [], order = [], restSync = 0;

  function reduced() { return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); }
  function size() { var w = window.innerWidth < 600 ? 58 : 76; return { w: w, h: Math.round(w * 1.5) }; }
  function wait(ms) { return new Promise(function (r) { setTimeout(r, skipping ? 0 : ms); }); }
  function alive(t) { return t === token && theatre && document.body.contains(theatre); }

  // Every promise returned here settles: when the animation finishes, when Skip finishes it, when it is
  // cancelled (leaving the table), or at the latest shortly after its planned end. Nothing waits forever.
  function play(el, frames, opts) {
    var o = Object.assign({ fill: 'forwards', easing: 'cubic-bezier(.3,.7,.2,1)' }, opts);
    var a = el.animate(frames, o);
    anims.push(a);
    if (skipping) a.finish();
    var limit = (o.duration || 0) + (o.delay || 0) + 1500;
    return new Promise(function (resolve) {
      var done = false, settle = function () { if (!done) { done = true; clearTimeout(timer); resolve(); } };
      var timer = setTimeout(function () { try { a.finish(); } catch (e) {} settle(); }, limit);
      a.finished.then(settle, settle);
      a.addEventListener('cancel', settle);
    });
  }
  function finishAll() { anims.forEach(function (a) { try { a.finish(); } catch (e) {} }); }
  function cancelAll() { anims.forEach(function (a) { try { a.cancel(); } catch (e) {} }); anims = []; }

  // ---- building the table ------------------------------------------------------------------------
  function mount() {
    unmount();
    var table = document.querySelector('.reading-table');
    var board = document.querySelector('.stage-board');
    if (!table || !board) return;
    var s = size();
    document.documentElement.style.setProperty('--dt-w', s.w + 'px');
    document.documentElement.style.setProperty('--dt-h', s.h + 'px');
    var spot = document.createElement('div');
    spot.className = 'dt-spot';
    spot.setAttribute('aria-hidden', 'true');
    var heading = table.querySelector('.stage-heading');
    // Shuffle and Draw sit either side of the deck at the top of the table (Chas, laptop UAT, 9 Nov): they
    // were below the spread, off the foot of a laptop window. The buttons keep their ids and handlers.
    var row = document.createElement('div');
    row.className = 'dt-row';
    heading.parentNode.insertBefore(row, heading.nextSibling);
    row.appendChild(spot);
    var sb = document.getElementById('shuffleCardsBtn'), db = document.getElementById('stageDrawBtn');
    if (sb && db) {
      var acts = sb.parentNode;
      row.insertBefore(sb, spot);
      row.appendChild(db);
      if (acts && acts.classList.contains('stage-actions') && !acts.children.length) acts.remove();
      table.classList.add('dt-has-row');
    }
    board.classList.add('dt-ready');
    board.querySelectorAll(':scope > .stage-position').forEach(function (p) { p.classList.add('dt-await'); });

    theatre = document.createElement('div');
    theatre.className = 'dt-theatre';
    theatre.innerHTML = '<div class="dt-deck" aria-hidden="true"></div>' +
      '<button type="button" class="dt-skip" hidden>Skip animation ›</button>' +
      '<p class="dt-live" aria-live="polite"></p>';
    document.body.appendChild(theatre);
    deck = theatre.querySelector('.dt-deck');
    cardsEls = [];
    for (var i = 0; i < N; i++) {
      var c = document.createElement('div');
      c.className = 'dt-card';
      c.innerHTML = '<span>R</span><small>RESONATE</small>';
      deck.appendChild(c);
      cardsEls.push(c);
    }
    order = cardsEls.slice();          // order[k] = the card element at stack height k (0 = bottom)
    stack(order);
    theatre.querySelector('.dt-skip').onclick = function () { skipping = true; finishAll(); };
    var shuffleBtn = document.getElementById('shuffleCardsBtn'), dealBtn = document.getElementById('stageDrawBtn');
    if (dealBtn) dealBtn.onclick = deal;           // label stays "Draw Cards": separate Shuffle and Draw
    if (shuffleBtn) shuffleBtn.onclick = shuffle;
    nextUp(state.shuffleCount > 0 ? 'draw' : 'shuffle');
    var status = document.getElementById('shuffleStatus');
    if (status) status.textContent = 'The full deck of 78 is on the table. Shuffle if it feels right, then draw when you are ready.';
    toRest(true);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
  }
  function unmount() {
    token++; busy = false; skipping = false;
    cancelAll();
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onScroll);
    if (theatre && theatre.parentNode) theatre.parentNode.removeChild(theatre);
    theatre = null; deck = null; cardsEls = []; order = [];
  }
  // A physical stack: each card a fraction of a pixel higher and left of the one below.
  function stackPos(k) { return { x: -k * 0.06, y: -k * 0.24 }; }
  function stack(list) {
    list.forEach(function (c, k) { var p = stackPos(k); c.style.zIndex = k; c.style.transform = 'translate(' + p.x + 'px,' + p.y + 'px)'; });
  }
  function spotPoint() {
    var spot = document.querySelector('.dt-spot');
    if (!spot) return null;
    var r = spot.getBoundingClientRect(), s = size();
    return { x: r.left + r.width / 2 - s.w / 2, y: r.top + (r.height - s.h) / 2 + 9 };
  }
  function dockPoint() {
    var s = size();
    return { x: window.innerWidth / 2 - s.w / 2, y: window.innerHeight - s.h - 22 };
  }
  function centrePoint() {
    var s = size();
    return { x: window.innerWidth / 2 - s.w / 2, y: window.innerHeight * 0.42 - s.h / 2 };
  }
  function placeDeck(p) { if (deck && p) deck.style.transform = 'translate(' + p.x + 'px,' + p.y + 'px)'; }
  function toRest(now) { if (!busy || now) placeDeck(spotPoint()); }
  function onScroll() {
    if (busy) return;
    cancelAnimationFrame(restSync);
    restSync = requestAnimationFrame(function () { toRest(); });
  }
  function moveDeck(to, ms, extra) {
    var from = deck.style.transform;
    var end = 'translate(' + to.x + 'px,' + to.y + 'px)' + (extra || '');
    var done = play(deck, [{ transform: from }, { transform: end }], { duration: ms, easing: 'cubic-bezier(.45,.05,.2,1)' });
    return done.then(function () { deck.style.transform = end; });
  }
  function setBusy(on, label) {
    busy = on;
    ['shuffleCardsBtn', 'stageDrawBtn'].forEach(function (id) { var b = document.getElementById(id); if (b) b.disabled = on; });
    var skip = theatre && theatre.querySelector('.dt-skip');
    if (skip) skip.hidden = !on || reduced();
    if (!on) skipping = false;
    if (label) say(label);
  }
  function say(text) {
    var status = document.getElementById('shuffleStatus');
    if (status) status.textContent = text;
  }

  // ---- shuffle -------------------------------------------------------------------------------------
  function sparks(at, n) {
    for (var i = 0; i < n; i++) {
      var sp = document.createElement('i');
      sp.className = 'dt-spark';
      theatre.appendChild(sp);
      var dx = (vr() - 0.5) * 120, dy = -30 - vr() * 70;
      (function (sp) {
        play(sp, [
          { transform: 'translate(' + at.x + 'px,' + at.y + 'px) scale(1)', opacity: 0.95 },
          { transform: 'translate(' + (at.x + dx) + 'px,' + (at.y + dy) + 'px) scale(.3)', opacity: 0 }
        ], { duration: 650 + vr() * 400, delay: vr() * 500, easing: 'ease-out', fill: 'both' }).then(function () { if (sp.parentNode) sp.parentNode.removeChild(sp); });
      })(sp);
    }
  }
  // One riffle of the visible stack (visual only): split, interleave, square up, cut, square up.
  async function riffle(t) {
    var s = size(), sx = Math.min(window.innerWidth * 0.26, s.w * 1.15);
    var half = N / 2 + Math.round((vr() - 0.5) * 6);
    var top = order.slice(half), bottom = order.slice(0, half);       // top half goes left, bottom half right
    // 1. split
    var moves = [];
    order.forEach(function (c, k) {
      var left = k >= half, j = left ? k - half : k, p = stackPos(j);
      moves.push(play(c, [{ transform: c.style.transform }, { transform: 'translate(' + ((left ? -sx : sx) + p.x) + 'px,' + (p.y - 6) + 'px) rotate(' + (left ? -6 : 6) + 'deg)' }],
        { duration: 420, delay: (left ? N - k : k) * 2 }));
    });
    await Promise.all(moves);
    if (!alive(t)) return;
    // 2. riffle: cards fall alternately from the bottoms of both halves, in small clumps
    var L = top.slice(), R = bottom.slice(), merged = [], fromLeft = vr() < 0.5;
    while (L.length || R.length) {
      var src = (fromLeft && L.length) || !R.length ? L : R, clump = 1 + Math.floor(vr() * 3);
      for (var q = 0; q < clump && src.length; q++) merged.push({ el: src.shift(), left: src === L });
      fromLeft = !fromLeft;
    }
    var centre = { x: deck.getBoundingClientRect().left + s.w / 2, y: deck.getBoundingClientRect().top + s.h / 2 };
    sparks(centre, 14);
    moves = [];
    merged.forEach(function (m, k) {
      m.el.style.zIndex = k;
      var p = stackPos(k), lean = m.left ? -1 : 1;
      moves.push(play(m.el, [
        { transform: getComputedStyle(m.el).transform },
        { transform: 'translate(' + (lean * sx * 0.45 + p.x) + 'px,' + (p.y - 14) + 'px) rotate(' + (lean * 3) + 'deg)', offset: 0.55 },
        { transform: 'translate(' + (lean * 7 + p.x) + 'px,' + p.y + 'px) rotate(' + (lean * 1.2) + 'deg)' }
      ], { duration: 230, delay: 60 + k * 10, easing: 'cubic-bezier(.4,.1,.3,1)' }));
    });
    order = merged.map(function (m) { return m.el; });
    await Promise.all(moves);
    if (!alive(t)) return;
    // 3. square up
    moves = order.map(function (c, k) { var p = stackPos(k); return play(c, [{ transform: getComputedStyle(c).transform }, { transform: 'translate(' + p.x + 'px,' + p.y + 'px)' }], { duration: 240 }); });
    await Promise.all(moves);
    if (!alive(t)) return;
    // 4. cut: the top part slides off; the bottom part is lifted on to it; square up
    var cut = 28 + Math.floor(vr() * 22), upper = order.slice(cut), lower = order.slice(0, cut);
    moves = upper.map(function (c, j) { var p = stackPos(j); return play(c, [{ transform: getComputedStyle(c).transform }, { transform: 'translate(' + (sx * 0.85 + p.x) + 'px,' + (p.y + 4) + 'px) rotate(2deg)' }], { duration: 300 }); });
    await Promise.all(moves);
    if (!alive(t)) return;
    lower.forEach(function (c, j) { c.style.zIndex = upper.length + j; });
    moves = lower.map(function (c, j) { var p = stackPos(upper.length + j); return play(c, [
      { transform: getComputedStyle(c).transform },
      { transform: 'translate(' + (sx * 0.4 + p.x) + 'px,' + (p.y - 26) + 'px) rotate(-2deg)', offset: 0.5 },
      { transform: 'translate(' + (sx * 0.85 + p.x) + 'px,' + p.y + 'px) rotate(2deg)' }], { duration: 380 }); });
    await Promise.all(moves);
    if (!alive(t)) return;
    order = upper.concat(lower);
    moves = order.map(function (c, k) { c.style.zIndex = k; var p = stackPos(k); return play(c, [{ transform: getComputedStyle(c).transform }, { transform: 'translate(' + p.x + 'px,' + p.y + 'px)' }], { duration: 300 }); });
    await Promise.all(moves);
    // Hand the final pose to plain styles and drop the held animations (78 cards × several phases).
    order.forEach(function (c, k) { var p = stackPos(k); c.style.transform = 'translate(' + p.x + 'px,' + p.y + 'px)'; });
    var deckPose = getComputedStyle(deck).transform;
    deck.style.transform = deckPose === 'none' ? deck.style.transform : deckPose;
    cancelAll();
  }

  // The button to press next is highlighted: Shuffle first, then, once the deck is shuffled, Draw Cards.
  // Drawing without shuffling stays allowed ("Shuffle if it feels right").
  function nextUp(which) {
    var sb = document.getElementById('shuffleCardsBtn'), db = document.getElementById('stageDrawBtn');
    if (sb) sb.classList.toggle('dt-next', which === 'shuffle');
    if (db) db.classList.toggle('dt-next', which === 'draw');
  }
  async function shuffle() {
    if (busy || !theatre) return;
    try { await shuffleSeq(); } catch (e) { console.error('Deck theatre shuffle', e); if (theatre) { theatre.classList.remove('is-active', 'is-shuffling'); setBusy(false, 'Deck shuffled. Draw when you are ready.'); toRest(true); } }
    if (theatre && state.shuffleCount > 0) nextUp('draw');
  }
  async function shuffleSeq() {
    var t = token;
    prepareDeck();                        // the real, unbiased shuffle of all 78 ids — before any visual
    var n = state.shuffleCount;
    if (reduced()) { say('Deck shuffled' + (n > 1 ? ' ' + n + ' times' : '') + '. Draw when you are ready.'); return; }
    setBusy(true, 'Shuffling the deck…');
    theatre.classList.add('is-active', 'is-shuffling');
    await moveDeck(centrePoint(), 380, ' scale(' + (window.innerWidth < 600 ? 1.15 : 1.3) + ')');
    if (!alive(t)) return;
    await riffle(t);
    if (!alive(t)) return;
    await moveDeck(spotPoint(), 380);
    if (!alive(t)) return;
    theatre.classList.remove('is-active', 'is-shuffling');
    setBusy(false, 'Deck shuffled' + (n > 1 ? ' ' + n + ' times' : '') + '. Draw when you are ready.');
  }

  // ---- deal --------------------------------------------------------------------------------------
  function settleScroll() {
    return new Promise(function (resolve) {
      var last = -1, still = 0, frames = 0;
      (function tick() {
        frames++;
        if (window.scrollY === last) still++; else still = 0;
        last = window.scrollY;
        if (still >= 3 || frames > 60 || skipping) resolve(); else requestAnimationFrame(tick);
      })();
    });
  }
  async function bringIntoView(el) {
    var r = el.getBoundingClientRect(), s = size(), top = 70, bottom = window.innerHeight - s.h - 46;
    if (r.top >= top && r.bottom <= bottom) return;
    var y = window.scrollY + r.top - Math.max(top, (bottom - r.height) * 0.45);
    window.scrollTo({ top: Math.max(0, y), behavior: skipping ? 'auto' : 'smooth' });
    await settleScroll();
  }
  async function deal() {
    if (busy || !theatre) return;
    var t = token, ids = null;
    try { await dealSeq(t, function (chosen) { ids = chosen; }); }
    catch (e) { console.error('Deck theatre deal', e); if (ids && t === token) { state.pendingDraw = ids; startDraw(); } else if (theatre) setBusy(false); }
  }
  async function dealSeq(t, chosen) {
    var ids = selectDraw();
    chosen(ids);               // the reading's cards, chosen before anything moves
    window.__resonateDealt = ids.slice(); // test hook: what was dealt, in order
    var slots = Array.prototype.slice.call(document.querySelectorAll('.stage-board > .stage-position'));
    var commit = function () { if (t !== token) return; state.pendingDraw = ids; startDraw(); };
    if (reduced()) { slots.forEach(function (p) { p.classList.remove('dt-await'); p.classList.add('dt-dealt'); }); setBusy(true, 'Your cards are dealt.'); commit(); return; }
    setBusy(true, state.shuffledDeck.length && state.shuffleCount ? 'Dealing your cards…' : 'Dealing your cards…');
    theatre.classList.add('is-active');
    await moveDeck(dockPoint(), 420);
    if (!alive(t)) return;
    var s = size();
    for (var i = 0; i < ids.length && i < slots.length; i++) {
      var slot = slots[i], target = slot.querySelector('.stage-card');
      await bringIntoView(target);
      if (!alive(t)) return;
      placeDeck(dockPoint());
      var src = order.pop();             // the top card of the visible stack (data order is ids[i])
      var a = src.getBoundingClientRect(), b = target.getBoundingClientRect();
      // The flying card IS the slot's own face-down back, laid over the slot and scaled down to the
      // deck: it lands pixel for pixel where the reading card will be, with no change of design.
      var fly = document.createElement('div');
      fly.className = 'stage-card dt-flyer';
      fly.dataset.dealIndex = String(i);
      fly.innerHTML = target.innerHTML;
      fly.style.left = b.left + 'px'; fly.style.top = b.top + 'px'; fly.style.width = b.width + 'px'; fly.style.height = b.height + 'px';
      src.style.visibility = 'hidden';
      theatre.appendChild(fly);
      var dx = a.left - b.left, dy = a.top - b.top, kx = a.width / b.width, ky = a.height / b.height;
      var lift = Math.min(90, Math.abs(dy) * 0.25 + 30);
      await play(fly, [
        { transform: 'translate(' + dx + 'px,' + dy + 'px) rotate(0deg) scale(' + kx + ',' + ky + ')' },
        { transform: 'translate(' + dx + 'px,' + (dy - 14) + 'px) rotate(-3deg) scale(' + kx * 1.06 + ',' + ky * 1.06 + ')', offset: 0.12 },
        { transform: 'translate(' + (dx * 0.5) + 'px,' + (dy * 0.5 - lift) + 'px) rotate(' + (dx > 0 ? -6 : 6) + 'deg) scale(' + ((1 + kx) / 2) + ',' + ((1 + ky) / 2) + ')', offset: 0.55 },
        { transform: 'translate(0,0) rotate(0deg) scale(1)' }
      ], { duration: 520, easing: 'cubic-bezier(.35,.05,.25,1)' });
      if (!alive(t)) return;
      slot.classList.remove('dt-await'); slot.classList.add('dt-dealt');
      if (fly.parentNode) fly.parentNode.removeChild(fly);
      if (!skipping) await wait(40);
    }
    say('Your cards are dealt.');
    await play(deck, [{ transform: deck.style.transform, opacity: 1 }, { transform: deck.style.transform + ' translateY(60px) scale(.9)', opacity: 0 }], { duration: 480, easing: 'ease-in' });
    if (!alive(t)) return;
    await wait(260);
    if (!alive(t)) return;
    commit();
  }

  // ---- wiring --------------------------------------------------------------------------------------
  var baseStage = renderReadingStage;
  renderReadingStage = function () { var out = baseStage.apply(this, arguments); mount(); return out; };
  var baseShell = shell;
  window.shell = shell = function () { if (theatre) unmount(); return baseShell.apply(this, arguments); };
  window.ResonateDeckTheatre = { get busy() { return busy; }, skip: function () { skipping = true; finishAll(); }, stack: function () { return order.length; } };
  if (state.view === 'stage') render();
})();
