# SC-Q · interpretation evidence

**Case as written in the matrix:** (added 7 Nov) Seven-card question reading: position 4 read last.

**Differences / notes:** Approved by Chas on 7 Nov. Not one of the original 16; listed so the new behaviour has a row.

**App code:** `f321114def71f3c7239f5b498c610135d02516c8` (rendered from that code by `audit/tools/deep-handoff.cjs`, on presenter-uat.html at 412x915, reading time fixed at 2026-11-07T01:00:00.000Z).

## Acceptance criteria (for Deep to mark PASS / FAIL / BLOCKED with evidence)

- **orientation:** Each card is read with the meaning for its orientation (upright or reversed text from the card data below), and a reversed card is not merely the negation of its upright meaning.
- **position:** The position lens names this position and reads the card through the position’s defined meaning (see the table), without drifting in time or role.
- **neighbours:** The "wider spread" line relates the card to its pair partner (Celtic Cross) or neighbour (other spreads) without inventing a connection the data does not support.
- **clarifier1:** Clarifier 1 is read as modifying the original card ("how it modifies the original card"), naming both, not as a separate definition.
- **clarifier2:** Clarifier 2 develops the relationship between both earlier cards, naming all three.
- **synthesis:** "Together" is a synthesis of the cards, not a list; revisions are shown (Revision 1 kept readable when Clarifier 2 arrives; Revision 2 when the Clarity card arrives).
- **clarity:** Option B (approved 7 Nov): a Clarity card appears only when the original and both clarifiers are Major, is a Minor not already in the reading, and is read as grounding the three Major cards; a Minor original with two Major clarifiers gets none and the limit is stated.
- **max:** Max’s lines are the reading’s own words (quoted), in reading order; before Finish he invites and does not sign off; after Finish the closing comes once.
- **failure:** Deep’s six failure modes: templating, positional drift, reverse-as-opposite, parallel clarification, concatenation instead of synthesis, numerical/symbolic overreach.

## Sample B08 — Seven-card question reading: position 4, You / Answer, read last

- Spread: **Seven-card V Reading** (`seven`); 7 position(s). Question: Seven-card question reading flag ON (position 4 read last). The app records no question text.
- Base card IDs (position order): [24, 3, 58, 9, 46, 65, 31]; reversed IDs: [58].
- Clarifier sequence, in press order (position · layer = ID; layer 3 = Clarity card): 4·1=39. The app drew each with its own clarifyPosition(): first.

- Rule check (clarifier-rules.js validate): valid. Page errors: none. Written order of positions: 1, 2, 3, 5, 6, 7, 4.

### Draw record

| # | Position | Position meaning | Original | Clarifier 1 | Clarifier 2 | Clarity card | Neighbours |
|---|---|---|---|---|---|---|---|
| 1 | Past · 18–24 Months | your experiences and influences from approximately the previous 18 to 24 months | Three of Wands [ID 24, upright, Minor, Fire] | — | — | — | adjacent 2 · Present Time; the "wider spread" line names position 2 |
| 2 | Present Time | your present circumstances, including the period immediately surrounding today | The Empress [ID 3, upright, Major, Earth] | — | — | — | adjacent 1 · Past · 18–24 Months, 3 · Near Future · 3 Months; the "wider spread" line names position 3 |
| 3 | Near Future · 3 Months | what may develop over approximately the next three months if the present course continues | Nine of Swords [ID 58, reversed, Minor, Air] | — | — | — | adjacent 2 · Present Time, 4 · You / Answer; the "wider spread" line names position 4 |
| 4 | You / Answer | your current state in a general reading; for a specific question, this card gives the answer and is interpreted last | The Hermit [ID 9, upright, Major, Earth] | Four of Cups [ID 39, upright, Minor, Water] | — | — | adjacent 3 · Near Future · 3 Months, 5 · Surrounding Energies; the "wider spread" line names position 5 |
| 5 | Surrounding Energies | the people, home, work and other circumstances influencing you or the question at present | Page of Cups [ID 46, upright, Minor, Water] | — | — | — | adjacent 4 · You / Answer, 6 · Hopes, Fears & Attitude; the "wider spread" line names position 6 |
| 6 | Hopes, Fears & Attitude | the hopes, fears and attitude you bring to the situation or specific question | Two of Pentacles [ID 65, upright, Minor, Earth] | — | — | — | adjacent 5 · Surrounding Energies, 7 · Outcome · Next 18–24 Months; the "wider spread" line names position 7 |
| 7 | Outcome · Next 18–24 Months | the longer-term outcome of present circumstances over approximately the next 18 to 24 months; in a question reading, the likely outcome of that question | Ten of Wands [ID 31, upright, Minor, Fire] | — | — | — | adjacent 6 · Hopes, Fears & Attitude; the "wider spread" line names position 6 |

