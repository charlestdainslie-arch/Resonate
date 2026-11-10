# RESONATE — Deep: Deliverable B, Research Plan

**Date:** 10 November 2026
**From:** Deep (independent interpretation and research QA)
**To:** Si Aye (coordination), Chas (final authority), Claude (cc)
**Authority:** Si Aye's update of 10 November, recording Chas's three approvals — clarifier freedom, editorial review before rewriting Max's vocabulary, and the B → C → D order.
**Status:** Plan only. No findings asserted as final. No production code, merge, deploy or spend.

---

## 0. What this document is

A plan for how I will do the research, not the research itself. It fixes the sources, the grading rules, the order and the outputs, so that C and D can be judged against something declared in advance rather than improvised.

Three principles govern everything below:

1. **Every interpretive claim carries a source and a confidence level.** Nothing enters C or D unsourced.
2. **Established tradition is kept separate from modern accretion and from my own reading.** Where the boundary is genuinely contested, I say so rather than pick a side silently.
3. **The reading serves the seeker's freedom.** No fatalism, no diagnosis, no unsupported certainty, no flattery dressed as insight.

---

## 1. How sources will be graded

Each claim in C and D will be tagged:

| Grade | Meaning | Examples |
|---|---|---|
| **A** | Primary text within a named tradition | Waite, *The Pictorial Key to the Tarot* (1910); Golden Dawn *Book T*; Crowley, *The Book of Thoth* |
| **B** | Substantial secondary work by a recognised practitioner-scholar | Pollack, *Seventy-Eight Degrees of Wisdom*; Nichols, *Jung and Tarot*; Greer; von Franz |
| **C** | Contemporary practitioner consensus, no single authority | Widely-circulated modern meanings |
| **D** | Popular or undifferentiated sourcing | Blogs, listicles, unattributed summary sites |
| **X** | Unsourced assertion or my own inference | Flagged explicitly, never presented as tradition |

**Rule:** A and B may be stated as tradition. C must be marked as current practice rather than tradition. D is used only to identify what a seeker is likely to have encountered elsewhere — never as authority. X is always labelled.

This matters because much of what circulates as "the traditional meaning" is twentieth-century accretion, and RESONATE should know which of its own claims are which.

---

## 2. Part one — Mel's Double Pisces Tarot

### 2.1 What I can and cannot do, stated plainly

I cannot watch or listen to video. I attempted to retrieve the channel's video list directly; the fetch returned no usable titles. **I will not therefore invent episode references or timestamps.** A fabricated citation would be worse than an absent one, and I would rather say this now than pad the plan.

Two routes that work:

- **Chas supplies 3–5 episode URLs.** If a transcript or caption track is retrievable for those specific videos, I can work from it. I will say clearly which parts come from the transcript and which are my inference from what is described.
- **Chas (or a session with video access) watches with the observation sheet below.** That captures exactly what C needs, in a form I can analyse. This is the more reliable route, and it keeps Chas's judgement in the loop where the handover says it belongs.

### 2.2 Which readings are worth studying

Not the best-loved ones — the most *diagnostic* ones. For each, prefer:

1. A reading where **two or more difficult cards** appear (The Tower, Three of Swords, Ten of Swords, Death, The Devil, Five of Swords, Nine of Swords). These are where RESONATE's current templates fail hardest, and where her reframing technique is most visible.
2. A reading with **prominent Major Arcana**, to see how she gives a Major weight without melodrama.
3. A **low-drama or "flat" reading** — no Majors, ordinary Minors. This is the most under-studied case and the one that reveals whether she has a voice or only a subject. Most readers are interesting only when the cards are dramatic.
4. At least one reading where she **names a transition** between two neighbouring cards, so the technique can be inspected rather than inferred.

### 2.3 Observation sheet — what to capture

Per episode: `episode | date | cards in order | positions/spread | timestamps of interest`.

Per timestamp, capture:

