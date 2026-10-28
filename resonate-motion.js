/* RESONATE motion. Based on Deep's v1.0.1 proposal; lifecycle corrected by Si Aye.
 * Decorations only: never changes card identities, order or reveal classes/timers.
 * mount signal destroys an instance permanently; reveal signal cancels one reveal.
 */
(function () {
  'use strict';
  let current = null;
  let serial = 0;
  const NS = 'http://www.w3.org/2000/svg';
  function node(tag, attrs, parent, svg) {
    const n = svg ? document.createElementNS(NS, tag) : document.createElement(tag);
    Object.entries(attrs || {}).forEach(([k, v]) => n.setAttribute(k, v));
    parent.appendChild(n);
    return n;
  }
  function mount(container, options = {}) {
    if (!container || !(container instanceof Element) || options.signal?.aborted) return null;
    if (current) current.destroy();
    const id = ++serial;
    const hadHostClass = container.classList.contains('rm-host');
    container.classList.add('rm-host');
    const root = node('div', {class: 'rm-root', 'aria-hidden': 'true'}, container);
    const media = typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : null;
    let destroyed = false, generation = 0, observer = null, frame = null;
    let revealDetach = null;
    const timers = new Set(), shimmers = new Map();
    const canAnimate = typeof requestAnimationFrame === 'function' && typeof MutationObserver === 'function';
    const reduced = () => !!media?.matches || !canAnimate;
    function later(fn, delay) {
      const timer = setTimeout(() => {timers.delete(timer); if (!destroyed) fn();}, delay);
      timers.add(timer);
      return timer;
    }
    function cancel() {
      generation++;
      if (observer) {observer.disconnect(); observer = null;}
      if (frame !== null) {cancelAnimationFrame(frame); frame = null;}
      timers.forEach(clearTimeout); timers.clear();
      shimmers.forEach((hadClass, card) => {if (!hadClass) card.classList.remove('rm-shimmer');});
      shimmers.clear();
      if (revealDetach) {revealDetach(); revealDetach = null;}
      root.replaceChildren();
    }
    function still() {
      if (!root.querySelector('.rm-still')) {
        const layer = node('div', {class: 'rm-still'}, root);
        node('span', {class: 'rm-still__thread'}, layer);
      }
    }
    function filament(token) {
      const svg = node('svg', {class: 'rm-filament', viewBox: '0 0 400 1200', preserveAspectRatio: 'none', focusable: 'false'}, root, true);
      const defs = node('defs', {}, svg, true);
      const gradient = node('linearGradient', {id: 'rm-gradient-' + id, x1: '0%', y1: '0%', x2: '0%', y2: '100%'}, defs, true);
      [['0%', '#f5e2b6'], ['55%', '#d9b979'], ['100%', '#a87f3c']].forEach(([offset, colour]) => node('stop', {offset, 'stop-color': colour}, gradient, true));
      const attrs = {d: 'M200 20 C260 160 120 300 200 440 C280 580 120 720 200 860 C250 960 150 1080 200 1180', fill: 'none', stroke: 'url(#rm-gradient-' + id + ')', pathLength: '1', 'stroke-dasharray': '1', 'stroke-dashoffset': '1', 'stroke-linecap': 'round'};
      const halo = node('path', {...attrs, class: 'rm-filament__halo', 'stroke-width': '12'}, svg, true);
      const core = node('path', {...attrs, class: 'rm-filament__core', 'stroke-width': '2'}, svg, true);
      let start = null;
      function tick(time) {
        frame = null;
        if (destroyed || generation !== token || reduced()) return;
        if (start === null) start = time;
        const progress = Math.min(1, (time - start) / 2400);
        const dash = String(Math.pow(1 - progress, 3));
        core.setAttribute('stroke-dashoffset', dash); halo.setAttribute('stroke-dashoffset', dash);
        if (progress < 1 && !destroyed && generation === token) frame = requestAnimationFrame(tick);
      }
      frame = requestAnimationFrame(tick);
    }
    function sparkle(card, token) {
      if (destroyed || generation !== token || reduced() || !container.contains(card)) return;
      const bounds = root.getBoundingClientRect(), rect = card.getBoundingClientRect();
      const scaleX = bounds.width / (root.clientWidth || bounds.width || 1);
      const scaleY = bounds.height / (root.clientHeight || bounds.height || 1);
      const burst = node('div', {class: 'rm-particles'}, root);
      for (let i = 0; i < 10; i++) {
        const spark = node('span', {class: 'rm-spark'}, burst);
        const angle = Math.random() * Math.PI * 2, radius = 20 + Math.random() * 45;
        spark.style.left = ((rect.left - bounds.left + rect.width / 2) / scaleX) + 'px';
        spark.style.top = ((rect.top - bounds.top + rect.height / 2) / scaleY) + 'px';
        spark.style.setProperty('--dx', Math.cos(angle) * radius + 'px');
        spark.style.setProperty('--dy', Math.sin(angle) * radius - 20 + 'px');
      }
      later(() => burst.remove(), 1600);
      if (!shimmers.has(card)) shimmers.set(card, card.classList.contains('rm-shimmer'));
      card.classList.add('rm-shimmer');
      later(() => {
        if (!shimmers.get(card)) card.classList.remove('rm-shimmer');
        shimmers.delete(card);
      }, 1400);
    }
    function reveal(cardNodes, opts = {}) {
      if (destroyed) return;
      cancel();
      if (opts.signal?.aborted) return;
      const cards = [...new Set(Array.from(cardNodes || []))].filter(c => c instanceof Element && container.contains(c) && c.classList.contains('reading-card'));
      const token = generation;
      if (opts.signal) {
        const onAbort = () => cancel();
        opts.signal.addEventListener('abort', onAbort, {once: true});
        revealDetach = () => opts.signal.removeEventListener('abort', onAbort);
      }
      if (reduced()) {still(); return;}
      const pending = cards.filter(c => !(c.classList.contains('revealed') && !c.classList.contains('is-facedown')));
      if (!pending.length) {still(); if (revealDetach) {revealDetach(); revealDetach = null;} return;}
      filament(token);
      const remaining = new Set(pending);
      observer = new MutationObserver(records => {
        if (generation !== token || destroyed) return;
        for (const {target: card} of records) {
          if (remaining.has(card) && card.classList.contains('revealed') && !card.classList.contains('is-facedown')) {
            remaining.delete(card); sparkle(card, token);
          }
        }
        if (!remaining.size && observer) {observer.disconnect(); observer = null;}
      });
      pending.forEach(card => observer.observe(card, {attributes: true, attributeFilter: ['class']}));
    }
    function onMediaChange() {if (!destroyed) {cancel(); still();}}
    if (media?.addEventListener) media.addEventListener('change', onMediaChange);
    else if (media?.addListener) media.addListener(onMediaChange);
    function onMountAbort() {destroy();}
    function destroy() {
      if (destroyed) return;
      destroyed = true; cancel();
      if (media?.removeEventListener) media.removeEventListener('change', onMediaChange);
      else if (media?.removeListener) media.removeListener(onMediaChange);
      options.signal?.removeEventListener('abort', onMountAbort);
      root.remove();
      if (!hadHostClass) container.classList.remove('rm-host');
      if (current === api) current = null;
    }
    const api = Object.freeze({reveal, cancel, destroy});
    options.signal?.addEventListener('abort', onMountAbort, {once: true});
    if (reduced()) still();
    current = api;
    return api;
  }
  window.ResonateMotion = Object.freeze({version: '1.0.2', mount});
})();
