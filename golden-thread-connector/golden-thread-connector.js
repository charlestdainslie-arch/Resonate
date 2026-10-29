/*!
 * RESONATE · Golden Thread connector — Phase A (isolated).
 * Opt-in, reading-state-driven SVG overlay. No card creation, no meaning changes,
 * no audio, no production import.
 *
 * Look (Chas, 29 Oct): the same visual language as the PR #45 opener. Each strand
 * is three stacked gold strokes (wide soft halo, glow, bright core). While a strand
 * draws in, a glowing head travels along it throwing off sparks; once settled,
 * glints run along the thread and a few sparks drift off it. Sparks and glints are
 * drawn on a canvas layer with requestAnimationFrame (no WAAPI), only while
 * mounted and motion is allowed. Reduced motion shows the strands still.
 *
 * API: mount(container, readingState, options), update(readingState), destroy()
 *
 * readingState (read-only, normalized):
 * {
 *   spreadId: string|null,
 *   mainCards: [{ positionIndex, cardId, orientation, revealed, element? }],
 *   clarifiers: { "<parentPositionIndex>": [
 *     { slot: 1|2, cardId, revealed, element? }
 *   ] }
 * }
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.GoldenThreadConnector = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var SVG_NS = 'http://www.w3.org/2000/svg';
  var VERSION = '0.2.0-phase-a-opener-look';

  var DEFAULTS = Object.freeze({
    mainSelector: '[data-gtc-main-card], .reading-card[data-reading-card]',
    parentSelector: '[data-gtc-parent]',
    clarifierSelector: '[data-gtc-clarifier]',
    revealedClass: 'revealed',
    facedownClass: 'is-facedown',
    reducedMotion: '(prefers-reduced-motion: reduce)',
    duration: 1100,
    sag: 0.3,
    forceReducedMotion: false
  });

  function assign(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      if (!source) continue;
      Object.keys(source).forEach(function (key) { target[key] = source[key]; });
    }
    return target;
  }

  function isElement(value) {
    return !!value && value.nodeType === 1;
  }

  function freezeDeep(value) {
    if (!value || typeof value !== 'object' || isElement(value)) return value;
    Object.keys(value).forEach(function (key) {
      freezeDeep(value[key]);
    });
    return Object.freeze(value);
  }

  function prefersReducedMotion(mql) {
    return !!(mql && mql.matches);
  }

  function anchor(el, base, edge) {
    var r = el.getBoundingClientRect();
    var x = r.left - base.left + r.width / 2;
    var y;
    if (edge === 'bottom') y = r.bottom - base.top;
    else if (edge === 'top') y = r.top - base.top;
    else y = r.top - base.top + r.height / 2;
    return { x: x, y: y };
  }

  function normalize(state) {
    var src = state || {};
    var mainCards = Array.isArray(src.mainCards) ? src.mainCards.map(function (m, i) {
      return {
        positionIndex: Number.isInteger(m.positionIndex) ? m.positionIndex : i,
        cardId: m.cardId == null ? null : m.cardId,
        orientation: m.orientation === 'reversed' ? 'reversed' : 'upright',
        revealed: m.revealed === true,
        element: isElement(m.element) ? m.element : null
      };
    }) : [];

    var clarifiers = {};
    if (src.clarifiers && typeof src.clarifiers === 'object') {
      Object.keys(src.clarifiers).forEach(function (key) {
        var list = Array.isArray(src.clarifiers[key]) ? src.clarifiers[key] : [];
        clarifiers[key] = list.map(function (c) {
          return {
            slot: c.slot === 2 ? 2 : 1,
            cardId: c.cardId == null ? null : c.cardId,
            revealed: c.revealed === true,
            element: isElement(c.element) ? c.element : null
          };
        });
      });
    }

    return freezeDeep({
      spreadId: src.spreadId == null ? null : src.spreadId,
      mainCards: mainCards,
      clarifiers: clarifiers
    });
  }

  function GoldenThreadConnector(options) {
    this.options = assign({}, DEFAULTS, options || {});
    this._mounted = false;
    this._destroyed = false;
    this._container = null;
    this._svg = null;
    this._state = null;
    this._signature = '';
    this._animations = [];
    this._nodes = new Map();
    this._observedEls = new Set();
    this._resizeObserver = null;
    this._mutationObserver = null;
    this._raf = 0;
    this._ignoreMutationsUntil = 0;
    this._reducedMql = null;
    this._bfcacheContainer = null;
    this._bfcacheState = null;
    this._canvas = null;
    this._ctx = null;
    this._loop = 0;
    this._lastTick = 0;
    this._sparks = [];
    this._glints = [];
    var self = this;
    this._onReducedChange = function () { self._scheduleRender(false); };
    this._tick = function (now) { self._sparkleTick(now); };
    this._onPageHide = function () {
      self._bfcacheContainer = self._container;
      self._bfcacheState = self._state;
      self.destroy({ keepInstance: true });
    };
    this._onPageShow = function (event) {
      if (!event || !event.persisted) return;
      var container = self._bfcacheContainer;
      var state = self._bfcacheState;
      self._bfcacheContainer = null;
      self._bfcacheState = null;
      if (container && container.isConnected && state) self.mount(container, state);
    };
    this._onResize = function () { self._scheduleRender(false); };
  }

  GoldenThreadConnector.prototype.mount = function (container, readingState, options) {
    if (!isElement(container)) throw new TypeError('GoldenThreadConnector.mount(container, state): container must be an Element');
    if (options) this.options = assign({}, this.options, options);
    if (this._mounted) this.destroy({ keepInstance: true });
    this._destroyed = false;
    this._container = container;
    this._state = normalize(readingState);
    this._ensureBase();
    this._observe();
    this._mounted = true;
    this._render(true);
    return this;
  };

  GoldenThreadConnector.prototype.update = function (readingState) {
    if (!this._mounted || this._destroyed) return this;
    var next = normalize(readingState);
    var signature = this._signatureOf(next);
    this._state = next;
    if (signature !== this._signature) this._render(true);
    else this._scheduleRender(false);
    return this;
  };

  GoldenThreadConnector.prototype.destroy = function (opts) {
    var self = this;
    var keepInstance = !!(opts && opts.keepInstance);
    this._mounted = false;
    this._destroyed = !keepInstance;
    this._cancelAnimations();
    if (this._raf) cancelAnimationFrame(this._raf);
    this._raf = 0;
    if (this._resizeObserver) {
      this._observedEls.forEach(function (el) {
        try { self._resizeObserver.unobserve(el); } catch (error) {}
      });
      this._resizeObserver.disconnect();
    }
    this._resizeObserver = null;
    this._observedEls.clear();
    if (this._mutationObserver) this._mutationObserver.disconnect();
    this._mutationObserver = null;
    this._nodes.forEach(function (node) { self._cancelNode(node); });
    this._nodes.clear();
    if (this._reducedMql) {
      if (this._reducedMql.removeEventListener) this._reducedMql.removeEventListener('change', this._onReducedChange);
      this._reducedMql = null;
    }
    window.removeEventListener('resize', this._onResize);
    window.removeEventListener('orientationchange', this._onResize);
    window.removeEventListener('pagehide', this._onPageHide);
    // bfcache: pagehide -> destroy({keepInstance:true}) must leave the
    // pageshow listener alive so _onPageShow can remount. A full destroy
    // (default) tears it down.
    if (!keepInstance) {
      window.removeEventListener('pageshow', this._onPageShow);
    }
    this._stopLoop();
    if (this._canvas && this._canvas.parentNode) this._canvas.parentNode.removeChild(this._canvas);
    this._canvas = null;
    this._ctx = null;
    if (this._svg && this._svg.parentNode) this._svg.parentNode.removeChild(this._svg);
    this._svg = null;
    if (this._container) {
      this._container.classList.remove('gtc-host');
      if (this._container.dataset.gtcPositionRestored === '1') {
        this._container.style.position = this._container.dataset.gtcPrevPosition || '';
        delete this._container.dataset.gtcPrevPosition;
        delete this._container.dataset.gtcPositionRestored;
      }
    }
    this._container = null;
    this._state = null;
    this._signature = '';
    return this;
  };

  GoldenThreadConnector.prototype._ensureBase = function () {
    var c = this._container;
    var computed = window.getComputedStyle(c);
    if (computed.position === 'static') {
      c.dataset.gtcPrevPosition = c.style.position || '';
      c.style.position = 'relative';
      c.dataset.gtcPositionRestored = '1';
    }
    c.classList.add('gtc-host');
    var svg = c.querySelector(':scope > svg.gtc-overlay');
    if (!svg) {
      svg = document.createElementNS(SVG_NS, 'svg');
      svg.setAttribute('class', 'gtc-overlay');
      svg.setAttribute('aria-hidden', 'true');
      svg.setAttribute('focusable', 'false');
      svg.setAttribute('preserveAspectRatio', 'none');
      c.insertBefore(svg, c.firstChild);
    }
    this._svg = svg;
    var canvas = c.querySelector(':scope > canvas.gtc-sparkle');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.className = 'gtc-sparkle';
      canvas.setAttribute('aria-hidden', 'true');
      if (svg.nextSibling) c.insertBefore(canvas, svg.nextSibling);
      else c.appendChild(canvas);
    }
    this._canvas = canvas;
    this._ctx = canvas.getContext ? canvas.getContext('2d') : null;
  };

  GoldenThreadConnector.prototype._observe = function () {
    var self = this;
    var c = this._container;
    if (typeof ResizeObserver === 'function') {
      this._resizeObserver = new ResizeObserver(function () { self._scheduleRender(false); });
      this._resizeObserver.observe(c);
      this._observeCards();
    }
    if (typeof MutationObserver === 'function') {
      this._mutationObserver = new MutationObserver(function (mutations) {
        if (Date.now() < self._ignoreMutationsUntil) return;
        var relevant = mutations.some(function (m) {
          return !(self._svg && self._svg.contains(m.target)) && m.target !== self._canvas;
        });
        self._observeCards();
        if (relevant) self._scheduleRender(false);
      });
      this._mutationObserver.observe(c, {
        subtree: true,
        childList: true,
        attributes: true,
        attributeFilter: ['class', 'style', 'hidden', 'data-gtc-revealed']
      });
    }
    window.addEventListener('resize', this._onResize, { passive: true });
    window.addEventListener('orientationchange', this._onResize, { passive: true });
    window.addEventListener('pagehide', this._onPageHide);
    window.addEventListener('pageshow', this._onPageShow);
    if (window.matchMedia) {
      this._reducedMql = window.matchMedia(this.options.reducedMotion);
      if (this._reducedMql.addEventListener) this._reducedMql.addEventListener('change', this._onReducedChange);
    }
  };

  GoldenThreadConnector.prototype._mainElement = function (entry) {
    if (entry.element && this._container.contains(entry.element)) return entry.element;
    var c = this._container;
    return c.querySelector('[data-gtc-main-card="' + entry.positionIndex + '"]') ||
      c.querySelector('.reading-card[data-index="' + entry.positionIndex + '"]');
  };

  GoldenThreadConnector.prototype._clarifierElement = function (parentIndex, slot) {
    var parent = this._container.querySelector(this.options.parentSelector + '[data-gtc-parent="' + parentIndex + '"]');
    if (!parent) return null;
    return parent.querySelector('[data-gtc-clarifier="' + slot + '"]');
  };

  GoldenThreadConnector.prototype._observeCards = function () {
    if (!this._resizeObserver) return;
    var self = this;
    var current = this._allCardElements();
    var currentSet = new Set(current);
    current.forEach(function (el) {
      if (!self._observedEls.has(el)) {
        self._resizeObserver.observe(el);
        self._observedEls.add(el);
      }
    });
    this._observedEls.forEach(function (el) {
      if (!currentSet.has(el)) {
        try { self._resizeObserver.unobserve(el); } catch (error) {}
        self._observedEls.delete(el);
      }
    });
  };

  GoldenThreadConnector.prototype._allCardElements = function () {
    var self = this;
    var els = new Set();
    this._state.mainCards.forEach(function (m) {
      var el = self._mainElement(m);
      if (el) els.add(el);
    });
    Object.keys(this._state.clarifiers).forEach(function (parentIndex) {
      self._state.clarifiers[parentIndex].forEach(function (c) {
        var el = self._clarifierElement(parentIndex, c.slot);
        if (el) els.add(el);
      });
    });
    return Array.from(els);
  };

  GoldenThreadConnector.prototype._isRevealed = function (entry, el) {
    if (!entry.revealed || !el) return false;
    if (el.hidden) return false;
    if (el.classList.contains(this.options.facedownClass)) return false;
    if (el.getAttribute('aria-hidden') === 'true' && !el.classList.contains(this.options.revealedClass)) return false;
    return true;
  };

  GoldenThreadConnector.prototype._signatureOf = function (state) {
    return JSON.stringify({
      s: state.spreadId,
      m: state.mainCards.map(function (m) { return [m.positionIndex, m.cardId, m.orientation, m.revealed]; }),
      c: Object.keys(state.clarifiers).sort().map(function (k) {
        return [k, state.clarifiers[k].map(function (c) { return [c.slot, c.cardId, c.revealed]; })];
      })
    });
  };

  GoldenThreadConnector.prototype._scheduleRender = function (animate) {
    var self = this;
    if (!this._mounted || this._destroyed || this._raf) return;
    this._raf = requestAnimationFrame(function () {
      self._raf = 0;
      if (self._mounted && !self._destroyed) self._render(animate === true);
    });
  };

  GoldenThreadConnector.prototype._render = function (animate) {
    if (!this._svg || !this._container) return;
    this._ignoreMutationsUntil = Date.now() + 120;

    var base = this._container.getBoundingClientRect();
    var width = Math.max(1, Math.round(base.width));
    var height = Math.max(1, Math.round(base.height));
    this._svg.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
    this._svg.setAttribute('width', width);
    this._svg.setAttribute('height', height);

    if (this._nodes.size === 0) {
      while (this._svg.firstChild) this._svg.removeChild(this._svg.firstChild);
    }

    var reduced = this.options.forceReducedMotion || prefersReducedMotion(this._reducedMql);
    var segments = this._buildSegments(base);
    var self = this;
    var nextKeys = new Set();

    segments.forEach(function (seg) {
      nextKeys.add(seg.key);
      var node = self._nodes.get(seg.key);
      if (!node) {
        node = self._createNode(seg);
        self._svg.appendChild(node.group);
        self._nodes.set(seg.key, node);
        if (animate && !reduced) self._animateNode(node);
      } else {
        self._updateNode(node, seg);
      }
    });

    this._nodes.forEach(function (node, key) {
      if (!nextKeys.has(key)) {
        self._removeNode(node);
        self._nodes.delete(key);
      }
    });

    this._observeCards();
    this._signature = this._signatureOf(this._state);
    if (reduced) this._stopLoop();
    else if (this._nodes.size) this._startLoop();
  };

  GoldenThreadConnector.prototype._createNode = function (seg) {
    var d = this._curve(seg.from, seg.to);
    var group = document.createElementNS(SVG_NS, 'g');
    group.setAttribute('data-gtc-key', seg.key);
    group.setAttribute('data-gtc-from-x', seg.from.x.toFixed(2));
    group.setAttribute('data-gtc-from-y', seg.from.y.toFixed(2));
    group.setAttribute('data-gtc-to-x', seg.to.x.toFixed(2));
    group.setAttribute('data-gtc-to-y', seg.to.y.toFixed(2));
    group.setAttribute('aria-hidden', 'true');

    // Three stacked strokes, as in the #45 opener: wide soft halo, glow, bright core.
    var basePath = document.createElementNS(SVG_NS, 'path');
    basePath.setAttribute('d', d);
    basePath.setAttribute('class', 'gtc-filament gtc-filament--base gtc-filament--halo');
    basePath.setAttribute('aria-hidden', 'true');
    group.appendChild(basePath);

    var glowPath = document.createElementNS(SVG_NS, 'path');
    glowPath.setAttribute('d', d);
    glowPath.setAttribute('class', 'gtc-filament gtc-filament--glow');
    glowPath.setAttribute('aria-hidden', 'true');
    glowPath.style.strokeDashoffset = '0';
    group.appendChild(glowPath);

    var headPath = document.createElementNS(SVG_NS, 'path');
    headPath.setAttribute('d', d);
    headPath.setAttribute('class', 'gtc-filament gtc-filament--head');
    headPath.setAttribute('aria-hidden', 'true');
    headPath.style.strokeDashoffset = '0';
    group.appendChild(headPath);

    var dot = document.createElementNS(SVG_NS, 'circle');
    dot.setAttribute('cx', seg.to.x);
    dot.setAttribute('cy', seg.to.y);
    dot.setAttribute('r', '2.6');
    dot.setAttribute('class', 'gtc-filament-dot');
    dot.setAttribute('aria-hidden', 'true');
    group.appendChild(dot);

    return { group: group, base: basePath, glow: glowPath, head: headPath, dot: dot, d: d, animations: [],
      drawing: null, len: 0, glintIn: 0.4 + Math.random() * 1.2 };
  };

  GoldenThreadConnector.prototype._animateNode = function (node) {
    var self = this;
    var length = Math.max(1, node.head.getTotalLength());
    node.len = length;
    var strokes = [node.base, node.glow, node.head];
    var timing = { duration: this.options.duration, easing: 'cubic-bezier(.45,.05,.25,1)', fill: 'forwards' };
    strokes.forEach(function (path) {
      path.style.strokeDasharray = String(length);
      path.style.strokeDashoffset = String(length);
    });
    node.dot.style.opacity = '0';
    var pair = strokes.map(function (path) {
      return path.animate([{ strokeDashoffset: length }, { strokeDashoffset: 0 }], timing);
    }).concat([
      node.dot.animate(
        [{ opacity: 0 }, { opacity: 1 }],
        { duration: Math.min(220, this.options.duration), delay: Math.max(0, this.options.duration - 180), fill: 'forwards' }
      )
    ]);
    node.drawing = pair[2];
    pair.forEach(function (a) { node.animations.push(a); self._animations.push(a); });

    var settled = false;
    var settle = function () {
      if (settled) return;
      settled = true;
      // Bake the final visual state into inline styles, then cancel the
      // WAAPI animation so it leaves document.getAnimations().
      strokes.forEach(function (path) {
        path.style.strokeDasharray = '';
        path.style.strokeDashoffset = '0';
      });
      node.dot.style.opacity = '1';
      if (node.drawing === pair[2]) node.drawing = null;
      pair.forEach(function (a) {
        var i = self._animations.indexOf(a); if (i !== -1) self._animations.splice(i, 1);
        var j = node.animations.indexOf(a); if (j !== -1) node.animations.splice(j, 1);
        try { a.cancel(); } catch (e) {}
      });
    };
    pair.forEach(function (a) { a.onfinish = settle; a.oncancel = settle; });
  };

  GoldenThreadConnector.prototype._updateNode = function (node, seg) {
    var d = this._curve(seg.from, seg.to);
    if (node.d === d) return;
    node.base.setAttribute('d', d);
    node.glow.setAttribute('d', d);
    node.head.setAttribute('d', d);
    node.len = 0;
    node.dot.setAttribute('cx', seg.to.x);
    node.dot.setAttribute('cy', seg.to.y);
    node.group.setAttribute('data-gtc-from-x', seg.from.x.toFixed(2));
    node.group.setAttribute('data-gtc-from-y', seg.from.y.toFixed(2));
    node.group.setAttribute('data-gtc-to-x', seg.to.x.toFixed(2));
    node.group.setAttribute('data-gtc-to-y', seg.to.y.toFixed(2));
    node.d = d;
    this._cancelNode(node);
    node.head.style.strokeDashoffset = '0';
    node.dot.style.opacity = '1';
  };

  GoldenThreadConnector.prototype._removeNode = function (node) {
    this._cancelNode(node);
    if (node.group.parentNode) node.group.parentNode.removeChild(node.group);
  };

  GoldenThreadConnector.prototype._cancelNode = function (node) {
    var animations = node.animations.slice();
    node.animations = [];
    animations.forEach(function (animation) {
      try { animation.cancel(); } catch (error) {}
    });
  };

  // ---- sparkle layer (canvas, rAF only; never WAAPI) ---------------------------------------------

  GoldenThreadConnector.prototype._startLoop = function () {
    if (this._loop || !this._ctx || !this._mounted) return;
    this._lastTick = 0;
    this._loop = requestAnimationFrame(this._tick);
  };

  GoldenThreadConnector.prototype._stopLoop = function () {
    if (this._loop) cancelAnimationFrame(this._loop);
    this._loop = 0;
    this._sparks = [];
    this._glints = [];
    if (this._ctx && this._canvas) {
      this._ctx.setTransform(1, 0, 0, 1, 0, 0);
      this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
    }
  };

  GoldenThreadConnector.prototype._pointOn = function (node, fraction) {
    if (!node.len) node.len = Math.max(1, node.head.getTotalLength());
    var p = node.head.getPointAtLength(node.len * Math.max(0, Math.min(1, fraction)));
    return { x: p.x, y: p.y };
  };

  GoldenThreadConnector.prototype._spark = function (x, y, spread, lift, life, size) {
    if (this._sparks.length > 260) return;
    this._sparks.push({
      x: x, y: y,
      vx: (Math.random() - 0.5) * spread,
      vy: (Math.random() - 0.5) * spread - lift,
      life: 0, max: life * (0.6 + Math.random() * 0.8),
      s: size * (0.5 + Math.random())
    });
  };

  GoldenThreadConnector.prototype._sparkleTick = function (now) {
    this._loop = 0;
    if (!this._mounted || this._destroyed || !this._ctx || !this._container) return;
    var self = this;
    var dt = this._lastTick ? Math.min(0.05, (now - this._lastTick) / 1000) : 1 / 60;
    this._lastTick = now;

    var rect = this._container.getBoundingClientRect();
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    var w = Math.max(1, Math.round(rect.width * dpr));
    var h = Math.max(1, Math.round(rect.height * dpr));
    if (this._canvas.width !== w) this._canvas.width = w;
    if (this._canvas.height !== h) this._canvas.height = h;
    var ctx = this._ctx;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = 'lighter';

    var heads = [];
    this._nodes.forEach(function (node) {
      var anim = node.drawing;
      if (anim && anim.playState !== 'finished' && anim.playState !== 'idle') {
        var timing = anim.effect && anim.effect.getComputedTiming ? anim.effect.getComputedTiming() : null;
        var progress = timing && timing.progress != null ? timing.progress : 0;
        var p = self._pointOn(node, progress);
        heads.push(p);
        for (var k = 0; k < 3; k++) self._spark(p.x, p.y, 70, 12, 0.9, 2);
        return;
      }
      // Settled: glints run along the thread from time to time, and a few sparks drift off it.
      node.glintIn -= dt;
      if (node.glintIn <= 0) {
        self._glints.push({ node: node, t: 0, dur: 1.2 + Math.random() * 0.6 });
        node.glintIn = 1.8 + Math.random() * 2.6;
      }
      if (Math.random() < dt * 2.2) {
        var q = self._pointOn(node, Math.random());
        self._spark(q.x, q.y, 14, 10, 1.6, 1.4);
      }
    });

    // Heads: a warm, bright radial glow at the drawing tip.
    heads.forEach(function (p) {
      var g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 18);
      g.addColorStop(0, 'rgba(255,240,200,0.95)');
      g.addColorStop(1, 'rgba(255,200,120,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(p.x, p.y, 18, 0, 7); ctx.fill();
    });

    // Glints: a small bright light that runs the length of a finished strand.
    this._glints = this._glints.filter(function (gl) {
      if (!self._nodes.has(gl.node.group.getAttribute('data-gtc-key'))) return false;
      gl.t += dt;
      var u = gl.t / gl.dur;
      if (u >= 1) return false;
      var eased = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
      var p = self._pointOn(gl.node, eased);
      var a = Math.sin(Math.PI * u);
      var g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 11);
      g.addColorStop(0, 'rgba(255,244,214,' + (0.9 * a).toFixed(3) + ')');
      g.addColorStop(1, 'rgba(255,200,120,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(p.x, p.y, 11, 0, 7); ctx.fill();
      if (Math.random() < 0.35) self._spark(p.x, p.y, 26, 6, 0.7, 1.4);
      return true;
    });

    // Sparks: as in the opener, they fade in and out over their short life.
    this._sparks = this._sparks.filter(function (sp) {
      sp.life += dt;
      if (sp.life >= sp.max) return false;
      sp.x += sp.vx * dt; sp.y += sp.vy * dt;
      sp.vx *= 0.96; sp.vy *= 0.96;
      var a = Math.sin(Math.PI * sp.life / sp.max);
      ctx.fillStyle = 'rgba(255,' + (210 + Math.round(40 * a)) + ',150,' + a.toFixed(3) + ')';
      ctx.beginPath(); ctx.arc(sp.x, sp.y, sp.s * (0.6 + 0.4 * a), 0, 7); ctx.fill();
      return true;
    });

    if (this._nodes.size || this._sparks.length) this._loop = requestAnimationFrame(this._tick);
  };

  GoldenThreadConnector.prototype._buildSegments = function (base) {
    var self = this;
    var segments = [];
    var all = this._state.mainCards
      .map(function (m) { return assign({}, m, { el: self._mainElement(m) }); })
      .filter(function (m) { return m.el; })
      .sort(function (a, b) { return a.positionIndex - b.positionIndex; });

    // P1-C: only a contiguous revealed prefix is eligible. A face-down main
    // card blocks every card after it, so 0 can never connect to 2.
    var mains = [];
    for (var i = 0; i < all.length; i++) {
      if (!self._isRevealed(all[i], all[i].el)) break;
      mains.push(all[i]);
    }

    mains.forEach(function (parent) {
      var from = anchor(parent.el, base, 'bottom');
      var list = self._state.clarifiers[String(parent.positionIndex)] || [];
      var revealed = [];
      list.forEach(function (c) {
        var el = self._clarifierElement(parent.positionIndex, c.slot);
        if (el && self._isRevealed(c, el)) revealed.push(assign({}, c, { el: el }));
      });
      revealed.sort(function (a, b) { return a.slot - b.slot; });

      revealed.forEach(function (clarifier) {
        segments.push({
          key: 'main:' + parent.positionIndex + ':clarifier:' + clarifier.slot,
          from: from,
          to: anchor(clarifier.el, base, 'top')
        });
      });
    });

    for (var j = 0; j < mains.length - 1; j++) {
      var current = mains[j];
      var next = mains[j + 1];
      var list = this._state.clarifiers[String(current.positionIndex)] || [];
      var last = null;
      list.forEach(function (c) {
        var el = self._clarifierElement(current.positionIndex, c.slot);
        if (el && self._isRevealed(c, el) && (!last || c.slot > last.slot)) {
          last = assign({}, c, { el: el });
        }
      });
      segments.push({
        key: 'main:' + current.positionIndex + ':next:' + next.positionIndex,
        from: anchor(last ? last.el : current.el, base, 'bottom'),
        to: anchor(next.el, base, 'top')
      });
    }

    return segments;
  };

  GoldenThreadConnector.prototype._curve = function (from, to) {
    var dx = to.x - from.x;
    var dy = to.y - from.y;
    var distance = Math.hypot(dx, dy);
    var sag = Math.min(64, Math.max(14, distance * this.options.sag));
    var cx = (from.x + to.x) / 2;
    var cy = (from.y + to.y) / 2 + sag;
    return 'M ' + from.x.toFixed(2) + ' ' + from.y.toFixed(2) +
      ' Q ' + cx.toFixed(2) + ' ' + cy.toFixed(2) +
      ' ' + to.x.toFixed(2) + ' ' + to.y.toFixed(2);
  };

  GoldenThreadConnector.prototype._cancelAnimations = function () {
    this._animations.forEach(function (animation) {
      try { animation.cancel(); } catch (error) {}
    });
    this._animations = [];
  };

  GoldenThreadConnector.VERSION = VERSION;
  GoldenThreadConnector.normalize = normalize;
  return GoldenThreadConnector;
});