### Interpretation, per position (as the page shows it; revisions expanded)

#### 1 · Past · 18–24 Months

**Original card**
> Original Card · III · Three of Wands
>
> Past · 18–24 Months
>
> CARD CORRESPONDENCE
> Fire · Wands
> SKY AT THIS READING
> No planetary placement assigned
>
> Astrology: Fire · Wands · Fire
>
> Number: 3
>
> Three develops expression, growth and the effects of working together. In Three of Wands, consider how this relates to expansion.
>
> Expansion
> Foresight
> Cooperation
>
> Position: Past · 18–24 Months — Three of Wands. Looking across the previous 18 to 24 months, expansion, foresight, cooperation may show an experience or influence that helped shape the present situation.
>
> Early efforts are reaching beyond their starting point. Watch for feedback, coordinate with others and prepare for what growth will require rather than treating the first success as the whole journey.
>
> Looking closer: A figure watches ships from a height with three planted wands nearby.

#### 2 · Present Time

**Original card**
> Original Card · III · The Empress
>
> Present Time
>
> CARD CORRESPONDENCE
> Venus
> SKY AT THIS READING
> Venus is at 23° 51′ Libra
>
> Astrology: Venus · Earth
>
> Number: 3
>
> Three is emergence: a third point created from the relationship between two. It is expression, growth, creativity and the first sense of form becoming fertile.
>
> Abundance
> Sensual Pleasure
> Nurture
>
> Position: Present Time — The Empress. In the period immediately surrounding today, steady care that gives a relationship, project or part of yourself room to grow may describe what is active for you now.
>
> The Empress represents life that grows when it is nourished. Upright, she speaks to creativity, embodiment, pleasure, care and the practical conditions that allow something living to flourish. In a reading, this may describe a relationship, project, home, creative impulse or part of yourself asking for genuine nourishment. In a Past position it can show what helped something grow; in the Present, what needs care now; in the Future, growth that may become possible when the right conditions are tended.
>
> Looking closer: Notice the warm yellow landscape and the green growth around the seated figure. Creativity is supported by attention and balance; growth needs both space and care.

#### 3 · Near Future · 3 Months

**Original card**
> Original Card · IX · Nine of Swords, reversed
>
> Near Future · 3 Months
>
> CARD CORRESPONDENCE
> Air · Swords
> SKY AT THIS READING
> No planetary placement assigned
>
> Astrology: Air · Swords · Air
>
> Number: 9
>
> Nine draws experience toward maturity while asking what is still needed. In Nine of Swords, consider how this relates to worry.
>
> Support
> Easing Anxiety
> Hidden Distress
>
> Position: Near Future · 3 Months — Nine of Swords reversed. Over approximately the next three months, support, easing anxiety, hidden distress may show what develops if the present course continues; it is a direction, not a fixed prediction.
>
> A burden may be easing, or you may be hiding how difficult things feel. Reach for support and judge progress in manageable steps rather than expecting distress to disappear immediately.
>
> Looking closer: A figure sits upright in bed with hands over the face beneath nine swords.

#### 5 · Surrounding Energies

**Original card**
> Original Card · Pg · Page of Cups
>
> Surrounding Energies
>
> CARD CORRESPONDENCE
> Water · Cups
> SKY AT THIS READING
> No planetary placement assigned
>
> Astrology: Water · Cups · Water
>
> Court rank: Page
>
> Page is a court role, not a numbered pip card: a learner’s curiosity and an emerging practical relationship to the suit. It can describe an approach or quality in anyone, without prescribing age or gender.
>
> Sensitivity
> Creative Curiosity
> Emotional Discovery
>
> Position: Surrounding Energies — Page of Cups. In your surroundings, sensitivity, creative curiosity, emotional discovery may be expressed through people, home, work or other circumstances influencing the situation now.
>
> An unexpected feeling or creative idea deserves a curious response. Express it simply and listen with care; a tentative beginning does not need to become a promise before it has been understood.
>
> Looking closer: A young figure studies a fish emerging from a cup beside the sea.

