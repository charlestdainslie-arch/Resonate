RESONATE Tarot Explorer — Development Tranche v0.10.2

This branch extends v0.10.1 (second-deck clarifiers), not the production baseline.

Current development implementation
- 78 Rider–Waite–Smith tarot cards: 22 Major Arcana, 56 Minor Arcana.
- Existing richly authored Fool–Emperor material remains unchanged.
- The remaining 73 cards have distinct upright/reversed topics, card-symbol imagery,
  Jungian reflection, Taoist / Wu Wei, Wabi-sabi, numerology, and journal prompts.
- Learning includes search, element filters and new Major/Wands/Cups/Swords/Pentacles filters.
- The dedicated one-, three-, five-, seven- and ten-position reading layouts use
  all 78 cards with no re-use inside a single spread.
- The separately shuffled clarifier deck also has 78 cards, so a card may legitimately
  appear in both the reading and its clarification.
- Card imagery: public-domain 1909/1910 Rider–Waite–Smith artwork by Pamela Colman Smith,
  sourced from Wikimedia Commons (TaionWC Pam-A image set). Images are loaded by URL;
  offline availability and hotlink behaviour remain to be tested.

Original proof-of-concept notes
- The original first release had five Major Arcana cards only.
- The original READING_STAGE_UAT.md and SPREAD_POSITIONS_UAT.md refer to that older
  test configuration. They are preserved as development history.

Limitations / follow-ups
- In-app image loading and responsive layout require browser UAT before release.
- 73 added cards use shorter editorial descriptions than the original five;
  content expansion and manual editorial review are future work.
- Second-deck clarifiers remain capped at two per position, with no oracle deck option,
  reversal mechanics, or animated physical hands yet.
- The Golden Thread is rule-based and reflective, not an AI synthesis engine.
- No cloud user accounts; journal remains browser-local.
- No live Vercel preview has been deployed from this branch.

Release safety
This is a stacked development branch based on dev/clarifier-layers-v0.10.1.
Neither main nor the stable production release is changed.
