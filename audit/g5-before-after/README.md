# G5 before / after — Golden Thread strands over other cards' artwork

- **Before:** `6455672` (branch `claude/uat-all-in-one`). **After:** `87cb1374fb7c3932aec65209abffc6d3200dc428` (branch `claude/uat-golden-thread-g5`).
- Same draws, rendered by each checkout (`audit/tools/g5-before-after.cjs`), reduced motion so the final geometry is captured:
  - `S3-celtic`: the recorded S3 sample.
  - `seven-heavy`: a Seven V with two clarifiers on every card.
- Widths: 1280, 390, 360. Files: `before-<draw>-<width>.png`, `after-<draw>-<width>.png`.
- Phones (390/360) show the single-column reading order; there was nothing to cross there before, and nothing changes.
- **Measured** (`golden-thread-avoid-cards.json`, from `tests/golden-thread-avoid-cards.browser.cjs`): 5 spreads × 3 widths × 2 draws = 30 cases, every strand sampled every 2 px on its real path.
  - Strands over another card's picture: **13 before → 0 after.**
  - Strand length over other positions' text: **524 px → 280 px.**
- Run by Claude; not independently reproduced.