#### 6 · Hopes, Fears & Attitude

**Original card**
> Original Card · II · Two of Pentacles
>
> Hopes, Fears & Attitude
>
> CARD CORRESPONDENCE
> Earth · Pentacles
> SKY AT THIS READING
> No planetary placement assigned
>
> Astrology: Earth · Pentacles · Earth
>
> Number: 2
>
> Two brings relationship, polarity and the need to consider another position. In Two of Pentacles, consider how this relates to adaptability.
>
> Adaptability
> Balance
> Priorities
>
> Position: Hopes, Fears & Attitude — Two of Pentacles. Adaptability, balance, priorities may colour your hopes, fears and attitude toward the situation or question.
>
> Several demands may need an adaptable rhythm. Keep the essentials visible and revise your priorities as circumstances change; balance can involve movement rather than holding everything perfectly still.
>
> Looking closer: A figure handles two pentacles linked by a loop while ships rise and fall on waves.

#### 7 · Outcome · Next 18–24 Months

**Original card**
> Original Card · X · Ten of Wands
>
> Outcome · Next 18–24 Months
>
> CARD CORRESPONDENCE
> Fire · Wands
> SKY AT THIS READING
> No planetary placement assigned
>
> Astrology: Fire · Wands · Fire
>
> Number: 10
>
> Ten completes a cycle and carries its consequences into another beginning. In Ten of Wands, consider how this relates to responsibility.
>
> Responsibility
> Burden
> Limits
>
> Position: Outcome · Next 18–24 Months — Ten of Wands. Across approximately the next 18 to 24 months, responsibility, burden, limits may describe the likely outcome if present circumstances continue, while leaving room for choice and change.
>
> A worthwhile commitment may have grown into an excessive load. Review what is truly yours, divide the work and protect the conditions that allow you to finish without losing yourself to the task.
>
> Looking closer: A figure carries ten wands that obscure the view of the town ahead.

#### 4 · You / Answer

**Original card**
> 1 · THE ORIGINAL CARD IN THIS POSITION
> Original Card · IX · The Hermit
>
> You / Answer
>
> CARD CORRESPONDENCE
> Virgo
> SKY AT THIS READING
> No planetary placement assigned
>
> Astrology: Virgo · Earth
>
> Number: 9
>
> Nine draws experience toward maturity while asking what is still needed. In The Hermit, consider how this relates to reflection.
>
> Reflection
> Discernment
> Inner Guidance
>
> Position: You / Answer — The Hermit. In a general reading, reflection, discernment, inner guidance may describe where you stand now. If you asked a specific question, return to this card last and consider what answer it suggests for you.
>
> Step back from competing voices long enough to recognise your own understanding. Solitude, study or a trusted guide can help you identify the next honest step without needing the whole path illuminated.
>
> Looking closer: A cloaked figure holds a lantern on a mountain. The small light offers enough illumination for the next step, rather than a complete map.

**Clarifier 1**
> 2 · CLARIFIER 1 · HOW IT MODIFIES THE ORIGINAL CARD
> Clarifier 1 · IV · Four of Cups
>
> A pause in interest may be asking you to examine what you actually want. Rest from automatic choices, while remaining willing to notice an offer that differs from your expectations.
>
> Astrology: Water · Cups · Water
>
> Number: 4
>
> Four creates structure and stability while asking how much flexibility it allows. In Four of Cups, consider how this relates to contemplation.
>
> Looking closer: A seated figure faces three cups while a fourth is offered from a cloud.
>
> Four of Cups supports The Hermit.
>
> In You / Answer, the theme of contemplation and reassessment can help reflection and discernment find a constructive outlet.
>
> Read this way because Earth and Water are friendly elements.
>
> As a Minor Arcana card, Four of Cups brings the Major theme down to a practical, everyday expression in feelings and relationships.

