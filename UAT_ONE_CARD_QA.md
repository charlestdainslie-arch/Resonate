# One-card v0.9.1 defect verification

Scope: complete 78-card draw pool; original plus at most two clarifiers, without repeating an identity in the reading; prominent positions and card titles; integrated original/clarifier narrative; responsive hero and matching actions; browser-local journal replay including dice; branded PDF download. Golden Filament animation remains Phase 2.

Based on develop/v1.0-base at 59c8e87. Existing branches and local changes are preserved. Main and release branches are not release targets for this work.

## Run

Unit checks require Node only:

    node --test tests/*.test.cjs

Browser checks require Playwright 1.62.1, pdf-lib 1.17.1 and installed Google Chrome. Install those development tools in your test environment, then run:

    node tests/browser-uat.cjs 1
    node tests/browser-uat.cjs 2
    node tests/browser-uat.cjs 3

Set UAT_OUTPUT_DIR to an evidence directory; the default is ignored test-results/. Each pass checks eight widths (320, 375, 390, 768, 1024, 1280, 1440, 1920), normal and reduced motion, eleven browser acceptance groups per configuration. It creates JSON results, screenshots and actual downloaded PDFs. A failed group stops that configuration; unexecuted checks are not passes.

The current integration suite adds origin-return and astrology checks for 19 browser acceptance groups per configuration, or 304 groups per full pass. It also runs 66 Node unit checks per pass. The historical counts below describe the earlier milestones, not the current integration result.

## Screenshot follow-up

The original and clarifier frames must match in width, height and top alignment within one CSS pixel, and titles must share font family, size, weight and line height. Exactly one save button sits below the bottom action group. No save button remains above or inside the journal. Saving without notes changes the bottom button to “✓ Saved to Journal”, with adjacent live confirmation. Original and clarifier artwork uses contain sizing so printed borders and titles remain visible. Failed storage must not display a success tick. After two clarifiers, help text must offer saving rather than another card.

The broader interpretation rewrite is deferred to the next sub-branch after this development/UAT work. This follow-up changes layout, action guidance and persistence feedback; a later bounded integration adds the optional calculated astrology prelude described below.

## Evidence boundaries

Desktop Chrome with responsive viewport emulation is not physical-device Safari testing. The journal remains browser-local and is not an authenticated cloud journal. Artwork and meanings come from the existing prepared 78-card project; identity and asset integrity are verified, not an independent editorial or licensing approval. Historical screenshots recovered from Vercel Deployment Audit establish the unequal landing-action defect. No animation sign-off or product-owner UAT acceptance is implied by automated passes.

PDFs include each original card, both clarifiers and their integrated narrative, whole-reading synthesis, dice, saved reading and card reflections, RESONATE branding, page numbering and copyright. Export runs locally. The embedded standard font supports Western text; unsupported glyphs are normalised or omitted.


## All-spread clipping sweep

The result has exactly one reading-reflection textarea, in the bottom journal panel after the action links, with its single Save Reading control. The earlier standalone reflection location is removed.

All five spreads are exercised at all eight widths in both motion preferences: face-down table, shuffle sample, draw/flip sample, settled originals, first clarifier, second clarifier, saved-journal reopen and actual PDF download. Five additional acceptance groups per configuration bring each browser pass to 256 groups. Larger spread layouts reflow to three columns below 1100px, two below 700px and one below 420px; position labels retain the reading order. Full-size desktop V/Celtic arrangements are retained. Clarifiers no longer overlap or rotate over the original cards. Artwork uses contain sizing with intact gold frames. The text-only PDF does not embed card artwork; verify text pagination and margins rather than artwork cropping there.

The sweep uses accelerated browser timers for the extra spread samples; the original one-card journey retains its real timing checks. Normal and reduced motion are both exercised. Physical-device testing remains outside this desktop Chrome emulation evidence.


## Banner and existing interpretive-lens restoration

The redundant landing-reading banner before YOUR READING is removed; actual drawn-card artwork and later imagery remain. The interpretation starts with its heading and uses a 12px top margin. Existing wuWei and psychological fields are rendered for every original and clarifier, without editing the stored copy. Jungian is the final lens for each card. Existing astrology and numerology fields sit before the meaning prose. Card detail also restores the missing Wu Wei panel, retaining Jungian at the end. An old higher-specificity even-card shuffle rule is overridden so every multi-card shuffle remains contained.

## Origin return and optional astrology integration

Card detail return controls restore the exact reading and scroll location from which the detail was opened. This includes spread, originals, clarifiers, dice, reading time and the astrology snapshot. Changing shared in-memory spread state while detail is open must not redirect Back or Next to a different reading. Learn returns to Learn.

The optional astrology profile sits before opening dice. A blank profile still produces a calculated session sky. Quick sign/year or optional timed birth details can add natal context. A nonexistent local birth time is rejected; a repeated clock time requires an explicit earlier/later choice. The example preview does not populate or change the actual profile or reading. Editing profile details requires Calculate my sky again and resets any previously rolled opening numbers. The calculated moment is fixed before dice and carried unchanged through every spread, two clarifiers, journal save/reopen and the PDF export. Astrology never changes the random draw pool or dice.

The journal and PDF attachment store a computed-only snapshot and calculation provenance. Raw birth date, local time, birth zone and birthplace coordinates remain in open-page memory and are excluded from that snapshot. Computed natal positions are still personal information. The PDF contains a readable astrology section and an attached `resonate-astrology-snapshot.json` for exact replay. Astrology uses Astronomy Engine for calculated geocentric positions, an approximate Lahiri offset for sidereal context, and the browser's historical IANA/Chinese-calendar data. It is symbolic context, not a predictive guarantee or a full Vedic birth chart. Oracle deck stages and the broader integrated interpretation remain for later work.
