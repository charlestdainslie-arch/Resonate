/* RESONATE · Max Chasroom + Golden Thread (opt-in page presenter-uat.html only).
   Chas, 30 Oct: "the golden thread needs to be in the animations". As Max talks about a card,
   the Golden Thread flies to it on Max's card strip and loops it (the same Tinkerbell reveal as
   the reading page), then carries on to the next card and clarifier he discusses.
   Listens to presenter.js's maxchasroom:open / :show / :close events; changes nothing else.
   The cards on the strip are already face up: the thread follows the narration, it never turns
   or hides a card. Reduced motion: strands and loops appear with no flight. */
(function () {
  'use strict';
  if (typeof window.GoldenThreadConnector !== 'function') return;

  var connector = null, strip = null, token = 0, discussed = {}, chapter = null;

  // Loops hug the card pictures (as on the reading page).
  function ringTarget(el) {
    if (!el || !el.querySelector) return el;
    if (el.hasAttribute('data-gtc-main-card')) return el.querySelector(':scope > img.mc-main') || el;
    if (el.hasAttribute('data-gtc-clarifier')) return el.querySelector('img') || el;
    return el;
  }

  function tag() {
    Array.prototype.slice.call(strip.querySelectorAll(':scope > .mc-card')).forEach(function (li, i) {
      li.setAttribute('data-gtc-parent', String(i));
      li.setAttribute('data-gtc-main-card', String(i));
      Array.prototype.slice.call(li.querySelectorAll('.mc-clar')).forEach(function (c) {
        var m = /^c\d+-(\d+)$/.exec(c.getAttribute('data-slot') || '');
        if (m) c.setAttribute('data-gtc-clarifier', m[1]);
      });
    });
  }

  function readState() {
    var clarifiers = {};
    var mainCards = Array.prototype.slice.call(strip.querySelectorAll(':scope > .mc-card')).map(function (li, i) {
      clarifiers[i] = Array.prototype.slice.call(li.querySelectorAll('[data-gtc-clarifier]')).map(function (c) {
        var n = Number(c.getAttribute('data-gtc-clarifier'));
        return { slot: n, cardId: null, revealed: discussed['c' + i + '-' + n] === true };
      });
      return { positionIndex: i, cardId: null, orientation: 'upright', revealed: discussed['p' + i] === true };
    });
    return { spreadId: 'max-strip', mainCards: mainCards, clarifiers: clarifiers };
  }

  function reset() {
    token++;
    discussed = {};
    // A clarifier chapter on its own: the cards it builds on are already in place.
    if (chapter && strip) {
      var layer = Number(chapter.slice(1));
      Array.prototype.slice.call(strip.querySelectorAll(':scope > .mc-card')).forEach(function (li, i) {
        discussed['p' + i] = true;
        for (var n = 1; n < layer; n++) discussed['c' + i + '-' + n] = true;
      });
    }
    if (connector) connector.destroy();
    connector = new window.GoldenThreadConnector({ ringTarget: ringTarget, edges: 'nearest' });
    connector._skipAnimate = true;
    connector.mount(strip, readState());
  }

  function targetFor(slot) {
    var m = /^p(\d+)$/.exec(slot);
    if (m) return { type: 'main', positionIndex: Number(m[1]) };
    m = /^c(\d+)-(\d+)$/.exec(slot);
    if (m) return { type: 'clarifier', parent: Number(m[1]), slot: Number(m[2]) };
    return null;
  }

  document.addEventListener('maxchasroom:open', function (e) {
    strip = e.detail.root.querySelector('.mc-cards');
    chapter = e.detail.chapter || null;
    if (!strip) return;
    tag();
    reset();
  });

  document.addEventListener('maxchasroom:show', function (e) {
    if (!strip || !connector || e.detail.root.querySelector('.mc-cards') !== strip) return;
    if (e.detail.index === 0) reset();   // Play again / Replay starts the thread over
    var mine = token;
    (e.detail.show || []).forEach(function (slot) {
      if (discussed[slot] || !targetFor(slot)) return;
      discussed[slot] = 'pending';
      connector.reveal(targetFor(slot), function () {
        if (mine !== token || !connector) return;
        discussed[slot] = true;
        connector.update(readState());
      });
    });
  });

  document.addEventListener('maxchasroom:close', function () {
    token++;
    if (connector) connector.destroy();
    connector = null; strip = null; discussed = {};
  });

  window.__maxThread = { get connector() { return connector; }, get discussed() { return discussed; } };
})();
