/* RESONATE · kinetic reel reveal (Issue #48, Chas 31 Oct: "pokie-style" motion, not a gambling mechanic).
   Opt-in: loaded only by kinetic-uat.html. Changes nothing in app.js, the deck engine or the reading.

   How it stays honest:
   - The cards are already chosen and frozen (state.drawnCardIds) before any reel moves. The reel is
     decoration over each face-down card: it shows only RESONATE symbols, never other tarot cards, so
     nothing that spins past can be mistaken for what was drawn. It always stops on the card's own back,
     which then flips to reveal the card that was already there. No randomness, no redraws.
   - Reels stop left to right, one per position, then each card flips in place with a short gold glint.
   - Clarifiers are untouched: they are drawn after the reading has settled, by the app's own code.
   - Reduced motion: the app's own instant reveal runs; no reels. A Skip button settles everything at once.
   - Every timer goes in the app's drawTimers, so Back, Home or a card tap cancels it as before. */
(function () {
  'use strict';
  if (typeof renderDraw !== 'function') return;

  var SYMBOLS = ['☉', '☽', '✶', '♁', '△', '▽', '✦', '◇'];
  var baseRenderDraw = renderDraw;
  var runId = 0;

  function reduced() {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  function tile(i) {
    return '<div class="kr-tile" aria-hidden="true"><span>' + SYMBOLS[i % SYMBOLS.length] + '</span></div>';
  }
  // The reel's last tile is the card's own RESONATE back, so the stop is seamless.
  function backTile() {
    return '<div class="kr-tile kr-tile-back" aria-hidden="true"><div class="reading-card-back"><div class="back-mark">R</div><small>RESONATE</small></div></div>';
  }

  function settle(cardsEls, interpretation) {
    cardsEls.forEach(function (el) {
      el.classList.remove('is-facedown', 'kr-spinning');
      el.classList.add('revealed');
      var reel = el.querySelector('.kr-reel');
      if (reel) reel.remove();
    });
    state.drawSettled = true;
    state.drawPhase = 'settled';
    var status = document.getElementById('drawStatus');
    if (status) status.textContent = 'Your spread is ready. Follow the reading below, or tap a card to go deeper.';
    if (interpretation && document.body.contains(interpretation)) interpretation.classList.remove('waiting');
    var skip = document.getElementById('krSkip');
    if (skip) skip.remove();
  }

  function glint(el) {
    var g = document.createElement('span');
    g.className = 'kr-glint';
    g.setAttribute('aria-hidden', 'true');
    for (var s = 0; s < 6; s++) {
      var spark = document.createElement('i');
      spark.style.setProperty('--a', (s * 60 + 15) + 'deg');
      g.appendChild(spark);
    }
    el.appendChild(g);
    drawTimers.push(setTimeout(function () { if (g.parentNode) g.remove(); }, 1300));
  }

  renderDraw = function () {
    var pending = !state.drawSettled;
    baseRenderDraw.apply(this, arguments);
    if (!pending || reduced()) return;

    // Take over the reveal: cancel the app's timed flips (they are the only timers at this point).
    clearDrawTimers();
    var mine = ++runId;
    var cardsEls = Array.prototype.slice.call(document.querySelectorAll('.reading-card'));
    var interpretation = document.getElementById('readingInterpretation');
    if (!cardsEls.length) return;
    var frozen = state.drawnCardIds.join(',');

    var status = document.getElementById('drawStatus');
    if (status) {
      status.textContent = 'The reels are turning…';
      status.insertAdjacentHTML('afterend', '<button type="button" class="ghost-button kr-skip" id="krSkip">Skip animation</button>');
      document.getElementById('krSkip').onclick = function () {
        if (mine !== runId) return;
        clearDrawTimers();
        cardsEls.forEach(function (el) { el.querySelectorAll('.kr-strip').forEach(function (s) { s.getAnimations && s.getAnimations().forEach(function (a) { a.cancel(); }); }); });
        settle(cardsEls, interpretation);
      };
    }

    var n = cardsEls.length;
    // Spin time: first reel ~1.3 s; each later reel stops a beat after the one before. Long spreads
    // get a shorter beat so a Celtic Cross still settles in about 5 s.
    var beat = n <= 3 ? 420 : n <= 5 ? 360 : n <= 7 ? 320 : 290;
    cardsEls.forEach(function (el, i) {
      var tiles = 10 + i * 3;
      var html = '';
      for (var t = 0; t < tiles - 1; t++) html += tile(i + t);
      html += backTile();
      var reel = document.createElement('div');
      reel.className = 'kr-reel';
      reel.setAttribute('aria-hidden', 'true');
      reel.innerHTML = '<div class="kr-strip" style="--tiles:' + tiles + '">' + html + '</div>';
      el.classList.add('kr-spinning');
      el.appendChild(reel);
      var strip = reel.firstChild;
      var duration = 1300 + i * beat;
      var end = -((tiles - 1) / tiles) * 100;
      var anim = strip.animate([
        { transform: 'translateY(0%)', filter: 'blur(0px)' },
        { transform: 'translateY(' + (end * 0.12) + '%)', filter: 'blur(1.6px)', offset: 0.12 },
        { transform: 'translateY(' + (end * 0.86) + '%)', filter: 'blur(1.2px)', offset: 0.7 },
        { transform: 'translateY(' + (end * 1.004) + '%)', filter: 'blur(0px)', offset: 0.93 },
        { transform: 'translateY(' + end + '%)', filter: 'blur(0px)' }
      ], { duration: duration, easing: 'cubic-bezier(.3,.05,.25,1)', fill: 'forwards' });

      drawTimers.push(setTimeout(function () {
        if (mine !== runId || !document.body.contains(el)) return;
        anim.cancel();
        reel.remove();
        el.classList.remove('kr-spinning');
        el.classList.add('kr-landed');
        // A short pause on the back, then the app's own flip.
        drawTimers.push(setTimeout(function () {
          if (mine !== runId || !document.body.contains(el)) return;
          el.classList.remove('is-facedown');
          el.classList.add('revealed');
          glint(el);
          if (i === n - 1) {
            // Guard: the reel never changes what was drawn.
            if (state.drawnCardIds.join(',') !== frozen) console.error('kinetic reveal: drawn cards changed during animation');
            settle(cardsEls, interpretation);
          }
        }, 160));
      }, duration));
    });
  };

  window.__kineticReveal = { get runId() { return runId; } };
})();
