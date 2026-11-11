# Deep — Golden Thread hook: tidy-up patch

**Date:** 11 November 2026
**From:** Deep
**To:** Claude (apply), Chas (cc), Si Aye (cc)
**Re:** Chas's open item 2 — "Deep's tidy-up of how the light hooks into the app (nothing you'd see)"
**Pin:** `c4e8bf6`. `app.js` 713 lines, `golden-thread-kiss.js` 670 lines.
**Status:** Patch proposal. I cannot write to the clone, so Claude applies. Intended behaviour change: **none**.

---

## 1. What is wrong today

`golden-thread-kiss.js` hijacks two globals at lines 331–376:

```js
var baseShell = shell;
window.shell = function () { …; return baseShell.apply(this, arguments); };

var baseRenderDraw = renderDraw;
window.renderDraw = function () { var dealing = !state.drawSettled; var result = baseRenderDraw.apply(this, arguments); … };
```

It works — for function declarations in classic scripts, the global binding and the `window` property are the same thing, so app.js's internal calls do route through the wrapper. But it is fragile in six ways:

| # | Problem | Consequence |
|---|---|---|
| 1 | **Silent no-op on load order.** Line 17 returns early if `renderDraw`/`shell` are not yet functions. | A script-order change or a cache oddity turns the light off with no error anywhere. |
| 2 | **No idempotency guard.** | Loading the file twice wraps twice: two lights, or a wrapper that calls itself. |
| 3 | **No teardown.** `baseShell`/`baseRenderDraw` are captured and never restored. | The light cannot be unmounted — which matters for the Samsung test and for any future "light off" preference. |
| 4 | **Invisible coupling.** Nothing in `app.js` mentions the light. | Reading `renderDraw` tells you nothing about what observes it. |
| 5 | **Untestable seam.** | No way to assert that the draw path notifies observers. |
| 6 | **Return-value coupling.** The wrapper must forward `result`. | Any future change to `renderDraw`'s return breaks the wrapper silently. |

---

## 2. The seam

`app.js` announces; the kiss listens. One direction, one name, no globals reassigned.

Two events, both on `document`:

| Event | When | Detail |
|---|---|---|
| `resonate:shell` | first line of `shell()`, before the DOM is replaced | `{}` |
| `resonate:draw-rendered` | last line of `renderDraw()`, after the DOM is built and bound | `{ dealing }` |

`dealing` is captured at the **top** of `renderDraw()` and carried in the event, because the kiss needs the pre-render value. The event is the contract; the payload is explicit.

---

## 3. Patch 1 — `app.js`, three edits

**3a. Add the notifier.** Place it immediately above `function shell(` (line 149). It must never throw into a render.

```js
// One explicit seam for observers of the draw page (the Golden Thread light listens).
// app.js does not know who listens, and a failing listener must not break a render.
function notify(name, detail) {
  try {
    if (typeof CustomEvent === 'function') {
      document.dispatchEvent(new CustomEvent(name, { detail: detail || {} }));
    }
  } catch (err) {
    if (window.console) console.warn('notify', name, err);
  }
}
```

**3b. Announce the shell.** Line 149, one line added at the top of the body:

```js
function shell(content, cls='') {
  notify('resonate:shell');
  app.innerHTML = `…`;      // unchanged
  bindGlobal();             // unchanged
}
```

**3c. Announce the render.** At line 641 add the capture; at line 663 add the notify. `renderDraw()` has **no early returns** (single path, 640→664), so one notify at the end is sufficient — I checked.

```js
function renderDraw(){
  const dealing = !state.drawSettled;          // ← add: captured before the render mutates it
  const labels=positionLabels();
  …                                            // unchanged
  if(backToReading)backToReading.onclick=…;    // unchanged
  notify('resonate:draw-rendered', { dealing });  // ← add
}
```

---

## 4. Patch 2 — `golden-thread-kiss.js`

**4a. Delete** lines 331–376 (both wrappers, including `baseShell` and `baseRenderDraw`).

**4b. Delete** line 17's guard `if (typeof renderDraw !== 'function' || typeof shell !== 'function') return;` — with listeners it is unnecessary and it is the silent-failure path.

**4c. Insert** in place of the wrappers. The body is the existing wrapper body, with `dealing` taken from the event instead of recomputed:

```js
// ---- The seam: listen, never wrap (Deep tidy-up, 11 Nov 2026) ----
function onShell() {
  token++;
  if (light) { light.visible = false; light.alpha = 0; }
  if (routeObserver) { routeObserver.disconnect(); routeObserver = null; }
  dealingNow = false;
}

function onDrawRendered(e) {
  var dealing = !!(e.detail && e.detail.dealing);
  var mine = token;                       // read here, after shell() has bumped it — see §5
  var b = board();
  if (!b) return;

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
  var again = dealing && state.drawnAt && shownAt[state.drawnAt];
  if (dealing && state.drawnAt) shownAt[state.drawnAt] = true;
  if (reduced() || again) {
    if (dealing) {
      Array.prototype.slice.call(b.querySelectorAll('.reading-card')).forEach(function (c) { c.classList.remove('is-facedown'); c.classList.add('revealed'); });
      settleDraw();
    }
    return;
  }
  requestAnimationFrame(function () { requestAnimationFrame(function () {
    if (mine === token && (dealing || fresh.length)) run(b, dealing, fresh, mine);
  }); });
}

document.addEventListener('resonate:shell', onShell);
document.addEventListener('resonate:draw-rendered', onDrawRendered);
```

**4d. Add the mount guard and a real teardown.** Replace line 669:

```js
function destroy() {
  document.removeEventListener('resonate:shell', onShell);
  document.removeEventListener('resonate:draw-rendered', onDrawRendered);
  if (raf) { cancelAnimationFrame(raf); raf = 0; }
  if (routeObserver) { routeObserver.disconnect(); routeObserver = null; }
  if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
  canvas = null; ctx = null; light = null; dust.length = 0; blooms.length = 0;
  token++;
  delete window.ResonateKiss;
}

if (!window.ResonateKiss) {
  window.ResonateKiss = {
    version: 'tinkerbell-6-seam',
    dust: function () { return dust.length; },
    destroy: destroy
  };
}
```

---

## 5. The subtlety that must not be lost

The old wrapper read `var mine = token` **after** calling `baseRenderDraw`, not before. That is not accidental: `renderDraw()` calls `shell()` at line 643, and `shell()` increments `token`. So the wrapper had to capture `token` **after** the render to get the post-bump value.

The listener design preserves this for free — `resonate:shell` fires during the render, then `resonate:draw-rendered` fires at the end, so `token` read inside `onDrawRendered` is already the post-bump value. **Do not "simplify" by moving `var mine = token` above the body.** If it moves, the scheduled `run()` compares against a stale token and the light silently stops starting on a fresh draw. This is the one place where a tidy-up could introduce a real bug.

---

## 6. Cache version

Both pages load `golden-thread-kiss.js?v=15`. Bump to `?v=16` in `index.html:49` and `presenter-uat.html:57`, and the CSS to `?v=16`. Otherwise a browser with the old wrapper cached can run **both** the wrapper and the new listener for one session — two lights, or a double `token++` per draw.

---

## 7. Test to add

Following the existing `vm` pattern in `tests/additional-clarifiers.test.cjs`, a no-browser test can prove the seam exists:

`tests/draw-notify.test.cjs`
1. Load `app.js` source into a `vm` context with the minimal stubs that file needs (as the existing clarifier test does).
2. Replace `document.dispatchEvent` with a recorder.
3. Call `shell('x', '')` — assert exactly one `resonate:shell` event.
4. Call the draw path with `state.drawSettled = false` — assert one `resonate:draw-rendered` with `detail.dealing === true`; then with `drawSettled = true` — assert `false`.

That test is what stops problem #1 (silent no-op) from ever coming back.

---

## 8. What this does not change

- No visual change. No timing change. No change to when the light runs.
- The kiss still starts on a double `requestAnimationFrame`, still respects `reduced()` and the replay-once rule, still diff-diffs clarifiers the same way.
- `window.__gtKiss` is replaced by `window.ResonateKiss`; if any test or debug tool reads `__gtKiss`, update it.

The value is that the light becomes removable and testable, and `app.js` now states in one line that observers exist.

— Deep
