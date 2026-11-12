# Deep — finding: home page overflows at 390 px on live production

**Date:** 12 November 2026
**From:** Deep
**To:** Claude (fix), Chas (cc), Si Aye (cc)
**Pin:** production `7d9ca91`, live at `www.resonatetarot.app`
**Severity:** Medium — cosmetic and on the first screen a seeker sees; a call-to-action is partly unreachable.
**Status:** Confirmed by render. ~~Suspected~~.

---

## What happens

At a **390 × 880** viewport the live home page overflows horizontally. Three elements are clipped at the right edge:

1. **The headline** — "Hear what resonates." is cut mid-word, ending at "resonat…"
2. **The body copy** — "Learn the cards, draw a reading, then follow the meanin…" is cut
3. **The "Learn the Cards" button** — roughly half of it is off-screen

The primary "Get a Reading" button is fine; the secondary action is not.

---

## Evidence

| Item | Value |
|---|---|
| Viewport | 390 × 880, `--force-device-scale-factor=1` |
| Rendered from | `https://www.resonatetarot.app/` |
| File | `shots/live-home-390.png` (261,370 bytes) |
| SHA-256 | `d8ebf17b6f4d757db5cc42835a8882f28123fee3628243d8027cfd7650577a17` |

**Control:** the same viewport rendered from the **local clone** (`file:///…/index.html`) produced a **byte-identical PNG** — same size, same SHA-256. So the local working copy and production agree at this width, and the defect is not a stale-local-build artefact. It also rules out a URL or caching difference, since the two renders came from different origins.

---

## Reproduce

```
chrome --headless=new --window-size=390,880 --force-device-scale-factor=1 \
       --hide-scrollbars --virtual-time-budget=8000 \
       --screenshot=out.png https://www.resonatetarot.app/
```

---

## What I am not claiming

**This is headless Chrome, not a real handset.** Two things could make a real phone behave differently:

- Chrome-desktop at a 390 px window is not device emulation. There is no touch emulation and no mobile viewport handling.
- If a web font failed to load before capture, a wider fallback face could cause clipping that would not occur with the real font.

I therefore cannot say "Samsung is broken". What I can say is that **a plain 390 px render of production overflows**, that the overflow is unambiguous (three independent elements, all clipped at the same edge), and that 390 px is the width of every iPhone from the 12 onward.

**Chas's Samsung at its own reported width is the definitive test**, and a capture at 360 and 412 would show whether this is a breakpoint gap or a fixed-width container.

---

## Likely causes, in order

1. A fixed `min-width` or `width` on the hero or the CTA row rather than a fluid one.
2. `white-space: nowrap` on the headline, which no `max-width` can fix.
3. A negative margin or `translateX` on the hero block that pushes it past the viewport.
4. `overflow-x: hidden` on the body — which would explain why the page does not scroll sideways but the content is still cut.

Item 4 is the one I would check first: if `overflow-x: hidden` is set, the bug is invisible in a scrollbar and only visible at a cut edge like this.

---

## Suggested acceptance test

At 360, 390 and 412: no element's right edge exceeds `document.documentElement.clientWidth`. One assertion, three widths, and it can live in the existing browser-test suite rather than being caught by eye next time.

— Deep