**Together (with any earlier revisions)**
> 3 · WHAT THEY MEAN TOGETHER
> Together in You / Answer
>
> Revision 1 · with Clarifier 1.
>
> Together, The Hermit and Four of Cups give You / Answer a consistent message: reflection and contemplation. Consider working with this theme with some confidence, while staying open to how it unfolds.
>
> In the wider Seven-card V Reading spread, You / Answer sits within the reading; its neighbour is Surrounding Energies, Page of Cups, which supports The Hermit (Earth and Water are friendly elements).
>
> This is a perspective for reflection, not a fixed prediction.
>
> How this was read: each relationship comes from the cards’ elements (using elemental dignities, a long-standing tarot convention), suits, numbers, orientation and Major or Minor status, from RESONATE’s card data. It is RESONATE’s interpretive method, not a quotation from a published source.

### Golden Thread (whole spread)

> THE GOLDEN THREAD
> Read the spread as a whole
>
> The Golden Thread follows 8 revealed cards across this reading, including every clarifier. One card came up reversed and is read through its reversed meaning.
>
> PAST · 18–24 MONTHS
> Three of Wands
>
> The foundation is expansion and foresight; clarifiers can deepen this interpretation.
>
> The astrological correspondences in dialogue are Three of Wands (Fire · Wands). These may suggest qualities in yourself, a situation, or another person's influence; they do not establish someone's zodiac sign.
>
> PRESENT TIME
> The Empress
>
> The foundation is abundance and sensual pleasure; clarifiers can deepen this interpretation.
>
> The astrological correspondences in dialogue are The Empress (Venus). These may suggest qualities in yourself, a situation, or another person's influence; they do not establish someone's zodiac sign.
>
> NEAR FUTURE · 3 MONTHS
> Nine of Swords, reversed
>
> The foundation is support and easing anxiety; clarifiers can deepen this interpretation.
>
> The astrological correspondences in dialogue are Nine of Swords, reversed (Air · Swords). These may suggest qualities in yourself, a situation, or another person's influence; they do not establish someone's zodiac sign.
>
> YOU / ANSWER
> The Hermit + Four of Cups
>
> The original The Hermit highlights reflection and discernment; Four of Cups introduces contemplation and reassessment. Consider whether these energies support one another or ask for balance.
>
> The astrological correspondences in dialogue are The Hermit (Virgo) meets Four of Cups (Water · Cups). These may suggest qualities in yourself, a situation, or another person's influence; they do not establish someone's zodiac sign.
>
> SURROUNDING ENERGIES
> Page of Cups
>
> The foundation is sensitivity and creative curiosity; clarifiers can deepen this interpretation.
>
> The astrological correspondences in dialogue are Page of Cups (Water · Cups). These may suggest qualities in yourself, a situation, or another person's influence; they do not establish someone's zodiac sign.
>
> HOPES, FEARS & ATTITUDE
> Two of Pentacles
>
> The foundation is adaptability and balance; clarifiers can deepen this interpretation.
>
> The astrological correspondences in dialogue are Two of Pentacles (Earth · Pentacles). These may suggest qualities in yourself, a situation, or another person's influence; they do not establish someone's zodiac sign.
>
> OUTCOME · NEXT 18–24 MONTHS
> Ten of Wands
>
> The foundation is responsibility and burden; clarifiers can deepen this interpretation.
>
> The astrological correspondences in dialogue are Ten of Wands (Fire · Wands). These may suggest qualities in yourself, a situation, or another person's influence; they do not establish someone's zodiac sign.
>
> FROM CARD TO CARD
>
> The reading begins with Three of Wands in Past · 18–24 Months and moves toward Ten of Wands in Outcome · Next 18–24 Months.
>
> Present Time · The Empress. Following Three of Wands, The Empress may draw your attention toward abundance.
>
> Near Future · 3 Months · Nine of Swords, reversed. Following The Empress, Nine of Swords may draw your attention toward support.
>
> You / Answer · The Hermit. Following Nine of Swords, The Hermit may draw your attention toward reflection.
>
> Surrounding Energies · Page of Cups. Following The Hermit, Page of Cups may draw your attention toward sensitivity.
>
> Hopes, Fears & Attitude · Two of Pentacles. Following Page of Cups, Two of Pentacles may draw your attention toward adaptability.
>
> Outcome · Next 18–24 Months · Ten of Wands. Following Two of Pentacles, Ten of Wands may draw your attention toward responsibility.
>
> The card-to-card movement is the heart of this reading: Three of Wands opens the question, and Ten of Wands shows where that pattern may be heading if the present choices continue.
>
> Keep the part that speaks to your lived situation, and use the cards as a prompt for reflection and choice.
>
> THE OVERALL INVITATION
>
> Across these cards, expansion, foresight, cooperation, abundance form the central pattern. Which part speaks to your present circumstances, and what choice might help you respond? This is a perspective, not a fixed prediction.
>
> Numbers through your reading
>
> Three of Wands (3) · The Empress (3) · Nine of Swords (9) · The Hermit (9) · Four of Cups (4) · Page of Cups (Page) · Two of Pentacles (2) · Ten of Wands (10). Their numbered cards sum to 40, reducing to 4. No opening dice were rolled for this reading.
>
> Repeated tarot numbers: 3, 9. Notice whether the cards express a shared theme through different suits.
>
> These numbers are symbolic prompts, not guarantees. Notice whether any patterns resonate with numbers personally meaningful to you.
>
> Take what resonates, and leave the rest.

