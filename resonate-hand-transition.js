/* RESONATE hand → golden filament → reading table. Prototype, opt-in only (hand-uat.html).
 * Plays once over a freshly rendered reading table: the existing static hand rises, a gold filament
 * runs from its fingertip to the first face-down card, then everything fades and is removed.
 * Decoration only: never reads or changes card data, state, spread layout or app classes, and
 * never blocks input (the overlay ignores pointer events; only the Skip button takes them).
 * The realistic opening hand is NOT IMPLEMENTED; this uses assets/mystic-hand-whisper.png.
 */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const HAND_SRC = 'assets/mystic-hand-whisper.png';
  const FINGERTIP = [0.82, 0.135]; // index fingertip in mystic-hand-whisper.png (1024×1536), as a fraction of the image box
  const DELAY = 200, RISE = 900, THREAD = 900, FADE = 400;
  const TOTAL = DELAY + RISE + THREAD + FADE;
  let current = null;

  const ease = t => 1 - Math.pow(1 - t, 3);
  const clamp01 = t => Math.min(1, Math.max(0, t));
  function el(tag, attrs, parent, svg) {
    const n = svg ? document.createElementNS(NS, tag) : document.createElement(tag);
    Object.entries(attrs || {}).forEach(([k, v]) => n.setAttribute(k, v));
    if (parent) parent.appendChild(n);
    return n;
  }
  function centre(node) {
    const r = node.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }

  // board: the reading table's .stage-board. Returns null when there is nothing to play
  // (reduced motion, no target card, or an aborted signal).
  function mount(board, options = {}) {
    const media = typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : null;
    const reduced = () => !!media?.matches;
    if (!(board instanceof Element) || !document.contains(board) || options.signal?.aborted || reduced()) return null;
    if (typeof requestAnimationFrame !== 'function') return null;
    const target = () => board.querySelector('.stage-card[data-stage-card]');
    if (!target()) return null;
    if (current) current.destroy();

    const body = document.body;
    const hadActive = body.classList.contains('rh-active');
    body.classList.add('rh-active');

    const root = el('div', { class: 'rh-root', 'aria-hidden': 'true' }, body);
    const svg = el('svg', { class: 'rh-filament', focusable: 'false' }, root, true);
    const defs = el('defs', {}, svg, true);
    const gid = 'rh-gradient-' + Math.random().toString(36).slice(2);
    const gradient = el('linearGradient', { id: gid, gradientUnits: 'userSpaceOnUse' }, defs, true);
    [['0', '#f5e2b6'], ['0.55', '#d9b979'], ['1', '#a87f3c']].forEach(([offset, colour]) => el('stop', { offset, 'stop-color': colour }, gradient, true));
    const line = { fill: 'none', stroke: `url(#${gid})`, pathLength: '1', 'stroke-dasharray': '1', 'stroke-dashoffset': '1', 'stroke-linecap': 'round' };
    const halo = el('path', { ...line, class: 'rh-filament__halo', 'stroke-width': '12' }, svg, true);
    const core = el('path', { ...line, class: 'rh-filament__core', 'stroke-width': '2' }, svg, true);
    const bloom = el('circle', { class: 'rh-bloom', r: '0', cx: '0', cy: '0' }, svg, true);
    const hand = el('img', { class: 'rh-hand', src: HAND_SRC, alt: '', decoding: 'async', draggable: 'false' }, root);
    // The Skip control lives outside the aria-hidden layer so assistive tech can reach it.
    const skip = el('button', { type: 'button', class: 'rh-skip' }, body);
    skip.textContent = 'Skip animation';
    const obstacles = new Set(['#shuffleCardsBtn', '#stageDrawBtn'].map(s => document.querySelector(s)).filter(Boolean));

    let destroyed = false, frame = null, start = null;
    const controller = typeof AbortController === 'function' ? new AbortController() : null;
    const on = (target, type, fn, opts) => target.addEventListener(type, fn, { ...(opts || {}), signal: controller?.signal });

    function restingHand() {
      // Rest low on the right. Where that would cover a card or the Shuffle/Draw buttons, sink below them;
      // if the fingers (top 30% of the image) would then leave the screen, try a smaller hand.
      board.querySelectorAll('.stage-card[data-stage-card]').forEach(n => obstacles.add(n));
      const boxes = [...obstacles].filter(n => n.isConnected).map(n => n.getBoundingClientRect()).filter(r => r.width);
      let fit = null;
      for (let w = Math.min(260, Math.max(120, innerWidth * 0.34)); w >= 90 && !fit; w -= 20) {
        const h = w * 1.5, left = innerWidth - w - Math.max(8, innerWidth * 0.02);
        let top = innerHeight - h * 0.82;
        boxes.forEach(r => { if (r.right > left && r.left < left + w && r.bottom > top && r.top < innerHeight) top = Math.max(top, r.bottom + 8); });
        const candidate = { w, h, left, top: Math.min(top, innerHeight - h * 0.3) };
        if (top <= innerHeight - h * 0.3 || w - 20 < 90) fit = candidate;
      }
      return fit;
    }
    function fingertip() {
      const r = hand.getBoundingClientRect();
      return { x: r.left + r.width * FINGERTIP[0], y: r.top + r.height * FINGERTIP[1] };
    }
    function tick(time) {
      frame = null;
      if (destroyed) return;
      if (reduced()) { destroy(); return; }
      const card = target();
      if (!card || !document.contains(board)) { destroy(); return; }
      if (start === null) start = time;
      const t = time - start;
      const rest = restingHand();
      // Skip sits at the right of the Back link's row, clear of the menu, brand and Shop in the header
      // (the header scrolls away with the page, so once the row has gone it rises to the top).
      const back = document.querySelector('#app [data-back]')?.getBoundingClientRect();
      skip.style.top = Math.max(12, back?.height ? back.top + back.height / 2 - 22 : 12) + 'px';
      svg.setAttribute('viewBox', `0 0 ${innerWidth} ${innerHeight}`);
      // Phase B: the hand rises from below the right edge to its resting place.
      const rise = ease(clamp01((t - DELAY) / RISE));
      const fade = clamp01((t - DELAY - RISE - THREAD) / FADE);
      hand.style.width = rest.w + 'px';
      hand.style.left = rest.left + 'px';
      hand.style.top = rest.top + 'px';
      hand.style.transform = `translate(${(1 - rise) * rest.w * 0.4}px, ${(1 - rise) * rest.h * 0.6}px) rotate(${(1 - rise) * 12}deg)`;
      hand.style.opacity = String(rise * (1 - fade) * 0.95);
      // Phase C: the filament runs from the measured fingertip to the measured card centre.
      const thread = clamp01((t - DELAY - RISE) / THREAD);
      if (thread > 0) {
        const f = fingertip(), c = centre(card);
        const dx = c.x - f.x, dy = c.y - f.y;
        const bow = Math.max(40, Math.hypot(dx, dy) * 0.25);
        core.setAttribute('d', `M${f.x} ${f.y} C${f.x + dx * 0.25 + bow} ${f.y + dy * 0.2}, ${f.x + dx * 0.75 + bow * 0.5} ${f.y + dy * 0.85}, ${c.x} ${c.y}`);
        halo.setAttribute('d', core.getAttribute('d'));
        gradient.setAttribute('x1', f.x); gradient.setAttribute('y1', f.y);
        gradient.setAttribute('x2', c.x); gradient.setAttribute('y2', c.y);
        const dash = String(1 - ease(thread));
        core.setAttribute('stroke-dashoffset', dash); halo.setAttribute('stroke-dashoffset', dash);
        const glow = clamp01((thread - 0.8) / 0.2);
        bloom.setAttribute('cx', c.x); bloom.setAttribute('cy', c.y);
        bloom.setAttribute('r', String(60 * glow));
        root.dataset.target = `${Math.round(c.x)},${Math.round(c.y)}`;
        root.dataset.origin = `${Math.round(f.x)},${Math.round(f.y)}`;
      }
      // Phase D: hand, filament and bloom fade together.
      svg.style.opacity = String(1 - fade);
      root.dataset.phase = t < DELAY ? 'trigger' : t < DELAY + RISE ? 'hand' : t < DELAY + RISE + THREAD ? 'filament' : 'fade';
      if (t >= TOTAL) { destroy(); return; }
      frame = requestAnimationFrame(tick);
    }
    function destroy() {
      if (destroyed) return;
      destroyed = true;
      if (frame !== null) { cancelAnimationFrame(frame); frame = null; }
      controller?.abort();
      if (media?.removeEventListener) media.removeEventListener('change', onMedia);
      else if (media?.removeListener) media.removeListener(onMedia);
      const hadFocus = document.activeElement === skip;
      root.remove(); skip.remove();
      if (!hadActive) body.classList.remove('rh-active');
      // Skipping by keyboard must not drop focus to <body>; return it to the table heading.
      if (hadFocus) document.querySelector('#app .page h1')?.focus({ preventScroll: true });
      if (current === api) current = null;
    }
    function onMedia() { if (reduced()) destroy(); }

    on(skip, 'click', destroy);
    on(document, 'keydown', e => { if (e.key === 'Escape') destroy(); });
    on(window, 'popstate', destroy);
    on(window, 'pagehide', destroy);
    if (options.signal) on(options.signal, 'abort', destroy, { once: true });
    if (media?.addEventListener) media.addEventListener('change', onMedia);
    else if (media?.addListener) media.addListener(onMedia);

    const api = Object.freeze({ destroy, cancel: destroy, board, phase: () => destroyed ? 'done' : (root.dataset.phase || 'trigger') });
    current = api;
    frame = requestAnimationFrame(tick);
    return api;
  }

  window.ResonateHandTransition = Object.freeze({ version: '0.1.0', mount, duration: TOTAL, current: () => current });
})();