| Field | What to record |
|---|---|
| Cards active | Which card(s) she is speaking about |
| Move | Naming, connecting, reframing, qualifying, grounding, redirecting, closing |
| Wording spine | One short phrase, not a transcription — enough to identify the move |
| Uncertainty language | Where she hedges, and how ("this may", "I'm hearing", "the cards suggest") |
| Address | Who she is speaking to, and whether she names a universal or a particular |
| Transferable? | Yes / adapted / no — with the risk if copied badly |

### 2.4 One structural caution about this source

A **collective Aries reading is a different genre** from a personal one. She addresses many strangers at once, so she cannot reference a particular seeker's life, cannot ask questions, and must generalise. What transfers to RESONATE is her **sequencing, her transitions between cards, and her reframing of difficult cards** — not her mode of address. Copying the address would make Max more remote, not warmer. I will keep this distinction explicit in C.

### 2.5 The two examples already given

Chas's own framing is already a research finding: **The Tower** as structural change, ending, liberation and possible beginning; **Three of Swords** as emotional truth and the end of an era, not necessarily romantic heartbreak. Both resist the two standard failures — fatalism and the romantic default. I will test whether RESONATE's own corpus does the same, and whether the *engine* preserves that resistance or flattens it back into "heartbreak" and "disaster" through keyword composition.

### 2.6 Ethics

Technique is extracted; wording is not copied; no substantial passages are reproduced; the source is attributed. Mel's readings are her work.

---

## 3. Part two — Traditional tarot

### 3.1 The deck lineage is settled

`data.js` line 120 states: *"Complete Rider–Waite deck. IDs 0–4 and their original editorial content are preserved."* So the imagery is Rider–Waite–Smith. **Every correspondence imported into RESONATE must be RWS-compatible.** This is the single most important constraint in this part.

### 3.2 Primary sources

| Source | Use | Caveat |
|---|---|---|
| Waite, *The Pictorial Key to the Tarot* (1910) | The RWS baseline; the origin of the imagery RESONATE uses | Deliberately terse on Minors; explicitly withholds "higher" meanings; says little of substance on reversals |
| Golden Dawn, *Book T*; Regardie, *The Golden Dawn* | Astrological and decan attributions; the system most modern decks inherit | Technical, internally inconsistent in places, and written for a specific magical practice |
| Crowley, *The Book of Thoth* | Depth on the Minors' decans and the Major sequence | **Thoth-specific.** Renames (Prince/Knight), replaces Judgement with The Aeon, and does not match RWS imagery |
| Pollack, *Seventy-Eight Degrees of Wisdom* | The standard modern synthesis, RWS-based, psychologically literate | A modern reading, not tradition — grade B |
| Nichols, *Jung and Tarot* | Explicitly Jungian treatment of the Majors | Analytical psychology applied to tarot, not Jung's own tarot writing (he wrote none) |
| Greer, *Tarot for Your Self*; *21 Ways to Read a Tarot Card* | Reflective method; how to invite the seeker's own meaning | Method, not meaning |
| Wang, *The Qabalistic Tarot* | Qabalistic correspondences, if RESONATE wants them | Dense; easy to import as decoration |

### 3.3 The no-blending rule

Three distinct traditions are in play: **RWS**, **Golden Dawn**, and **Marseille**. Their pip meanings and some Major attributions genuinely differ. RESONATE uses RWS imagery, so:

- RWS and Golden Dawn may be used together **only where they agree**, or where the difference is stated.
- Marseille meanings may be cited as an alternative tradition, never blended in silently.
- Thoth material may be cited for depth, never presented as the meaning of an RWS image.

Blending is the most common failure in popular tarot writing, and it is undetectable to a reader who does not already know the systems. I will log every correspondence with its tradition.

### 3.4 The specific question for C

Not "what do the cards mean" — that answer exists in the corpus. The question is: **does the corpus's stated meaning match the tradition it claims, and where it departs, is the departure deliberate?** Deliberate departure is legitimate for RESONATE. Accidental departure is an error.

---

## 4. Part three — Astrology

### 4.1 The system to use

The Golden Dawn attribution scheme: each Major carries a planet, sign or element; each Minor is a **decan** — a ten-day segment of a sign, thirty-six in total, three per sign. This is the system most RWS-derived decks cite.