### Max: narration when opened, before Finish reading (captions are these lines)

1. [intro · frame] Good evening. Max Chasroom here, a deliberately synthetic presenter, assembled from pixels and good intentions.
2. [intro · label] Tonight: your Seven-card V Reading.
3. [intro · frame] I'll keep it short. The full reading stays below.
4. [cards · frame] Let's go through your cards, one position at a time.
5. [cards · label] Past · 18–24 Months: Three of Wands.
6. [cards · quote] Looking across the previous 18 to 24 months, expansion, foresight, cooperation may show an experience or influence that helped shape the present situation.
7. [cards · quote] Early efforts are reaching beyond their starting point.
8. [cards · label] Present Time: The Empress.
9. [cards · quote] In the period immediately surrounding today, steady care that gives a relationship, project or part of yourself room to grow may describe what is active for you now.
10. [cards · quote] The Empress represents life that grows when it is nourished.
11. [cards · label] Near Future · 3 Months: Nine of Swords, reversed.
12. [cards · quote] Over approximately the next three months, support, easing anxiety, hidden distress may show what develops if the present course continues; it is a direction, not a fixed prediction.
13. [cards · quote] A burden may be easing, or you may be hiding how difficult things feel.
14. [cards · label] Surrounding Energies: Page of Cups.
15. [cards · quote] In your surroundings, sensitivity, creative curiosity, emotional discovery may be expressed through people, home, work or other circumstances influencing the situation now.
16. [cards · quote] An unexpected feeling or creative idea deserves a curious response.
17. [cards · label] Hopes, Fears & Attitude: Two of Pentacles.
18. [cards · quote] Adaptability, balance, priorities may colour your hopes, fears and attitude toward the situation or question.
19. [cards · quote] Several demands may need an adaptable rhythm.
20. [cards · label] Outcome · Next 18–24 Months: Ten of Wands.
21. [cards · quote] Across approximately the next 18 to 24 months, responsibility, burden, limits may describe the likely outcome if present circumstances continue, while leaving room for choice and change.
22. [cards · quote] A worthwhile commitment may have grown into an excessive load.
23. [cards · label] You / Answer: The Hermit.
24. [cards · quote] In a general reading, reflection, discernment, inner guidance may describe where you stand now.
25. [cards · quote] Step back from competing voices long enough to recognise your own understanding.
26. [c1 · frame] Now, your first clarifiers, card by card.
27. [c1 · label] Clarifier 1 · You / Answer: Four of Cups.
28. [c1 · quote] A pause in interest may be asking you to examine what you actually want.
29. [c1 · quote] Four of Cups supports The Hermit.
30. [c1 · quote] In You / Answer, the theme of contemplation and reassessment can help reflection and discernment find a constructive outlet.
31. [c1 · quote] Together, The Hermit and Four of Cups give You / Answer a consistent message: reflection and contemplation.
32. [c1 · quote] Consider working with this theme with some confidence, while staying open to how it unfolds.
33. [c1 · quote] In the wider Seven-card V Reading spread, You / Answer sits within the reading; its neighbour is Surrounding Energies, Page of Cups, which supports The Hermit (Earth and Water are friendly elements).
34. [invite · frame] That's your reading so far.
35. [invite · frame] If a card calls for more, choose it below and tap Clarify. When you have finished, tap Finish reading.

### Max: narration after Finish reading

