(function () {
  'use strict';

  var host = document.getElementById('gtcDemo');
  var status = document.getElementById('status');
  var connector = new window.GoldenThreadConnector({ duration: 520 });
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
    revealClarifier: revealClarifier
  };

  connector.mount(host, state);
  render();
})();
