(function () {
  'use strict';

  var host = document.getElementById('gtcDemo');
  var status = document.getElementById('status');
  var connector = new window.GoldenThreadConnector();
  var mounted = true;

  var state = {
    spreadId: 'demo-two-main',
    mainCards: [
      { positionIndex: 0, cardId: 0, orientation: 'upright', revealed: false },
      { positionIndex: 1, cardId: 1, orientation: 'reversed', revealed: false }
    ],
    clarifiers: {
      0: [
        { slot: 1, cardId: 2, revealed: false },
        { slot: 2, cardId: 3, revealed: false }
      ]
    }
  };

  function elementForMain(index) {
    return host.querySelector('[data-gtc-main-card="' + index + '"]');
  }

  function elementForClarifier(parentIndex, slot) {
    return host.querySelector('[data-gtc-parent="' + parentIndex + '"] [data-gtc-clarifier="' + slot + '"]');
  }

  function paint() {
    state.mainCards.forEach(function (main) {
      var el = elementForMain(main.positionIndex);
      if (!el) return;
      el.classList.toggle('is-facedown', !main.revealed);
      el.classList.toggle('revealed', main.revealed);
    });
    Object.keys(state.clarifiers).forEach(function (parentIndex) {
      state.clarifiers[parentIndex].forEach(function (clarifier) {
        var el = elementForClarifier(parentIndex, clarifier.slot);
        if (!el) return;
        el.classList.toggle('is-facedown', !clarifier.revealed);
        el.classList.toggle('revealed', clarifier.revealed);
      });
    });
  }

  function render() {
    paint();
    if (mounted) connector.update(state);
    var revealed = state.mainCards.filter(function (m) { return m.revealed; }).length;
    var clarifiers = Object.keys(state.clarifiers).reduce(function (n, key) {
      return n + state.clarifiers[key].filter(function (c) { return c.revealed; }).length;
    }, 0);
    status.textContent = 'Main revealed: ' + revealed + ' · Clarifiers revealed: ' + clarifiers + ' · Mounted: ' + mounted;
  }

  function setState(next) {
    if (next.mainCards) state.mainCards = next.mainCards;
    if (next.clarifiers) state.clarifiers = next.clarifiers;
    if (next.spreadId != null) state.spreadId = next.spreadId;
    render();
  }

  function revealMain(index) {
    var main = state.mainCards.find(function (m) { return m.positionIndex === index; });
    if (main) main.revealed = true;
    render();
  }

  function revealClarifier(slot) {
    var parent = state.mainCards.find(function (m) { return m.positionIndex === 0; });
    if (!parent || !parent.revealed) {
      status.textContent = 'Reveal the parent card before its clarifiers.';
      return;
    }
    var list = state.clarifiers[0] || [];
    // The controller never flips cards. Sequencing is application policy:
    // clarifier 2 is eligible only after clarifier 1 has been revealed.
    if (slot === 2) {
      var first = list.find(function (c) { return c.slot === 1; });
      if (!first || !first.revealed) {
        status.textContent = 'Clarifier 2 is eligible only after clarifier 1.';
        return;
      }
    }
    var clarifier = list.find(function (c) { return c.slot === slot; });
    if (clarifier) clarifier.revealed = true;
    render();
  }

  function reset() {
    state.mainCards.forEach(function (m) { m.revealed = false; });
    Object.keys(state.clarifiers).forEach(function (key) {
      state.clarifiers[key].forEach(function (c) { c.revealed = false; });
    });
    render();
  }

  function destroy() {
    connector.destroy();
    mounted = false;
    status.textContent = 'Destroyed. No overlay should remain.';
  }

  function mount() {
    connector.mount(host, state);
    mounted = true;
    render();
  }

  // Tinkerbell reveal: the thread flies to the card, loops round it, then the card turns.
  // The connector never flips cards; it calls back and the demo (the "app") turns it.
  function eligible(target) {
    if (target.type === 'main') {
      return state.mainCards.every(function (m) { return m.positionIndex >= target.positionIndex || m.revealed; }) &&
        !state.mainCards.find(function (m) { return m.positionIndex === target.positionIndex; }).revealed;
    }
    var parent = state.mainCards.find(function (m) { return m.positionIndex === target.parent; });
    var list = state.clarifiers[target.parent] || [];
    var me = list.find(function (c) { return c.slot === target.slot; });
    if (!parent || !parent.revealed || !me || me.revealed) return false;
    if (target.slot === 2) { var first = list.find(function (c) { return c.slot === 1; }); return !!(first && first.revealed); }
    return true;
  }
  var flying = Promise.resolve();
  function fly(target) {
    if (!mounted) return Promise.resolve();
    flying = flying.then(function () {
      if (!eligible(target)) return;
      return connector.reveal(target, function () {
        if (target.type === 'main') revealMain(target.positionIndex);
        else revealClarifier(target.slot);
      });
    });
    return flying;
  }
  host.addEventListener('click', function (event) {
    var clar = event.target.closest('[data-gtc-clarifier]');
    var main = event.target.closest('[data-gtc-main-card]');
    if (clar) {
      var unit = clar.closest('[data-gtc-parent]');
      fly({ type: 'clarifier', parent: Number(unit.getAttribute('data-gtc-parent')), slot: Number(clar.getAttribute('data-gtc-clarifier')) });
    } else if (main) {
      fly({ type: 'main', positionIndex: Number(main.getAttribute('data-gtc-main-card')) });
    }
  });
  function playReading() {
    reset();
    var steps = [
      { type: 'main', positionIndex: 0 },
      { type: 'clarifier', parent: 0, slot: 1 },
      { type: 'clarifier', parent: 0, slot: 2 },
      { type: 'main', positionIndex: 1 }
    ];
    return steps.reduce(function (p, t) {
      return p.then(function () { return new Promise(function (r) { setTimeout(r, 450); }); }).then(function () { return fly(t); });
    }, Promise.resolve());
  }
  document.getElementById('play').addEventListener('click', playReading);

  document.getElementById('reveal0').addEventListener('click', function () { revealMain(0); });
  document.getElementById('revealC1').addEventListener('click', function () { revealClarifier(1); });
  document.getElementById('revealC2').addEventListener('click', function () { revealClarifier(2); });
  document.getElementById('reveal1').addEventListener('click', function () { revealMain(1); });
  document.getElementById('reset').addEventListener('click', reset);
  document.getElementById('destroy').addEventListener('click', destroy);
  document.getElementById('mount').addEventListener('click', mount);
  document.getElementById('reduced').addEventListener('change', function (event) {
    connector.options.forceReducedMotion = event.target.checked;
    render();
  });

  window.__gtcDemo = {
    connector: connector,
    state: state,
    setState: setState,
    render: render,
    reset: reset,
    mount: mount,
    destroy: destroy,
    revealMain: revealMain,
    revealClarifier: revealClarifier,
    fly: fly,
    playReading: playReading
  };

  connector.mount(host, state);
  render();
})();