1. [intro · frame] Good evening. Max Chasroom here, a deliberately synthetic presenter, assembled from pixels and good intentions.
2. [intro · label] Tonight: your Seven-card V Reading.
3. [intro · frame] I'll keep it short. The full reading stays below.
4. [cards · frame] Let's go through your cards, one position at a time.
5. [cards · label] Past · 18–24 Months: Three of Wands.
6. [cards · quote] Looking across the previous 18 to 24 months, expansion, foresight, cooperation may show an experience or influence that helped shape the present situation.
7. [cards · quote] Early efforts are reaching beyond their starting point.
8. [cards · label] Present Time: The Empress.
9. [cards · quote] In the period immediately surrounding today, steady care that gives a relationship, project or part of yourself room to grow may describe what is active for you now.
10. [cards · quote] The Empress represents life that grows when it is nourished.
11. [cards · label] Near Future · 3 Months: Nine of Swords, reversed.
12. [cards · quote] Over approximately the next three months, support, easing anxiety, hidden distress may show what develops if the present course continues; it is a direction, not a fixed prediction.
13. [cards · quote] A burden may be easing, or you may be hiding how difficult things feel.
14. [cards · label] Surrounding Energies: Page of Cups.
15. [cards · quote] In your surroundings, sensitivity, creative curiosity, emotional discovery may be expressed through people, home, work or other circumstances influencing the situation now.
16. [cards · quote] An unexpected feeling or creative idea deserves a curious response.
17. [cards · label] Hopes, Fears & Attitude: Two of Pentacles.
18. [cards · quote] Adaptability, balance, priorities may colour your hopes, fears and attitude toward the situation or question.
19. [cards · quote] Several demands may need an adaptable rhythm.
20. [cards · label] Outcome · Next 18–24 Months: Ten of Wands.
21. [cards · quote] Across approximately the next 18 to 24 months, responsibility, burden, limits may describe the likely outcome if present circumstances continue, while leaving room for choice and change.
22. [cards · quote] A worthwhile commitment may have grown into an excessive load.
23. [cards · label] You / Answer: The Hermit.
24. [cards · quote] In a general reading, reflection, discernment, inner guidance may describe where you stand now.
25. [cards · quote] Step back from competing voices long enough to recognise your own understanding.
26. [c1 · frame] Now, your first clarifiers, card by card.
27. [c1 · label] Clarifier 1 · You / Answer: Four of Cups.
28. [c1 · quote] A pause in interest may be asking you to examine what you actually want.
29. [c1 · quote] Four of Cups supports The Hermit.
30. [c1 · quote] In You / Answer, the theme of contemplation and reassessment can help reflection and discernment find a constructive outlet.
31. [c1 · quote] Together, The Hermit and Four of Cups give You / Answer a consistent message: reflection and contemplation.
32. [c1 · quote] Consider working with this theme with some confidence, while staying open to how it unfolds.
33. [c1 · quote] In the wider Seven-card V Reading spread, You / Answer sits within the reading; its neighbour is Surrounding Energies, Page of Cups, which supports The Hermit (Earth and Water are friendly elements).
34. [final · frame] Here is your whole spread, brought together.
35. [final · quote] Across these cards, expansion, foresight, cooperation, abundance form the central pattern.
36. [close · frame] Before I go, one question to carry with you.
37. [close · quote] Which part speaks to your present circumstances, and what choice might help you respond? This is a perspective, not a fixed prediction.
38. [close · quote] Take what resonates, and leave the rest.
39. [close · frame] That's the short version. Every word of the full reading is below, and in your PDF. Max Chasroom, signing off.

Clarifying inside Max narrates the same lines for the new card (its chapter, for that position) followed by the invitation; they are a subset of the script above (tests/max-lifecycle.browser.cjs).

### Card data each card was read from (data.js; provenance OPEN, see audit/sources/DATASET_NOTES.md)

- **Three of Wands** (ID 24; Minor, Wands; number 3, Three; element Fire; astrology Fire · Wands)
  - Upright keywords: Expansion, Foresight, Cooperation. Upright: Early efforts are reaching beyond their starting point. Watch for feedback, coordinate with others and prepare for what growth will require rather than treating the first success as the whole journey.
  - Reversed keywords: Delays, Limited Reach, Poor Preparation. Reversed: Expansion may be delayed by missing support or an untested assumption. Review your preparation and adjust the scale before committing more energy.
