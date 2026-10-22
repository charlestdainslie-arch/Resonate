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

## Screenshot follow-up

The original and clarifier frames must match in width, height and top alignment within one CSS pixel, and titles must share font family, size, weight and line height. Saving without notes must change the clicked primary action and the journal save button to “✓ Saved to Journal”, with adjacent live confirmation. Failed storage must not display a success tick. After two clarifiers, help text must offer saving rather than another card.

Interpretation content is explicitly deferred to the next sub-branch after this development/UAT work. This follow-up changes layout, action guidance and persistence feedback only.

## Evidence boundaries

Desktop Chrome with responsive viewport emulation is not physical-device Safari testing. The journal remains browser-local and is not an authenticated cloud journal. Artwork and meanings come from the existing prepared 78-card project; identity and asset integrity are verified, not an independent editorial or licensing approval. Historical screenshots recovered from Vercel Deployment Audit establish the unequal landing-action defect. No animation sign-off or product-owner UAT acceptance is implied by automated passes.

PDFs include each original card, both clarifiers and their integrated narrative, whole-reading synthesis, dice, saved reading and card reflections, RESONATE branding, page numbering and copyright. Export runs locally. The embedded standard font supports Western text; unsupported glyphs are normalised or omitted.