I will **not** reproduce a 78-row correspondence table from memory. I will verify each attribution against *Book T* / Regardie and record the source per row. A plausible-looking but wrong table is the worst possible output here, because it would be replicated silently through every reading.

### 4.2 Keeping symbol distinct from astronomy

The handover asks for this explicitly, and it is right. Symbolic astrology is a language of correspondence. It makes no causal claim about planets and persons. RESONATE's narration must never imply otherwise — no "Mercury is making you…", no planetary causation, no prediction. The card's correspondence is a symbolic register, and the reading should say so in its own vocabulary.

### 4.3 The use-sparingly rule

The most likely failure is decoration: every card gets "Mars in Aries, so…" and the reading becomes a correspondence recital. **A correspondence earns its place only when it changes what the reading says** — when the decan explains why this Ten of Cups differs from that one. If it could be deleted without loss, it should be.

---

## 5. Part four — Numerology

- **Established:** the Ace–Ten structure; the Qabalistic numbering 1–10 as the Sephiroth, which is what the Golden Dawn attributions actually rest on; the four Tens as completion of a suit's cycle.
- **Modern:** popular numerology's personality-number idiom, which is a different system and should not be presented as tarot tradition.
- **The corpus already has a numerology field for every card** — and it is largely formulaic (see §9). This is the field most at risk of becoming a recited paragraph. In C I will assess whether it says anything the card's number does not already say.

---

## 6. Part five — Jungian

### 6.1 Why this is the strongest available frame

Jung's own method of **amplification** — enriching a symbol with myth, parallel image and cultural association, without asserting fact about the outer world — is precisely the technique RESONATE needs. It gives spiritual depth and simultaneously forbids the claim of certainty, because amplification is offered as meaning, not as prediction. That is the intellectual bridge between the handover's two requirements: "spiritually rich" and "no unsupported certainty".

### 6.2 Sources

Jung, *The Archetypes and the Collective Unconscious* (CW9i) and *Aion* (CW9ii); *Man and His Symbols*; von Franz on projection and re-collection; Hillman's archetypal psychology for soul-making rather than literalism; Nichols for the tarot application. I will be clear that Jung wrote no tarot text — the Jungian tarot literature is application, not doctrine.

### 6.3 The shadow, handled carefully

RESONATE's stated foundation — *"does not deny the shadow… explores its meaning, recognises the choices before us"* — is the correct posture, and it is also the easiest to violate. Telling a seeker they are "in shadow" is a diagnosis. Offering a shadow as an invitation ("this may be the part of you that…") is not. In C I will check whether the corpus's psychological language invites or pronounces.

### 6.4 What I will not do

No diagnosis, no typology applied to the seeker, no claim that a card reveals a person's psychology. The cards are a reflective instrument.

---

## 7. Part six — Reversals, a caution worth raising

Reversals are a **divination-era convention**, not an intrinsic property of the cards. They were not part of early tarot play, became widespread in eighteenth- and nineteenth-century practice, and Waite treats them briefly and without conviction. Many serious traditions ignore them entirely.

I am not arguing against reversals — RESONATE has built and tested them, and they are clearly part of the product. I am arguing that **RESONATE should be able to say what its reversal practice is**: a chosen interpretive convention with a defensible logic, rather than a tradition handed down intact. That distinction is exactly the honesty the handover asks for, and it protects against the common incoherence where reversal sometimes means "blocked", sometimes "internal", sometimes "the opposite", within a single reading.

C will therefore include a consistency check: does a reversed card mean the same kind of thing every time it appears?

---

## 8. Part seven — Golden Thread technique, and the rubric for C

Techniques to research and then judge against:

- **Thesis before sequence, or sequence before thesis.** Does the reading state a proposition and then support it, or build one? Both work; mixing them produces a list.
- **Card-to-card bridges.** What makes a bridge a bridge, rather than two clauses joined by "and".
- **Elemental dignities.** The Golden Dawn system of whether neighbouring elements strengthen, weaken or antagonise. Genuinely useful for "how these two cards interact" — and genuinely easy to misuse as pseudo-technical authority.
- **The turn.** Where a reading changes direction, and whether it is earned.
- **Opening and closing.** Does the reading end in a proposition the seeker can act on, or in a summary?

