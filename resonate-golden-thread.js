/* RESONATE Golden Thread weave. Preview only (golden-thread-uat.html); production index.html unchanged.
 * When a freshly drawn reading has settled and the written Golden Thread scrolls into view, a gold
 * filament (the same thread that ran beside the cards) draws down the section's left margin, lighting
 * each card's paragraph as it passes and blooming at the overall invitation. Then it fades and every
 * node and class it added is removed.
 * Decoration only: never changes text, its opacity, layout or app state, and never takes input
 * (pointer-events none, aria-hidden). Reduced motion creates nothing. Escape, navigation, pagehide,
 * a new draw or the section leaving the DOM end it at once.
 */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const HOLD = 600, FADE = 700;
  let current = null;
  const ease = t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const clamp01 = t => Math.min(1, Math.max(0, t));
  function el(tag, attrs, parent, svg) {
    const n = svg ? document.createElementNS(NS, tag) : document.createElement(tag);
    Object.entries(attrs || {}).forEach(([k, v]) => n.setAttribute(k, v));
    if (parent) parent.appendChild(n);
    return n;
  }

  // section: the .reading-golden-thread block. Returns null when there is nothing to play.
  function mount(section, options = {}) {
    const media = typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : null;
    const reduced = () => !!media?.matches;
    if (!(section instanceof Element) || !section.isConnected || options.signal?.aborted || reduced()) return null;
    if (typeof requestAnimationFrame !== 'function') return null;
    if (current) current.destroy();

    const hadHost = section.classList.contains('gt-host');
    section.classList.add('gt-host');
    const layer = el('div', {class: 'gt-layer', 'aria-hidden': 'true'}, null);
    section.prepend(layer);
    const svg = el('svg', {class: 'gt-svg', focusable: 'false'}, layer, true);
    const defs = el('defs', {}, svg, true);
    const gid = 'gt-gradient-' + Math.random().toString(36).slice(2);
    const gradient = el('linearGradient', {id: gid, gradientUnits: 'userSpaceOnUse', x1: '0', y1: '0', x2: '0', y2: '1'}, defs, true);
    [['0', '#f5e2b6'], ['0.55', '#d9b979'], ['1', '#a87f3c']].forEach(([offset, c]) => el('stop', {offset, 'stop-color': c}, gradient, true));
    const line = {fill: 'none', stroke: `url(#${gid})`, pathLength: '1', 'stroke-dasharray': '1', 'stroke-dashoffset': '1', 'stroke-linecap': 'round'};
    const halo = el('path', {...line, class: 'gt-halo', 'stroke-width': '8'}, svg, true);
    const core = el('path', {...line, class: 'gt-core', 'stroke-width': '1.6'}, svg, true);
    const bloom = el('circle', {class: 'gt-bloom', r: '0', cx: '0', cy: '0'}, svg, true);
    const lit = new Set();
    const knots = new Map();

    let destroyed = false, frame = null, start = null, drawMs = 2400, doneAt = null;
    const controller = typeof AbortController === 'function' ? new AbortController() : null;
    const on = (t, type, fn, o) => t.addEventListener(type, fn, {...(o || {}), signal: controller?.signal});

    // Stops: the eyebrow, each card's paragraph, then the overall invitation, measured inside the section.
    function stops() {
      const box = section.getBoundingClientRect();
      const pick = n => { const r = n.getBoundingClientRect(); return {node: n, y: r.top - box.top + Math.min(28, r.height / 2)}; };
      const list = [...section.querySelectorAll('.golden-card-reading, .golden-thread-summary')].map(pick);
      return {box, list};
    }
    function geometry() {
      const {box, list} = stops();
      const pad = parseFloat(getComputedStyle(section).paddingLeft) || 20;
      const x = Math.max(5, pad * 0.45);
      const top = Math.min(28, (list[0]?.y ?? 40) * 0.4);
      const end = list.length ? list[list.length - 1].y : box.height * 0.8;
      const pts = [[x, top], ...list.map((s, i) => [x + (i % 2 ? -2.5 : 2.5), s.y])];
      let d = `M${pts[0][0]} ${pts[0][1].toFixed(1)}`;
      for (let i = 1; i < pts.length; i++) {
        const [px, py] = pts[i - 1], [cx, cy] = pts[i], mid = (py + cy) / 2, sway = (i % 2 ? 5 : -5);
        d += ` C${px + sway} ${mid.toFixed(1)} ${cx + sway} ${mid.toFixed(1)} ${cx} ${cy.toFixed(1)}`;
      }
      return {w: box.width, h: box.height, x, top, end, list, d};
    }
    function tick(time) {
      frame = null;
      if (destroyed) return;
      if (reduced() || !section.isConnected) { destroy(); return; }
      if (start === null) {
        start = time;
        drawMs = Math.min(3400, Math.max(1800, section.getBoundingClientRect().height * 0.9));
      }
      const t = time - start;
      const g = geometry();
      svg.setAttribute('viewBox', `0 0 ${g.w} ${g.h}`);
      gradient.setAttribute('y1', g.top); gradient.setAttribute('y2', g.end);
      core.setAttribute('d', g.d); halo.setAttribute('d', g.d);
      const p = ease(clamp01(t / drawMs));
      core.setAttribute('stroke-dashoffset', String(1 - p)); halo.setAttribute('stroke-dashoffset', String(1 - p));
      // The thread's tip, as a y position: light each paragraph as the tip reaches it.
      const tipY = g.top + (g.end - g.top) * p;
      g.list.forEach((s, i) => {
        let k = knots.get(s.node);
        if (!k) { k = el('circle', {class: 'gt-knot', r: '0'}, svg, true); knots.set(s.node, k); }
        k.setAttribute('cx', g.x + (i % 2 ? -2.5 : 2.5)); k.setAttribute('cy', s.y);
        const reached = tipY >= s.y - 1;
        k.setAttribute('r', reached ? '3.2' : '0');
        if (reached && !lit.has(s.node)) { lit.add(s.node); s.node.classList.add('gt-lit'); }
      });
      if (p >= 1 && doneAt === null) doneAt = time;
      if (doneAt !== null) {
        const last = g.list[g.list.length - 1];
        const glow = clamp01((time - doneAt) / 300);
        if (last) { bloom.setAttribute('cx', g.x); bloom.setAttribute('cy', last.y); bloom.setAttribute('r', String(26 * glow)); }
        const fade = clamp01((time - doneAt - HOLD) / FADE);
        layer.style.opacity = String(1 - fade);
        if (fade > 0 && lit.size) { lit.forEach(n => n.classList.remove('gt-lit')); lit.clear(); }
        layer.dataset.phase = fade > 0 ? 'fade' : 'hold';
        if (fade >= 1) { destroy(); return; }
      } else layer.dataset.phase = 'weave';
      frame = requestAnimationFrame(tick);
    }
    function destroy() {
      if (destroyed) return;
      destroyed = true;
      if (frame !== null) { cancelAnimationFrame(frame); frame = null; }
      controller?.abort();
      if (media?.removeEventListener) media.removeEventListener('change', onMedia);
      else if (media?.removeListener) media.removeListener(onMedia);
      lit.forEach(n => n.classList.remove('gt-lit')); lit.clear();
      layer.remove();
      if (!hadHost) section.classList.remove('gt-host');
      if (current === api) current = null;
    }
    function onMedia() { if (reduced()) destroy(); }
    on(document, 'keydown', e => { if (e.key === 'Escape') destroy(); });
    on(window, 'popstate', destroy);
    on(window, 'pagehide', destroy);
    if (options.signal) on(options.signal, 'abort', destroy, {once: true});
    if (media?.addEventListener) media.addEventListener('change', onMedia);
    else if (media?.addListener) media.addListener(onMedia);
    const api = Object.freeze({destroy, section, phase: () => destroyed ? 'done' : (layer.dataset.phase || 'weave')});
    current = api;
    frame = requestAnimationFrame(tick);
    return api;
  }
  window.ResonateGoldenThread = Object.freeze({version: '0.1.0', mount, current: () => current});
})();
