/* RESONATE · Golden Thread "Tinkerbell" DEMO (golden-thread-kiss.html only; the live app does not load this).
   Chas, 10 Nov: a moving golden light, like Tinkerbell, trailing delicate golden dust IN FRONT of
   the cards. It floats freely, kisses the CENTRE of each card as it is revealed, then moves on.
   The trail follows the light's movement and fades; there is no permanent line joining cards.

   - One canvas, fixed over the viewport, drawn only while the light is flying or dust remains.
     Positions are kept in page coordinates, so the dust stays where it fell when the page scrolls.
   - The light steers towards each card's centre with a gentle wandering sway, slows as it
     arrives, rests on the centre (the kiss: a soft bloom and a small burst of dust), the card
     turns, and it drifts on to the next card. After the last card it rises and fades away.
   - Newly drawn clarifiers are visited the same way, in reading order.
   - Reduced motion: no flight and no dust; the cards turn at once.
   Loaded after app.js, reading-stage.js and deck-theatre.js. It wraps shell() and renderDraw()
   and changes nothing in those files. */
(function () {
  'use strict';
  if (typeof renderDraw !== 'function' || typeof shell !== 'function') return;

  var MAX_SPEED = 0.62;   // px per ms at full flight
  var HOLD = 480;         // ms the light rests on a card's centre (the kiss)
  var AFTER = 220;        // ms after the card turns before it moves on
  var MAX_DUST = 520;

  var token = 0;
  var dealingNow = false;   // true while the light deals the cards or visits new clarifiers
  var seen = { drawnAt: null, clar: {} };
  var canvas = null, ctx = null, dpr = 1, raf = 0;
  var light = null;       // { x, y, vx, vy, glow, alpha, visible }
  var dust = [];
  var blooms = [];        // { x, y, t0 }
  var last = 0, wanderT = Math.random() * 1000;

  function reduced() { return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); }
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function board() { return document.querySelector('.draw-page .spread-board'); }
  function sx() { return window.scrollX || window.pageXOffset || 0; }
  function sy() { return window.scrollY || window.pageYOffset || 0; }

  // ---------- canvas ----------
  function ensureCanvas() {
    if (canvas && document.body.contains(canvas)) return;
    canvas = document.createElement('canvas');
    canvas.className = 'gtk-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.appendChild(canvas);
    ctx = canvas.getContext('2d');
    size();
  }
  function size() {
    if (!canvas) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(window.innerWidth * dpr);
    canvas.height = Math.round(window.innerHeight * dpr);
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
  }
  window.addEventListener('resize', size);

  function startLoop() { if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); } }

  function emit(x, y, n, spread, speed) {
    for (var i = 0; i < n && dust.length < MAX_DUST; i++) {
      var a = Math.random() * Math.PI * 2, v = (speed || 0.02) * (0.3 + Math.random());
      dust.push({
        x: x + (Math.random() - .5) * spread, y: y + (Math.random() - .5) * spread,
        vx: Math.cos(a) * v, vy: Math.sin(a) * v + 0.004,
        life: 0, max: 700 + Math.random() * 1100,
        r: 0.5 + Math.random() * 1.5, tw: Math.random() * 6.28, hue: Math.random()
      });
    }
  }

  function frame(now) {
    raf = 0;
    var dt = Math.min(40, now - last); last = now;
    if (!ctx) return;
    var ox = sx(), oy = sy();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    ctx.globalCompositeOperation = 'lighter';

    // Dust: drifts, sinks a little, twinkles and fades.
    for (var i = dust.length - 1; i >= 0; i--) {
      var p = dust[i];
      p.life += dt;
      if (p.life >= p.max) { dust.splice(i, 1); continue; }
      p.vx *= 0.985; p.vy = p.vy * 0.985 + 0.00012 * dt;
      p.x += p.vx * dt; p.y += p.vy * dt;
      var k = p.life / p.max, fade = k < .12 ? k / .12 : 1 - (k - .12) / .88;
      var tw = 0.65 + 0.35 * Math.sin(p.tw + p.life * 0.018);
      var al = Math.max(0, fade * tw);
      var X = p.x - ox, Y = p.y - oy;
      if (X < -10 || Y < -10 || X > window.innerWidth + 10 || Y > window.innerHeight + 10) continue;
      ctx.fillStyle = p.hue > .7 ? 'rgba(255,248,226,' + al + ')' : 'rgba(243,212,143,' + (al * .9) + ')';
      ctx.beginPath(); ctx.arc(X, Y, p.r * (1 - k * .4), 0, 6.283); ctx.fill();
    }

    // Kiss blooms: a soft swell of light on the card's centre.
    for (var j = blooms.length - 1; j >= 0; j--) {
      var b = blooms[j], t = (now - b.t0) / 1500;
      if (t >= 1) { blooms.splice(j, 1); continue; }
      var rad = 18 + 46 * Math.sin(Math.min(1, t * 1.6) * 1.57), a2 = (t < .25 ? t / .25 : 1 - (t - .25) / .75) * .55;
      var g = ctx.createRadialGradient(b.x - ox, b.y - oy, 0, b.x - ox, b.y - oy, rad);
      g.addColorStop(0, 'rgba(255,246,220,' + a2 + ')');
      g.addColorStop(.35, 'rgba(241,207,134,' + (a2 * .45) + ')');
      g.addColorStop(1, 'rgba(201,169,106,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(b.x - ox, b.y - oy, rad, 0, 6.283); ctx.fill();
    }

    // The light itself: a bright core in a soft, breathing halo.
    if (light && light.alpha > 0.01) {
      var lx = light.x - ox, ly = light.y - oy, breathe = 1 + 0.12 * Math.sin(now * 0.006) + light.glow * 0.6;
      var A = light.alpha;
      var h = ctx.createRadialGradient(lx, ly, 0, lx, ly, 22 * breathe);
      h.addColorStop(0, 'rgba(255,250,236,' + (0.95 * A) + ')');
      h.addColorStop(.18, 'rgba(250,224,160,' + (0.6 * A) + ')');
      h.addColorStop(.5, 'rgba(225,186,110,' + (0.18 * A) + ')');
      h.addColorStop(1, 'rgba(201,169,106,0)');
      ctx.fillStyle = h; ctx.beginPath(); ctx.arc(lx, ly, 22 * breathe, 0, 6.283); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,248,' + A + ')';
      ctx.beginPath(); ctx.arc(lx, ly, 2.2, 0, 6.283); ctx.fill();
      // Two faint crossing glints, like a star's points.
      ctx.strokeStyle = 'rgba(255,246,220,' + (0.35 * A * breathe) + ')'; ctx.lineWidth = 0.8;
      var s = 9 * breathe;
      ctx.beginPath(); ctx.moveTo(lx - s, ly); ctx.lineTo(lx + s, ly); ctx.moveTo(lx, ly - s); ctx.lineTo(lx, ly + s); ctx.stroke();
    }

    ctx.globalCompositeOperation = 'source-over';
    if (dust.length || blooms.length || (light && light.visible) || flying) raf = requestAnimationFrame(frame);
    else ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  }

  // ---------- flight ----------
  var flying = 0;
  // A flight is still wanted: page flights carry the page token; Max's carry a check of their own.
  function alive(mine) { return typeof mine === 'function' ? mine() : mine === token; }
  // Steer the light to a live target (page coordinates), with a wandering sway that settles as it arrives.
  function flyTo(getTarget, mine) {
    flying++;
    startLoop();
    return new Promise(function (done) {
      var prev = performance.now();
      function step(now) {
        if (!alive(mine)) { flying--; return done(); }
        var dt = Math.min(40, now - prev); prev = now; wanderT += dt;
        var tg = getTarget(), dx = tg.x - light.x, dy = tg.y - light.y, dist = Math.hypot(dx, dy);
        if (dist < 1.5 && Math.hypot(light.vx, light.vy) < 0.05) {
          light.x = tg.x; light.y = tg.y; light.vx = light.vy = 0; flying--; return done();
        }
        // Arrive: full speed far away, easing in over the last 140 px.
        var want = MAX_SPEED * Math.min(1, dist / 140);
        var ux = dx / (dist || 1), uy = dy / (dist || 1);
        // Wander: a slow sideways sway, strongest mid-flight.
        var sway = Math.sin(wanderT * 0.0032) * 0.55 + Math.sin(wanderT * 0.0011 + 1.3) * 0.45;
        var wamp = 0.38 * Math.min(1, dist / 220);
        var tx = (ux - uy * sway * wamp) * want, ty = (uy + ux * sway * wamp) * want;
        var steer = Math.min(1, dt * 0.006);
        light.vx += (tx - light.vx) * steer; light.vy += (ty - light.vy) * steer;
        light.x += light.vx * dt; light.y += light.vy * dt;
        var sp = Math.hypot(light.vx, light.vy);
        // Dust falls from the light as it moves: more when it is quick.
        emit(light.x, light.y, sp > 0.05 ? (Math.random() < sp * 2.4 ? 2 : 1) : (Math.random() < .25 ? 1 : 0), 3, 0.012);
        requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }

  function centreOf(el) {
    var r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2 + sx(), y: r.top + r.height / 2 + sy() };
  }
  // On a phone the next card is often below the fold: bring it into view first.
  function follow(el) {
    var r = el.getBoundingClientRect(), vh = window.innerHeight;
    if (r.top >= 40 && r.bottom <= vh - 20) return wait(0);
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return wait(600);
  }

  function visit(el, turn, mine) {
    return follow(el).then(function () {
      if (mine !== token) return;
      return flyTo(function () { return centreOf(el); }, mine);
    }).then(function () {
      if (mine !== token) return;
      var c = centreOf(el);
      blooms.push({ x: c.x, y: c.y, t0: performance.now() });
      emit(c.x, c.y, 26, 10, 0.05);
      light.glow = 1;
      el.classList.add('gtk-kissed');
      return wait(HOLD * 0.55).then(function () {
        if (mine !== token) return;
        turn();
        return wait(HOLD * 0.45 + AFTER);
      }).then(function () { if (light) light.glow = 0; });
    });
  }

  function enter(firstEl) {
    var c = centreOf(firstEl);
    light = { x: c.x - Math.min(120, window.innerWidth * .2), y: sy() - 30, vx: 0.1, vy: 0.25, glow: 0, alpha: 1, visible: true };
    startLoop();
  }
  function leave(mine) {
    if (!light) return;
    var start = { x: light.x, y: light.y };
    return flyTo(function () { return { x: start.x + 90, y: sy() - 60 }; }, mine).then(function () {
      if (light) { light.visible = false; light.alpha = 0; }
    });
  }

  // ---------- page ----------
  function order(n) {
    var o = (typeof readingOrder === 'function') ? readingOrder() : null;
    if (!o || o.length !== n) { o = []; for (var i = 0; i < n; i++) o.push(i); }
    return o;
  }
  function settleDraw() {
    state.drawSettled = true;
    state.drawPhase = 'settled';
    var status = document.getElementById('drawStatus');
    if (status) status.textContent = 'Your spread is ready. Follow the reading below, or tap a card to go deeper.';
    var interpretation = document.getElementById('readingInterpretation');
    if (interpretation) interpretation.classList.remove('waiting');
  }
  function clarifiersOf(pos) { return Array.prototype.slice.call(pos.querySelectorAll('.position-clarifier')); }
  function coverClarifier(c) {
    c.classList.remove('clarifier-turn');
    Array.prototype.slice.call(c.querySelectorAll('.clarifier-back-cover')).forEach(function (x) { x.remove(); });
    c.classList.add('is-facedown', 'gtk-pending');
    var back = document.createElement('span');
    back.className = 'clarifier-back gtk-cover';
    back.setAttribute('aria-hidden', 'true');
    back.innerHTML = '<span class="back-mark">R</span><small>RESONATE</small>';
    c.appendChild(back);
  }
  function turnClarifier(c) {
    c.classList.remove('is-facedown', 'gtk-pending');
    var back = c.querySelector('.gtk-cover'); if (back) back.remove();
    var appCover = document.createElement('span');
    appCover.className = 'clarifier-back clarifier-back-cover';
    appCover.setAttribute('aria-hidden', 'true');
    appCover.innerHTML = '<span class="back-mark">R</span><small>RESONATE</small>';
    c.appendChild(appCover);
    c.classList.add('clarifier-turn', 'revealed');
  }

  function run(b, dealing, fresh, mine) {
    ensureCanvas();
    var cardsEls = Array.prototype.slice.call(b.querySelectorAll('.reading-card'));
    var positions = Array.prototype.slice.call(b.querySelectorAll(':scope > .reading-position'));
    var visits = [];
    if (dealing) {
      var ord = order(cardsEls.length);
      ord.forEach(function (idx, n) {
        var card = cardsEls[idx];
        visits.push({ el: card, turn: function () {
          card.classList.remove('is-facedown'); card.classList.add('revealed');
          if (n === ord.length - 1) settleDraw();
        } });
      });
    }
    order(positions.length).forEach(function (i) {
      clarifiersOf(positions[i]).forEach(function (c) {
        if (fresh.indexOf(c) < 0) return;
        coverClarifier(c);
        visits.push({ el: c, turn: function () { turnClarifier(c); } });
      });
    });
    if (!visits.length) return;

    dealingNow = true; maxSeq++;
    var go = function () {
      if (mine !== token) { dealingNow = false; return; }
      enter(visits[0].el);
      return visits.reduce(function (chain, v) {
        return chain.then(function () { if (mine === token) return visit(v.el, v.turn, mine); });
      }, Promise.resolve()).then(function () { if (mine === token) return leave(mine); }).then(function () { dealingNow = false; }, function () { dealingNow = false; });
    };
    follow(visits[0].el).then(go);
  }

  var baseShell = shell;
  window.shell = function () {
    token++;
    if (light) { light.visible = false; light.alpha = 0; }
    if (routeObserver) { routeObserver.disconnect(); routeObserver = null; }
    dealingNow = false;
    return baseShell.apply(this, arguments);
  };

  var baseRenderDraw = renderDraw;
  window.renderDraw = function () {
    var dealing = !state.drawSettled;
    var result = baseRenderDraw.apply(this, arguments);
    var mine = token;
    var b = board();
    if (!b) return result;

    // Which clarifiers are new since this reading was last shown.
    if (seen.drawnAt !== state.drawnAt) seen = { drawnAt: state.drawnAt, clar: {} };
    var fresh = [];
    Array.prototype.slice.call(b.querySelectorAll(':scope > .reading-position')).forEach(function (pos, i) {
      clarifiersOf(pos).forEach(function (c, k) {
        var img = c.querySelector('img');
        var key = i + '|' + k + '|' + (img ? img.getAttribute('src') : '');
        if (!seen.clar[key] && !dealing) fresh.push(c);
        seen.clar[key] = 1;
      });
    });

    try { tidyReading(); } catch (err) { if (window.console) console.warn('gtk route', err); }
    if (dealing && typeof clearDrawTimers === 'function') clearDrawTimers();
    if (reduced()) {
      if (dealing) {
        Array.prototype.slice.call(b.querySelectorAll('.reading-card')).forEach(function (c) { c.classList.remove('is-facedown'); c.classList.add('revealed'); });
        settleDraw();
      }
      return result;
    }
    requestAnimationFrame(function () { requestAnimationFrame(function () {
      if (mine === token && (dealing || fresh.length)) run(b, dealing, fresh, mine);
    }); });
    return result;
  };

  // ---------- The written reading as a calm, signposted route (Chas, 11 Nov) ----------
  // "A wall of words": positions sat side by side in narrow columns, each about 1,000 words, with the detail
  // (correspondences, why a card was read that way, revisions, method, lenses) in the same flow as the meaning.
  // Here, without changing a word of it:
  //  - one column, one part at a time: "Part 1 of 4 · Past" ... "Part 4 of 4 · The Golden Thread";
  //  - a short map of the parts at the top, each one a tap away;
  //  - each step (the card, Clarifier 1, Clarifier 2, Clarity, Together) in its own quiet box;
  //  - the supporting detail folded under "More about this card", "Why it is read this way",
  //    "How this was read" and "Deeper lenses", so the main path is the meaning itself;
  //  - a "Next" link at the foot of each part;
  //  - the light kisses each part's heading and each step's heading as the reader reaches it.
  // The PDF and Max are built from the reading's own text, not this layout, so neither changes.
  function fold(parent, nodes, label, cls) {
    nodes = nodes.filter(Boolean);
    if (!nodes.length) return null;
    var d = document.createElement('details');
    d.className = 'gtk-more' + (cls ? ' ' + cls : '');
    d.innerHTML = '<summary>' + label + '</summary>';
    parent.appendChild(d);                 // after the meaning, so the main path reads first
    nodes.forEach(function (n) { d.appendChild(n); });
    return d;
  }
  function q(el, sel) { return Array.prototype.slice.call(el.querySelectorAll(sel)); }
  function partId(i) { return 'gtk-part-' + i; }

  function tidyReading() {
    var ri = document.getElementById('readingInterpretation');
    if (!ri || ri.classList.contains('gtk-route')) return;
    var list = ri.querySelector('.reading-meanings');
    var arts = list ? q(list, ':scope > .reading-meaning') : [];
    if (!arts.length) return;
    ri.classList.add('gtk-route');
    var gt = ri.querySelector('.reading-golden-thread');
    var total = arts.length + (gt ? 1 : 0);
    var map = [];

    arts.forEach(function (a, n) {
      var head = a.querySelector('.reading-meaning-head');
      var name = head ? head.textContent.trim() : 'Position ' + (n + 1);
      var h3 = a.querySelector('.original-card-explanation h3');
      var card = h3 ? h3.textContent.replace(/^Original Card · [^·]+ · /, '').trim() : '';
      a.id = partId(n);
      if (head) {
        var tag = document.createElement('span');
        tag.className = 'gtk-part-tag';
        tag.textContent = 'Part ' + (n + 1) + ' of ' + total;
        head.insertBefore(tag, head.firstChild);
        head.classList.add('gtk-route-head');
      }
      map.push({ id: partId(n), n: n + 1, name: name, card: card });

      // Each step in its own box, with its supporting detail folded away.
      var orig = a.querySelector('.original-card-explanation');
      if (orig) {
        orig.classList.add('gtk-step');
        fold(orig, [orig.querySelector('.reading-astrology'), orig.querySelector('.reading-card-correspondences'), orig.querySelector('.symbolism-insight')], 'More about this card');
        var pl = orig.querySelector('.original-position-label'); if (pl) pl.classList.add('gtk-hide');
      }
      q(a, '.integrated-clarifier, .integrated-clarity').forEach(function (s) {
        s.classList.add('gtk-step');
        var rel = s.querySelector('.clarifier-relation');
        if (rel) fold(rel, q(rel, ':scope > .relation-basis, :scope > .relation-notes, :scope > .relation-rule'), 'Why it is read this way');
        fold(s, [s.querySelector(':scope > .reading-card-correspondences'), s.querySelector(':scope > .symbolism-insight')], 'More about this card');
      });
      var together = a.querySelector('.combined-meaning');
      if (together) {
        together.classList.add('gtk-step', 'gtk-step-together');
        fold(together, q(together, ':scope > .reading-revision-tag, :scope > details.reading-revision, :scope > .reading-method'), 'How this was read');
      }
      var lenses = q(a, ':scope .reading-meaning-body > .reading-card-lenses');
      if (lenses.length) fold(lenses[0].parentNode, lenses, 'Deeper lenses · Tao, Wu Wei and Jungian', 'gtk-lenses');
    });

    if (gt) {
      gt.id = partId(arts.length);
      gt.classList.add('gtk-route-thread');
      var eb = gt.querySelector(':scope > .eyebrow');
      if (eb) eb.innerHTML = '<span class="gtk-part-tag">Part ' + total + ' of ' + total + '</span> The Golden Thread';
      q(gt, '.golden-card-reading, .card-to-card-thread, .golden-thread-summary').forEach(function (b) { b.classList.add('gtk-step'); });
      var nums = gt.querySelector('.reading-number-thread');
      if (nums) {
        var nh = nums.querySelector('h3'); if (nh) nh.remove();
        fold(nums.parentNode, [nums], 'Numbers through your reading');
      }
      map.push({ id: partId(arts.length), n: total, name: 'The Golden Thread', card: 'the reading as a whole' });
    }

    // "Next" at the foot of each part.
    map.forEach(function (m, k) {
      var next = map[k + 1], el = document.getElementById(m.id);
      if (!next || !el) return;
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'gtk-next';
      b.innerHTML = 'Next · Part ' + next.n + ' · ' + esc(next.name) + ' <span aria-hidden="true">↓</span>';
      b.addEventListener('click', function () { var t = document.getElementById(next.id); if (t) t.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' }); });
      var body = el.querySelector('.reading-meaning-body') || el;
      body.appendChild(b);
    });

    // The map of the reading, under "What each position is saying".
    var h2 = ri.querySelector(':scope > h2');
    var nav = document.createElement('nav');
    nav.className = 'gtk-map';
    nav.setAttribute('aria-label', 'Parts of your reading');
    nav.innerHTML = '<p class="gtk-map-lead">Your reading in ' + total + ' parts. Read them in order, or tap one to go straight there.</p><ol>' +
      map.map(function (m) { return '<li><button type="button" data-gtk-go="' + m.id + '"><span class="gtk-map-n">' + m.n + '</span><span class="gtk-map-name">' + esc(m.name) + '</span><span class="gtk-map-card">' + esc(m.card) + '</span></button></li>'; }).join('') + '</ol>';
    if (h2) h2.insertAdjacentElement('afterend', nav); else ri.insertBefore(nav, ri.firstChild);
    q(nav, '[data-gtk-go]').forEach(function (b) {
      b.addEventListener('click', function () { var t = document.getElementById(b.getAttribute('data-gtk-go')); if (t) t.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' }); });
    });

    watchRoute(ri);
  }

  // The light reads with you: each part heading and step heading, once, as it comes into view.
  var routeObserver = null;
  function watchRoute(ri) {
    if (routeObserver) routeObserver.disconnect();
    if (reduced() || !window.IntersectionObserver) return;
    var seenEls = new WeakSet();
    routeObserver = new IntersectionObserver(function (entries) {
      if (!state.drawSettled || dealingNow || maxRoot) return;
      entries.forEach(function (en) {
        if (!en.isIntersecting || seenEls.has(en.target)) return;
        seenEls.add(en.target);
        kissEl(en.target, function (h) { var r = h.getBoundingClientRect(); return { x: r.left - 12 + sx(), y: r.top + r.height / 2 + sy() }; }, 0, 'page');
      });
    }, { threshold: 0.9, rootMargin: '0px 0px -25% 0px' });
    q(ri, '.gtk-route-head, .gtk-step > h3, .gtk-route-thread > h2, .golden-card-heading').forEach(function (h) { routeObserver.observe(h); });
  }

  // ---------- Max Chasroom (Chas, 11 Nov: "add it to Max") ----------
  // As Max talks about a card, the light flies to the centre of that card on his strip and kisses it,
  // then lifts to rest just above it until he moves on. The strip's cards are already face up: the light
  // never turns or hides a card here. A new line cancels a flight still under way, so the light keeps
  // pace with Max rather than queueing behind him. Closing Max lets the light fade.
  var maxSeq = 0, maxRoot = null, maxKissed = {};
  function maxPicture(slot) {
    if (!maxRoot) return null;
    var li = maxRoot.querySelector('[data-slot="' + slot + '"]');
    if (!li) return null;
    return li.querySelector(':scope > img.mc-main') || li.querySelector(':scope > img') || li;
  }
  // The light flies to an element's centre, kisses it, then hovers where hoverAt() says.
  // Each new kiss cancels one still under way, so the light always heads for the latest thing.
  function kissEl(el, hoverAt, delay, scope) {
    if (reduced() || !el) return;
    var page = scope === 'page';
    var seq = ++maxSeq, live = function () { return seq === maxSeq && (page ? !maxRoot && !dealingNow : !!maxRoot); };
    ensureCanvas();
    if (!light || !light.visible) {
      var c0 = centreOf(el);
      light = { x: c0.x - 70, y: sy() - 30, vx: 0.1, vy: 0.25, glow: 0, alpha: 1, visible: true };
    }
    light.alpha = 1; light.visible = true;
    startLoop();
    wait(delay || 0).then(function () {
      if (!live()) return;
      return flyTo(function () { return centreOf(el); }, live);
    }).then(function () {
      if (!live()) return;
      var c = centreOf(el);
      blooms.push({ x: c.x, y: c.y, t0: performance.now() });
      emit(c.x, c.y, 22, 9, 0.045);
      light.glow = 1;
      el.classList.remove('gtk-kissed'); void el.offsetWidth; el.classList.add('gtk-kissed');
      return wait(HOLD);
    }).then(function () {
      if (!live()) return;
      light.glow = 0;
      return flyTo(function () { return hoverAt(el); }, live);
    });
  }
  function maxVisit(slot) {
    // Max's strip scrolls itself to the card; give it a moment so the light heads for where the card lands.
    // After the kiss it lifts and hovers just above the card, so the picture is clear while Max speaks.
    kissEl(maxPicture(slot), function (pic) { var r = pic.getBoundingClientRect(); return { x: r.left + r.width / 2 + sx(), y: r.top - 14 + sy() }; }, 320);
  }

  // ---------- Max's transcript in headed boxes (Chas, 11 Nov) ----------
  // The transcript was one long list of every line: "a wall of words". Here it is grouped instead: a heading
  // for each part of the reading (Welcome, Your cards, First clarifiers, Second clarifiers, Clarity cards,
  // Bringing it together), and inside each part one box per card, headed by its card line, holding only the
  // lines about that card. Max's own list stays in the page, hidden, and the boxes are rebuilt whenever Max
  // rebuilds it (after a clarifier is drawn). As the reader scrolls the boxes into view, the light flies
  // down through the reading and kisses each box's heading, as it does the cards.
  var CHAPTERS = { intro: 'Welcome', cards: 'Your cards', c1: 'First clarifiers', c2: 'Second clarifiers', c3: 'Clarity cards', end: 'Bringing it together' };
  var txObserver = null, txMutation = null, txKissed = null;
  function chapterOfLabel(t) {
    if (/^Tonight:/.test(t)) return 'intro';
    if (/: first clarifier,/i.test(t)) return 'c1';
    if (/: second clarifier,/i.test(t)) return 'c2';
    if (/: Clarity card,/i.test(t)) return 'c3';
    return 'cards';
  }
  function esc(t) { var d = document.createElement('div'); d.textContent = t; return d.innerHTML; }
  // "Past: Ace of Cups." -> "Past · Ace of Cups"; "Past, Ace of Cups: first clarifier, Eight of Swords." -> "Past, Ace of Cups · first clarifier, Eight of Swords"
  function heading(t) { return t.replace(/\.$/, '').replace(/:\s*/, ' · '); }
  function buildTranscript(root) {
    var det = root.querySelector('.mc-transcript'), ol = det && det.querySelector(':scope > ol');
    if (!ol) return;
    var items = Array.prototype.slice.call(ol.children).map(function (li) {
      var m = /mc-kind-(\w+)/.exec(li.className);
      return { kind: m ? m[1] : 'quote', text: li.textContent };
    });
    var parts = [], cur = null, box = null, pending = [];
    function part(key) { if (!cur || cur.key !== key) { cur = { key: key, lead: [], boxes: [] }; parts.push(cur); } box = null; return cur; }
    items.forEach(function (it) {
      if (it.kind === 'label') {
        var key = chapterOfLabel(it.text);
        if (key === 'intro') { var ip = part('intro'); ip.lead = ip.lead.concat(pending, [it.text]); pending = []; return; }
        var p = part(key);
        if (pending.length) { p.lead = p.lead.concat(pending); pending = []; }
        box = { head: heading(it.text), lines: [] };
        p.boxes.push(box);
      } else if (it.kind === 'frame') {
        box = null;                          // a frame closes the card box it follows
        pending.push(it.text);
      } else if (box) {
        box.lines.push(it.text);
      } else {
        pending.push(it.text);
      }
    });
    if (pending.length) {
      // Lines before any card are the welcome; lines after the last card bring the reading together.
      if (!parts.length) parts.push({ key: 'intro', lead: pending, boxes: [] });
      else { var e = part('end'); e.boxes.push({ head: null, lines: pending }); }
    }
    var html = parts.map(function (p) {
      return '<section class="gtk-tx-part"><h3 class="gtk-tx-title">' + esc(CHAPTERS[p.key] || '') + '</h3>' +
        (p.lead.length ? '<p class="gtk-tx-lead">' + p.lead.map(esc).join(' ') + '</p>' : '') +
        p.boxes.map(function (b) {
          return '<article class="gtk-tx-box">' + (b.head ? '<h4 class="gtk-tx-head">' + esc(b.head) + '</h4>' : '') +
            b.lines.map(function (l) { return '<p>' + esc(l) + '</p>'; }).join('') + '</article>';
        }).join('') + '</section>';
    }).join('');
    var wrap = det.querySelector(':scope > .gtk-tx');
    if (!wrap) { wrap = document.createElement('div'); wrap.className = 'gtk-tx'; det.appendChild(wrap); }
    wrap.innerHTML = html;
    det.classList.add('gtk-boxed');
    watchBoxes(root, wrap);
  }
  // The light visits each heading as it comes into view, once each, in the order the reader reaches them.
  function watchBoxes(root, wrap) {
    if (txObserver) txObserver.disconnect();
    txKissed = new WeakSet();
    if (reduced() || !window.IntersectionObserver) return;
    txObserver = new IntersectionObserver(function (entries) {
      var det = root.querySelector('.mc-transcript');
      if (!det || !det.open) return;
      entries.forEach(function (en) {
        if (!en.isIntersecting || txKissed.has(en.target)) return;
        txKissed.add(en.target);
        var t = en.target.querySelector('.gtk-tx-head') || en.target;
        kissEl(t, function (h) { var r = h.getBoundingClientRect(); return { x: r.left - 10 + sx(), y: r.top + r.height / 2 + sy() }; }, 0);
      });
    }, { root: root, threshold: 0.55 });
    Array.prototype.slice.call(wrap.querySelectorAll('.gtk-tx-box, .gtk-tx-title')).forEach(function (b) { txObserver.observe(b); });
  }
  function setupTranscript(root) {
    buildTranscript(root);
    var ol = root.querySelector('.mc-transcript > ol');
    if (txMutation) txMutation.disconnect();
    if (ol && window.MutationObserver) { txMutation = new MutationObserver(function () { buildTranscript(root); }); txMutation.observe(ol, { childList: true }); }
    var det = root.querySelector('.mc-transcript');
    if (det) det.addEventListener('toggle', function () { if (det.open) { var w = det.querySelector('.gtk-tx'); if (w) watchBoxes(root, w); } });
  }

  document.addEventListener('maxchasroom:open', function (e) {
    maxRoot = e.detail.root; maxKissed = {}; maxSeq++;
    setupTranscript(maxRoot);
  });
  document.addEventListener('maxchasroom:show', function (e) {
    if (reduced() || !maxRoot || e.detail.root !== maxRoot) return;
    if (e.detail.index === 0) maxKissed = {};          // Play again / Replay starts over
    var fresh = (e.detail.show || []).filter(function (slot) { return /^(p\d+|c\d+-\d+|k\d+)$/.test(slot) && !maxKissed[slot]; });
    if (!fresh.length) return;
    fresh.forEach(function (slot) { maxKissed[slot] = true; });
    maxVisit(fresh[fresh.length - 1]);                   // the most specific: a clarifier over its card
  });
  document.addEventListener('maxchasroom:close', function () {
    maxSeq++; maxRoot = null; maxKissed = {};
    if (txObserver) { txObserver.disconnect(); txObserver = null; }
    if (txMutation) { txMutation.disconnect(); txMutation = null; }
    if (light) {
      var fade = function () { if (!light || maxRoot) return; light.alpha -= 0.06; if (light.alpha > 0) setTimeout(fade, 30); else { light.alpha = 0; light.visible = false; } };
      fade();
    }
  });

  window.__gtKiss = { version: 'tinkerbell-4-route', dust: function () { return dust.length; } };
})();
