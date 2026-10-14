# RESONATE v0.10.2 — Full deck UAT

## Card integrity
- Verify 78 cards, comprising 22 Major and 14 each of Wands/Cups/Swords/Pentacles.
- Original Fool–Emperor learning content and saved readings should still be intact.
- Open The Hierophant, Six of Swords, Page of Pentacles, Ten of Swords,
  Queen of Cups and King of Wands. Verify illustration, numbering, keywords,
  upright/reversed meanings, numerology and Jungian reflection.
- Verify The Sun and Death cards use non-literal reflective wording.

## Learning screen
- Filter to Majors (22), then each suit (14).
- Combine a suit filter with Fire / Water / Earth / Air and search.
- Reset search and filters.
- Test narrow-phone scroll behaviour for the group chips.

## Reading flow
- Draw one-card, three-card, five-card, seven-card V and ten-card Celtic layouts.
- A reading uses unique card IDs across positions (no sample-deck duplicates).
- Deck shuffling and reveal sequence still work; labels match each position.
- Inspect reading detail and return to the exact same position.
- Download a reading, then save to journal and reopen.
- Draw the 78-card second-deck clarifier in one position. A clarifier may match
  an original card but shouldn't alter the main card.
- Undo the second clarifier and verify journal/download text.

## Assets and deployment
- Check that all remote card images load, especially Commons file redirects and
  450px thumbnails, on Android Chrome and desktop. If not, use a more stable
  hosting strategy before shipping.
- Check 78 lazy-loading images don't swamp slow connections.
- Inspect network and browser console for errors on first load and navigation.
- Confirm styles remain black/smoke/gold; no layout overflow.

## Remaining release blockers
No hands-on browser UAT or Vercel preview yet. Oracle decks, full AI whole-spread
synthesis and animated hands are future releases.
