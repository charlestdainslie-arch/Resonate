/*!
 * RESONATE · Golden Thread connector — Phase A (isolated).
 * Opt-in, reading-state-driven SVG overlay. No card creation, no meaning changes,
 * no audio, no production import.
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
  var VERSION = '0.1.0-phase-a';

  var DEFAULTS = Object.freeze({
    mainSelector: '[data-gtc-main-card], .reading-card[data-reading-card]',
    parentSelector: '[data-gtc-parent]',
    clarifierSelector: '[data-gtc-clarifier]',
    revealedClass: 'revealed',
    facedownClass: 'is-facedown',
    reducedMotion: '(prefers-reduced-motion: reduce)',
    duration: 620,
    sag: 0.22,
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
    var self = this;
    this._onReducedChange = function () { self._scheduleRender(false); };
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
    window.removeEventListener('pageshow', this._onPageShow);
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
          return !(self._svg && self._svg.contains(m.target));
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

    var basePath = document.createElementNS(SVG_NS, 'path');
    basePath.setAttribute('d', d);
    basePath.setAttribute('class', 'gtc-filament gtc-filament--base');
    basePath.setAttribute('aria-hidden', 'true');
    group.appendChild(basePath);

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

    return { group: group, base: basePath, head: headPath, dot: dot, d: d, animations: [] };
  };

  GoldenThreadConnector.prototype._animateNode = function (node) {
    var length = Math.max(1, node.head.getTotalLength());
    node.head.style.strokeDasharray = String(length);
    node.head.style.strokeDashoffset = String(length);
    node.dot.style.opacity = '0';
    var headAnimation = node.head.animate(
      [{ strokeDashoffset: length }, { strokeDashoffset: 0 }],
      { duration: this.options.duration, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'forwards' }
    );
    var dotAnimation = node.dot.animate(
      [{ opacity: 0 }, { opacity: 1 }],
      { duration: Math.min(220, this.options.duration), delay: Math.max(0, this.options.duration - 180), fill: 'forwards' }
    );
    node.animations.push(headAnimation, dotAnimation);
    this._animations.push(headAnimation, dotAnimation);
  };

  GoldenThreadConnector.prototype._updateNode = function (node, seg) {
    var d = this._curve(seg.from, seg.to);
    if (node.d === d) return;
    node.base.setAttribute('d', d);
    node.head.setAttribute('d', d);
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
    node.animations.forEach(function (animation) {
      try { animation.cancel(); } catch (error) {}
    });
    node.animations = [];
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
    var sag = Math.min(46, Math.max(10, distance * this.options.sag));
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
