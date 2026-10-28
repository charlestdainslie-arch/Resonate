/* Opt-in adapter for the hand transition (hand-uat.html only; production index.html is unchanged).
   Plays once per reading table, after the app has rendered it from a spread choice, and stops the
   moment that table is replaced (Draw, Back, menu, Journal) or the page is hidden. */
(function () {
  'use strict';
  if (!window.ResonateHandTransition || typeof MutationObserver !== 'function') return;
  window.ResonateHandTransitionWire?.dispose();
  const app = document.getElementById('app');
  if (!app) return;
  let current = null, disposed = false;
  function stop() { current?.destroy(); current = null; }
  function onClick(event) {
    // Runs after the spread button's own handler has rendered the table (bubble phase on #app).
    if (disposed || !event.target.closest?.('.spread-picker [data-spread]')) return;
    requestAnimationFrame(() => {
      if (disposed || state.view !== 'stage') return;
      const board = app.querySelector('.reading-stage-page .stage-board');
      if (!board || current?.board === board) return;
      stop();
      current = window.ResonateHandTransition.mount(board);
    });
  }
  // Any re-render replaces the table node; an early Draw therefore ends the transition before #32's reveal mounts.
  const observer = new MutationObserver(() => { if (current && !app.contains(current.board)) stop(); });
  function dispose() {
    if (disposed) return;
    disposed = true; stop(); observer.disconnect();
    app.removeEventListener('click', onClick);
  }
  app.addEventListener('click', onClick);
  observer.observe(app, { childList: true, subtree: true });
  window.ResonateHandTransitionWire = Object.freeze({ dispose, current: () => current });
})();
