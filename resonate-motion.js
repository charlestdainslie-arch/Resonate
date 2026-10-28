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
    let revealDetach = null, weave = null;
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
      if (weave) {weave.remove(); weave = null;}
      root.removeAttribute?.('data-filament');
    }
    function still() {
      if (!root.querySelector('.rm-still')) {
        const layer = node('div', {class: 'rm-still'}, root);
        node('span', {class: 'rm-still__thread'}, layer);
      }
    }
    // The filament threads beside the drawn cards' measured positions (in pixels, so its shape never
    // stretches with board height), then fades and is removed once it has finished drawing and every
    // card has turned over (F1). A hard cap guarantees removal even if a card never reports revealed.
    const DRAW = 2000, HOLD = 400, FADE = 600, CAP = 9000;
    function threadPath(cards) {
      const bounds = root.getBoundingClientRect();
      const w = root.clientWidth || bounds.width || 1, h = root.clientHeight || bounds.height || 1;
      const sx = bounds.width / w || 1, sy = bounds.height / h || 1;
      // Waypoints sit just outside each card's left edge, swaying in and out, so the thread runs
      // beside the art and captions instead of across them.
      const pts = cards.filter(c => c.isConnected !== false).map((c, i) => {
        const r = c.getBoundingClientRect();
        const x = (r.left - bounds.left) / sx - (i % 2 ? 22 : 10);
        return [Math.max(4, x), (r.top - bounds.top + r.height / 2) / sy];
      }).sort((a, b) => Math.abs(a[1] - b[1]) > 8 ? a[1] - b[1] : a[0] - b[0]);
      if (!pts.length) return {w, h, d: ''};
      const first = pts[0], last = pts[pts.length - 1];
      pts.unshift([first[0], Math.max(4, first[1] - Math.min(140, h * 0.25))]);
      pts.push([last[0], Math.min(h - 4, last[1] + Math.min(90, h * 0.15))]);
      let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
      for (let i = 0; i < pts.length - 1; i++) {
        const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
        const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
        const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
        d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
      }
      return {w, h, d};
    }
    function filament(token, cards, remaining) {
      // Own layer behind the cards (see .rm-weave): on wide rows the thread passes behind the art
      // and shows in the gaps; sparks stay on .rm-root above.
      weave = node('div', {class: 'rm-weave', 'aria-hidden': 'true'}, container);
      const svg = node('svg', {class: 'rm-filament', focusable: 'false'}, weave, true);
      const defs = node('defs', {}, svg, true);
      // userSpaceOnUse: a straight vertical thread (one-column phone layouts) has a zero-width bounding box,
      // and an objectBoundingBox gradient would paint nothing on it.
      const gradient = node('linearGradient', {id: 'rm-gradient-' + id, gradientUnits: 'userSpaceOnUse', x1: '0', y1: '0', x2: '0', y2: '1'}, defs, true);
      [['0', '#f5e2b6'], ['0.55', '#d9b979'], ['1', '#a87f3c']].forEach(([offset, colour]) => node('stop', {offset, 'stop-color': colour}, gradient, true));
      const attrs = {d: '', fill: 'none', stroke: 'url(#rm-gradient-' + id + ')', pathLength: '1', 'stroke-dasharray': '1', 'stroke-dashoffset': '1', 'stroke-linecap': 'round'};
      const halo = node('path', {...attrs, class: 'rm-filament__halo', 'stroke-width': '10'}, svg, true);
      const core = node('path', {...attrs, class: 'rm-filament__core', 'stroke-width': '2'}, svg, true);
      root.setAttribute('data-filament', 'drawing');
      let start = null, settledAt = null;
      function done() {
        if (weave) {weave.remove(); weave = null;}
        root.setAttribute('data-filament', 'cleared');
      }
      function tick(time) {
        frame = null;
        if (destroyed || generation !== token) return;
        if (reduced()) {cancel(); still(); return;} // F2: act on the switch even if the change event never fires
        if (start === null) start = time;
        const elapsed = time - start;
        const path = threadPath(cards);
        svg.setAttribute('viewBox', `0 0 ${path.w} ${path.h}`);
        gradient.setAttribute('y2', String(path.h));
        core.setAttribute('d', path.d); halo.setAttribute('d', path.d);
        const progress = Math.min(1, elapsed / DRAW);
        const dash = String(Math.pow(1 - progress, 3));
        core.setAttribute('stroke-dashoffset', dash); halo.setAttribute('stroke-dashoffset', dash);
        if (settledAt === null && progress >= 1 && (!remaining.size || elapsed >= CAP)) settledAt = time;
        if (settledAt !== null) {
          const fade = Math.min(1, Math.max(0, (time - settledAt - HOLD) / FADE));
          svg.style.opacity = String(1 - fade);
          root.setAttribute('data-filament', fade > 0 ? 'fading' : 'holding');
          if (fade >= 1) {done(); return;}
        }
        frame = requestAnimationFrame(tick);
      }
      frame = requestAnimationFrame(tick);
    }
    function sparkle(card, token) {
      if (destroyed || generation !== token || !container.contains(card)) return;
      if (reduced()) {cancel(); still(); return;}
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
      const remaining = new Set(pending);
      filament(token, pending, remaining);
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
  window.ResonateMotion = Object.freeze({version: '1.0.3', mount});
})();
