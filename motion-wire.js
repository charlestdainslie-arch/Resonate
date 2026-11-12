/* Opt-in integration: loading this adapter starts decoration; production index is unchanged. */
(function () {
  'use strict';
  if (!window.ResonateMotion || typeof MutationObserver !== 'function') return;
  window.ResonateMotionWire?.dispose();
  const app = document.getElementById('app');
  if (!app) return;
  let current = null, board = null, disposed = false, suspended = false;
  function teardown() {current?.destroy(); current = null; board = null;}
  function sync() {
    if (disposed || suspended) return;
    const next = app.querySelector('.draw-stage .spread-board');
    if (next === board) return;
    teardown();
    if (next) {board = next; current = window.ResonateMotion.mount(board); current?.reveal(board.querySelectorAll('.reading-card'));}
  }
  const observer = new MutationObserver(sync);
  function pagehide() {suspended = true; observer.disconnect(); teardown();}
  function pageshow() {if (!disposed) {suspended = false; observer.observe(app, {childList:true,subtree:true}); sync();}}
  function dispose() {
    if (disposed) return;
    disposed = true; observer.disconnect(); teardown();
    window.removeEventListener('pagehide', pagehide); window.removeEventListener('pageshow', pageshow);
  }
  observer.observe(app, {childList:true,subtree:true});
  window.addEventListener('pagehide', pagehide); window.addEventListener('pageshow', pageshow);
  window.ResonateMotionWire = Object.freeze({sync, dispose});
  sync();
})();
