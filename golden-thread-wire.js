/* Opt-in wiring for the Golden Thread weave (golden-thread-uat.html only).
 * Arms only for a fresh draw: the app adds .waiting to #readingInterpretation while cards turn, and
 * settled re-renders (clarifiers, card-detail return, Journal reopen) never add it, so they never replay.
 * Plays once the reading has settled and the written Golden Thread is at least 30% on screen.
 */
(function () {
  'use strict';
  if (!window.ResonateGoldenThread || typeof MutationObserver !== 'function') return;
  window.ResonateGoldenThreadWire?.dispose();
  const app = document.getElementById('app');
  if (!app) return;
  let section = null, armed = false, visible = false, io = null, classObs = null, disposed = false;

  function disarm() {
    io?.disconnect(); io = null;
    classObs?.disconnect(); classObs = null;
    armed = false; visible = false;
  }
  function settled() {
    const interp = document.getElementById('readingInterpretation');
    return !!interp && !interp.classList.contains('waiting');
  }
  function maybePlay() {
    if (!armed || !visible || !settled() || !section?.isConnected) return;
    disarm();
    window.ResonateGoldenThread.mount(section);
  }
  function sync() {
    if (disposed) return;
    const next = app.querySelector('.draw-stage .reading-golden-thread');
    if (next === section) return;
    disarm();
    window.ResonateGoldenThread.current()?.destroy();
    section = next;
    const interp = document.getElementById('readingInterpretation');
    if (!section || !interp?.classList.contains('waiting')) return; // settled re-render: no replay
    armed = true;
    classObs = new MutationObserver(maybePlay);
    classObs.observe(interp, {attributes: true, attributeFilter: ['class']});
    if (typeof IntersectionObserver === 'function') {
      io = new IntersectionObserver(entries => {
        visible = entries.some(e => e.isIntersecting && (e.intersectionRatio >= 0.3 || e.intersectionRect.height >= innerHeight * 0.4));
        maybePlay();
      }, {threshold: [0, 0.15, 0.3, 0.5]});
      io.observe(section);
    }
  }
  const observer = new MutationObserver(sync);
  function pagehide() { observer.disconnect(); disarm(); window.ResonateGoldenThread.current()?.destroy(); section = null; }
  function pageshow() { if (!disposed) { observer.observe(app, {childList: true, subtree: true}); sync(); } }
  function dispose() {
    if (disposed) return;
    disposed = true; observer.disconnect(); disarm();
    window.ResonateGoldenThread.current()?.destroy();
    window.removeEventListener('pagehide', pagehide); window.removeEventListener('pageshow', pageshow);
  }
  observer.observe(app, {childList: true, subtree: true});
  window.addEventListener('pagehide', pagehide); window.addEventListener('pageshow', pageshow);
  window.ResonateGoldenThreadWire = Object.freeze({sync, dispose, armed: () => armed});
  sync();
})();
