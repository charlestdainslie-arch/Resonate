/* RESONATE · Golden Thread in the live reading (opt-in page reading-thread-uat.html only).
   Chas, 29 Oct: the thread comes down from the top, loops a twinkling light round each card
   and the card turns over, like Tinkerbell. Then it does the same for each clarifier.

   Loaded after app.js and reading-stage.js. It changes nothing in those files: it wraps
   shell() and renderDraw(), lets the app render as normal, then
   - tags the rendered spread with the connector's data-gtc-* hooks,
   - replaces the app's timed card reveal with a Golden Thread flight per card, in order,
   - for a newly drawn clarifier layer, covers each new clarifier and flies to it in turn,
     then plays the app's own clarifier turn.
   Re-renders of a reading already shown (e.g. returning from a card's meaning) show the
   thread still, with no flight. The connector never flips a card: this file does, in onTurn.
   Reduced motion: the connector turns each card at once, with no flight. */
(function () {
  'use strict';
  if (typeof window.GoldenThreadConnector !== 'function' || typeof renderDraw !== 'function' || typeof shell !== 'function') return;

  // Deep, Task 3 B: loops hug the card picture, not the whole button or clarifier box.
  // The picture's box is measured from layout offsets, which ignore CSS transforms, so the
  // loop is the right size even while the card is face down (scaled and turned away) or
  // mid-turn. Claude adjusted Deep's helper for this: the front picture is always in the
  // DOM, only turned away, so getBoundingClientRect() on it would be foreshortened.
  function layoutOffset(node) {
    var x = 0, y = 0;
    for (var n = node; n; n = n.offsetParent) { x += n.offsetLeft; y += n.offsetTop; }
    return { x: x, y: y };
  }
  function pictureOf(el) {
    if (!el || !el.hasAttribute) return null;
    if (el.hasAttribute('data-gtc-main-card')) return el.querySelector('.reading-card-front img');
    if (el.hasAttribute('data-gtc-clarifier')) return el.querySelector(':scope > img');
    return null;
  }
  function ringTarget(el) {
    var img = pictureOf(el);
    if (!img || !img.offsetWidth) return el;
    return {
      getBoundingClientRect: function () {
        var outer = el.getBoundingClientRect();
        var a = layoutOffset(el), b = layoutOffset(img);
        var left = outer.left + (b.x - a.x), top = outer.top + (b.y - a.y);
        return { left: left, top: top, right: left + img.offsetWidth, bottom: top + img.offsetHeight, width: img.offsetWidth, height: img.offsetHeight };
      }
    };
  }

  // edges: 'nearest' — strands join facing edges, so in the one-card spread, where the
  // clarifiers sit beside the card, no strand crosses a card picture.
  var connector = new window.GoldenThreadConnector({ ringTarget: ringTarget, edges: 'nearest' });
  var token = 0;                               // bumps on every page render; stale flights do nothing
  var seen = { drawnAt: null, layers: 0 };     // what this reading has already shown

  function layerCount() {
    var n = 0;
    if (state.clarifierReadingAt === state.drawnAt && state.firstLayerClarifiers && state.firstLayerClarifiers.length) n = 1;
    if (n && state.additionalClarifierReadingAt === state.drawnAt && (state.additionalClarifierLayers || []).some(function (l) { return l.number === 2; })) n = 2;
    return n;
  }

  function board() { return document.querySelector('.draw-page .spread-board'); }

  // Reading state for the connector, read from what is on screen.
  function readState(b) {
    var positions = Array.prototype.slice.call(b.querySelectorAll(':scope > .reading-position'));
    var clarifiers = {};
    var mainCards = positions.map(function (pos, i) {
      var card = pos.querySelector('.reading-card');
      clarifiers[i] = Array.prototype.slice.call(pos.querySelectorAll('[data-gtc-clarifier]')).map(function (el) {
        return { slot: Number(el.getAttribute('data-gtc-clarifier')), cardId: null, revealed: !el.classList.contains('is-facedown') };
      });
      return {
        positionIndex: i,
        cardId: card ? Number(card.getAttribute('data-reading-card')) : null,
        orientation: 'upright',
        revealed: !!(card && card.classList.contains('revealed'))
      };
    });
    return { spreadId: state.spreadId || null, mainCards: mainCards, clarifiers: clarifiers };
  }

  function tag(b) {
    Array.prototype.slice.call(b.querySelectorAll(':scope > .reading-position')).forEach(function (pos, i) {
      pos.setAttribute('data-gtc-parent', String(i));
      var card = pos.querySelector('.reading-card');
      if (card) card.setAttribute('data-gtc-main-card', String(i));
      Array.prototype.slice.call(pos.querySelectorAll('.position-clarifier, .position-clarifier-slot')).forEach(function (el, k) {
        el.setAttribute('data-gtc-clarifier', String(k + 1));
        // The waiting "Clarifier 2, not drawn yet" slot is face down until it is drawn.
        if (el.classList.contains('position-clarifier-slot')) el.classList.add('is-facedown');
      });
    });
  }

  function cover(el) {
    // Hold a newly drawn clarifier face down until the thread reaches it.
    el.classList.remove('clarifier-turn');
    Array.prototype.slice.call(el.querySelectorAll('.clarifier-back-cover')).forEach(function (c) { c.remove(); });
    el.classList.add('is-facedown', 'gtc-pending');
    var back = document.createElement('span');
    back.className = 'clarifier-back gtc-cover';
    back.setAttribute('aria-hidden', 'true');
    back.innerHTML = '<span class="back-mark">R</span><small>RESONATE</small>';
    el.appendChild(back);
  }

  function turnClarifier(el) {
    el.classList.remove('is-facedown', 'gtc-pending');
    var back = el.querySelector('.gtc-cover');
    if (back) back.remove();
    // The app's own approved clarifier turn (spread-parity.css), now for every layer.
    var appCover = document.createElement('span');
    appCover.className = 'clarifier-back clarifier-back-cover';
    appCover.setAttribute('aria-hidden', 'true');
    appCover.innerHTML = '<span class="back-mark">R</span><small>RESONATE</small>';
    el.appendChild(appCover);
    el.classList.add('clarifier-turn', 'revealed');
  }

  function settleDraw() {
    state.drawSettled = true;
    state.drawPhase = 'settled';
    var status = document.getElementById('drawStatus');
    if (status) status.textContent = 'Your spread is ready. Follow the reading below, or tap a card to go deeper.';
    var interpretation = document.getElementById('readingInterpretation');
    if (interpretation) interpretation.classList.remove('waiting');
  }

  var baseShell = shell;
  window.shell = function () {
    token++;
    connector.destroy();
    return baseShell.apply(this, arguments);
  };

  var baseRenderDraw = renderDraw;
  window.renderDraw = function () {
    var dealing = !state.drawSettled;
    var result = baseRenderDraw.apply(this, arguments);
    var mine = token;
    var b = board();
    if (!b) return result;
    tag(b);

    var layers = layerCount();
    var sameReading = seen.drawnAt === state.drawnAt;
    var newLayer = sameReading && layers > seen.layers ? layers : 0;
    seen = { drawnAt: state.drawnAt, layers: layers };

    var steps = [];
    if (dealing) {
      // The thread turns the cards instead of the app's timer.
      if (typeof clearDrawTimers === 'function') clearDrawTimers();
      var mains = Array.prototype.slice.call(b.querySelectorAll('[data-gtc-main-card]'));
      mains.forEach(function (el, i) {
        steps.push({
          target: { type: 'main', positionIndex: i },
          turn: function () {
            el.classList.remove('is-facedown');
            el.classList.add('revealed');
            if (i === mains.length - 1) settleDraw();
          }
        });
      });
    }
    if (newLayer) {
      Array.prototype.slice.call(b.querySelectorAll(':scope > .reading-position')).forEach(function (pos, i) {
        var el = pos.querySelector('[data-gtc-clarifier="' + newLayer + '"].position-clarifier');
        if (!el) return;
        cover(el);
        steps.push({ target: { type: 'clarifier', parent: i, slot: newLayer }, turn: function () { turnClarifier(el); } });
      });
    }

    // A shown reading (or nothing new) mounts still; a flight draws its own strands.
    connector._skipAnimate = true;
    connector.mount(b, readState(b));

    steps.reduce(function (chain, step) {
      return chain.then(function () {
        if (mine !== token) return;
        return connector.reveal(step.target, function () {
          if (mine !== token) return;
          step.turn();
          connector.update(readState(b));
        });
      });
    }, Promise.resolve());

    return result;
  };

  // Test and recording hook.
  window.__gtLive = { connector: connector, readState: function () { var b = board(); return b ? readState(b) : null; } };
})();
