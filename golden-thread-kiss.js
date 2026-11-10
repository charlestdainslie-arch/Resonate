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

    var go = function () {
      if (mine !== token) return;
      enter(visits[0].el);
      return visits.reduce(function (chain, v) {
        return chain.then(function () { if (mine === token) return visit(v.el, v.turn, mine); });
      }, Promise.resolve()).then(function () { if (mine === token) return leave(mine); });
    };
    follow(visits[0].el).then(go);
  }

  var baseShell = shell;
  window.shell = function () {
    token++;
    if (light) { light.visible = false; light.alpha = 0; }
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
  function maxVisit(slot) {
    var seq = ++maxSeq, live = function () { return seq === maxSeq && !!maxRoot; };
    var pic = maxPicture(slot);
    if (!pic) return;
    ensureCanvas();
    if (!light || !light.visible) {
      var c0 = centreOf(pic);
      light = { x: c0.x - 70, y: sy() - 30, vx: 0.1, vy: 0.25, glow: 0, alpha: 1, visible: true };
    }
    light.alpha = 1; light.visible = true;
    startLoop();
    // Max's strip scrolls itself to the card; give it a moment so the light heads for where the card lands.
    wait(320).then(function () {
      if (!live()) return;
      return flyTo(function () { return centreOf(pic); }, live);
    }).then(function () {
      if (!live()) return;
      var c = centreOf(pic);
      blooms.push({ x: c.x, y: c.y, t0: performance.now() });
      emit(c.x, c.y, 22, 9, 0.045);
      light.glow = 1;
      pic.classList.remove('gtk-kissed'); void pic.offsetWidth; pic.classList.add('gtk-kissed');
      return wait(HOLD);
    }).then(function () {
      if (!live()) return;
      light.glow = 0;
      // Lift off the picture and hover just above it, so the card is clear while Max speaks.
      return flyTo(function () { var r = pic.getBoundingClientRect(); return { x: r.left + r.width / 2 + sx(), y: r.top - 14 + sy() }; }, live);
    });
  }
  document.addEventListener('maxchasroom:open', function (e) {
    if (reduced()) return;
    maxRoot = e.detail.root; maxKissed = {}; maxSeq++;
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
    if (light) {
      var fade = function () { if (!light || maxRoot) return; light.alpha -= 0.06; if (light.alpha > 0) setTimeout(fade, 30); else { light.alpha = 0; light.visible = false; } };
      fade();
    }
  });

  window.__gtKiss = { version: 'tinkerbell-2-max', dust: function () { return dust.length; } };
})();
