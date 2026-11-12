# Motion lifecycle correction — UAT only

Based on Deep's v1.0.1 source supplied through Chas; corrected by Si Aye. Parent: fc7dc6f (Claude's all-spread layout candidate). This is a decoration module, not the animated-hand or reel-motion deliverable.

## Files and opt-in preview
`motion-uat.html` loads the actual app plus `resonate-motion.js`, `resonate-motion.css` and `motion-wire.js`. Production `index.html`, card data, reveal timing, reading logic, Journal and all existing styles remain unchanged. Open the deployed branch URL with `/motion-uat.html` for integration testing. Merely deploying is not acceptance.

The module observes the app's existing card class transitions. It owns only decorative nodes and rm-host/rm-shimmer classes it added. It never chooses cards or changes positions, app reveal classes or app draw timers. CSS adds a positioned containing block only under rm-host; existing more-specific spread positioning must be verified in browser. Shimmer is a temporary brightness animation; test compositing with real flips before acceptance.

## Corrected lifecycle
- No frame is rescheduled after completion/cancellation; normalised SVG pathLength avoids assumed physical path length.
- Every reveal cancels prior frames, observers, timers, particles, shimmer and reveal abort listener.
- Mount signal permanently destroys the instance. Per-reveal signal cancels only the current reveal; the instance can be reused. No contradictory internal abort-controller state.
- Media listener belongs to one mount and is removed on destroy. A live preference change cancels all decorations and renders a still; it does not automatically replay a reading.
- Existing settled cards do not spark or replay filament on reopening.
- Particles expire naturally and all remaining resources are cleared on cancel/destroy.
- Adapter initially scans, mounts only an actual draw-stage board (not shuffled face-down staging), observes board replacement, disconnects on dispose/pagehide and restores on pageshow. No interval or global function wrappers.

## Executed evidence
- `node --check resonate-motion.js` and `node --check motion-wire.js`: PASS.
- Original 70 Node tests: PASS before adding lifecycle tests.
- `node --test tests/motion-lifecycle.test.cjs`: 10/10 PASS. Deterministic fake DOM/resource harness tests reveal identity, mount abort, reveal abort + restart, repeated reveal/signal detach, settled no-replay, natural particle cleanup, frame completion, live reduced motion, invalid/pre-aborted mount, idempotent disposal/class ownership.
- Harness is NOT browser, CSS, native MutationObserver or real device proof.
- Browser runtime installation attempted: Chromium download produced invalid ZIP archives; real browser suite NOT RUN here. Do not treat syntax/unit checks as visual acceptance.

## Required independent checks
Run `tests/motion.browser.cjs` with Playwright available and optionally MOTION_BASE_URL set to the deployed preview origin. Check all five actual spread layouts, normal/reduced motion, correct card identities, no cropping introduced, primary controls/touch/focus unaffected, clarifier overlaps and save/reopen parity. Confirm repeated navigation cancels effects and pagehide/pageshow restore works. Run real Android/TalkBack and phone performance separately. Record exact tested SHA/deployment.

## Still outstanding
Animated realistic hand, hand-fingertip origin, landing-to-reading golden-filament choreography, true reel/pokie motion and any external generated asset. No OpenArt access, generation, spend or licence claim. Accounts/paywall and missing interpretation work remain separate requirements. No integration approval or public release implied. Claude/independent peer reviews Si Aye's corrections under issue29 before combined integration.
