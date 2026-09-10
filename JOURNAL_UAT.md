# Personal journal — 10 September 2026

- Save reading to journal retains the original reading timestamp, original time zone, spread definition, card order and position labels.
- Dates use the full weekday, day, written month, year and local time with zone. Reflection edits have a separate update timestamp.
- Reading reflections save as typed. Card-detail reflections are scoped to the reading and slot, including repeated sample cards.
- Journal entries offer editable reading reflections, per-card notes and Open saved reading. Reopened readings are settled and retain Next/Previous navigation.
- Existing card-study notes and bookmarks remain separate and untouched. No historical date is invented for them.
- Storage is local to the browser/origin; there is no account sync. Failed writes display an error rather than a saved confirmation.

## Validation

Browser tested on a separate local origin to avoid adding test entries to the user's journal:

1. Existing study note remains available.
2. Celtic Cross saved with reflection; repeated Save does not duplicate it.
3. Two slot reflections persist; a repeated card starts with its own empty note.
4. Refresh and reopen retain exact reading timestamp, all ten card/position labels and escaped reflection text.
5. Draw again creates a separate entry with its own reflection.
6. Editing an older entry preserves its original reading date.
7. Visual inspection confirms the existing black/gold design and full date presentation.

Four automated Node tests pass: editing/deduplication, separate draws, storage failure and full date formatting. Run `node --test tests/journal.test.cjs`.