- **The Empress** (ID 3; Major; number 3; element Earth; astrology Venus)
  - Upright keywords: Abundance, Sensual Pleasure, Nurture. Upright: The Empress represents life that grows when it is nourished. Upright, she speaks to creativity, embodiment, pleasure, care and the practical conditions that allow something living to flourish. In a reading, this may describe a relationship, project, home, creative impulse or part of yourself asking for genuine nourishment. In a Past position it can show what helped something grow; in the Present, what needs care now; in the Future, growth that may become possible when the right conditions are tended.
  - Reversed keywords: Depletion, Overgiving, Creative Block. Reversed: Reversed, nurturing can become depletion, control or neglect of the self. Creative energy may feel blocked because the environment around it is underfed. Restoration begins with attention to what actually sustains life. The surrounding cards may show whether this is about overgiving to others, neglecting your own needs, or allowing something to rest before expecting it to produce again.
- **Nine of Swords** (ID 58; Minor, Swords; number 9, Nine; element Air; astrology Air · Swords)
  - Upright keywords: Worry, Rumination, Distress. Upright: Worry may be growing in isolation or repeating through the night. Bring the concern into daylight with someone trustworthy, distinguish evidence from feared outcomes and attend to what would support rest.
  - Reversed keywords: Support, Easing Anxiety, Hidden Distress. Reversed: A burden may be easing, or you may be hiding how difficult things feel. Reach for support and judge progress in manageable steps rather than expecting distress to disappear immediately.
- **The Hermit** (ID 9; Major; number 9; element Earth; astrology Virgo)
  - Upright keywords: Reflection, Discernment, Inner Guidance. Upright: Step back from competing voices long enough to recognise your own understanding. Solitude, study or a trusted guide can help you identify the next honest step without needing the whole path illuminated.
  - Reversed keywords: Isolation, Withdrawal, Avoidance. Reversed: Reflection may have become a way to postpone contact or action. Ask whether solitude is restoring your perspective or protecting you from the conversation you need to have.
- **Page of Cups** (ID 46; Minor, Cups; number —, Page; element Water; astrology Water · Cups)
  - Upright keywords: Sensitivity, Creative Curiosity, Emotional Discovery. Upright: An unexpected feeling or creative idea deserves a curious response. Express it simply and listen with care; a tentative beginning does not need to become a promise before it has been understood.
  - Reversed keywords: Emotional Immaturity, Blocked Expression, Self-Doubt. Reversed: Sensitivity may be mixed with fear of embarrassment or an expectation that others should guess your feelings. Find a direct, manageable way to communicate what you mean.
- **Two of Pentacles** (ID 65; Minor, Pentacles; number 2, Two; element Earth; astrology Earth · Pentacles)
  - Upright keywords: Adaptability, Balance, Priorities. Upright: Several demands may need an adaptable rhythm. Keep the essentials visible and revise your priorities as circumstances change; balance can involve movement rather than holding everything perfectly still.
  - Reversed keywords: Overcommitment, Disorganisation, Strain. Reversed: Too many demands may be exceeding your capacity. Simplify commitments and choose what can wait rather than relying on constant adjustment to make an impossible load sustainable.
- **Ten of Wands** (ID 31; Minor, Wands; number 10, Ten; element Fire; astrology Fire · Wands)
  - Upright keywords: Responsibility, Burden, Limits. Upright: A worthwhile commitment may have grown into an excessive load. Review what is truly yours, divide the work and protect the conditions that allow you to finish without losing yourself to the task.
  - Reversed keywords: Release, Delegation, Overload. Reversed: You may be ready to put down a burden or struggling to admit it is too much. Seek a practical redistribution rather than waiting for endurance to solve the imbalance.
- **Four of Cups** (ID 39; Minor, Cups; number 4, Four; element Water; astrology Water · Cups)
  - Upright keywords: Contemplation, Reassessment, Disengagement. Upright: A pause in interest may be asking you to examine what you actually want. Rest from automatic choices, while remaining willing to notice an offer that differs from your expectations.
  - Reversed keywords: Renewed Interest, Withdrawal, Missed Opening. Reversed: Interest may be returning, or withdrawal may be keeping a useful opening out of view. Re-engage gradually and test what feels nourishing rather than forcing enthusiasm.