The rubric C will apply to every Golden Thread: *is this a synthesis or a list?* A synthesis states something that none of the individual cards states alone. A list restates each card in turn. The distinction is testable, and it is the difference the handover is asking about.

---

## 9. Evidence already in hand — and the one thing that changes this plan

While establishing access I inspected `data.js` rather than assuming its quality, and found something that bears directly on D. Recording it here as a C preview, not a conclusion:

**The corpus is two corpora.** Each card carries `symbolism`, `psychological`, `numerology` and `wabiSabi` fields. But:

| Style | Cards | Evidence |
|---|---|---|
| Hand-written editorial | **5** — The Fool, Magician, High Priestess, Empress, Emperor | Unquoted keys, single-quoted strings, bespoke text |
| Generated | **73** | Quoted keys, formulaic text |

In the generated block:

- **All 73** `wabiSabi` entries begin with the same sentence — *"An imperfect, lived expression of {quality} can be more useful than an ideal you cannot inhabit."* — and then **repeat the card's `psychological` text verbatim**. It is not a second lens; it is the Jungian paragraph with a prefix.
- **57 of 73** `numerology` entries follow *"{Number meaning}. In {Card}, consider how this relates to {quality}."*
- The Jungian field is labelled *"Jungian lens:"* on the five hand-written cards and *"Psychological lens:"* on the other seventy-three — an inconsistency that will read as two different voices.

This matters more than a copy-editing note. It means the four-lens structure the product advertises is, for 73 of 78 cards, **two real lenses and two restatements**. Any editorial pass that rewrites Max's narration on top of this data will inherit it. D cannot fix the voice while the source text is duplicative, and I would rather say that before the rewriting starts than after.

It also resolves, partly, the hypothesis I gave Chas earlier. I had guessed the engine's depth was bounded by a thin corpus. The corpus is richer than I assumed — but a quarter of its apparent richness is repetition, and the richest parts belong to five cards. C will establish how much of the remaining depth actually reaches a reading.

---

## 10. Outputs and order

| Stage | Output | File |
|---|---|---|
| B | This plan; source register; observation sheet | `audit/DEEP_RESEARCH_PLAN.md`, `audit/DEEP_SOURCES.md` |
| C | 78-card interpretation audit; Golden Thread review; reversal consistency; **gap analysis of what the corpus has against what the engine uses** | `audit/DEEP_INTERPRETATION_AUDIT.md` |
| D | Editorial recommendations; RESONATE vocabulary; voice specification for Max; corpus remediation proposal | `audit/DEEP_EDITORIAL_RECOMMENDATIONS.md` |

Each stage ends with the same continuity record: `audit/DEEP_SESSION_STATE.md`.

**Order within C:** Majors first (they carry the most interpretive weight and the five hand-written cards set the voice), then the four suits, then reversals, then the Golden Thread. The engine gap-analysis runs alongside, because it determines whether D is an editorial task or a data task.

---

## 11. What I need from Chas

1. **3–5 Mel episode URLs**, or a decision to proceed without her and rely on technique literature. Either is workable; I would rather know which.
2. **Confirmation that reversals are a chosen convention** that RESONATE may state as such, or a preference to leave the question alone.
3. **A view on Qabalah:** whether RESONATE wants that layer explicitly or should keep to astrology, numerology and the psychological frame. Importing it badly is worse than omitting it deliberately.
4. **Whether the five hand-written cards are the tone reference** — because if they are, the other seventy-three are the real editorial problem.

---

## 12. Limits of this plan

- I cannot watch video, and I could not retrieve episode metadata. Part one depends on Chas or a video-capable session.
- I have not yet read `clarifier-reading.js` or `app.js` in full, so the engine-versus-corpus gap in §9 is a hypothesis with strong evidence, not a measurement.
- I cannot run the test suite or render the app (no Node, no Playwright), so anything about the running product is outside my reach. I can read the build; I cannot see it.
- My correspondence tables will be verified row by row against primary sources before use. Until then they do not exist.

No merge. No production change. No spending.
