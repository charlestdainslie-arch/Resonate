# Deep — test findings, 11 Nov Golden Thread and reading changes

**Date:** 11 November 2026
**From:** Deep
**To:** Chas, Si Aye, Claude (cc)
**Pin:** `99ac4fb` (claude/uat-thread-fixes) — `golden-thread-kiss.js` (620 lines), `golden-thread-kiss.css` (121), `presenter.js` (789), `app.js` (712)
**Status:** Code inspection only. **The interactive checklist was not executed.**

---

## 0. What I could and could not do — read this first

**I have no browser.** No Playwright, no Selenium, no rendering engine of any kind on this machine. I did not open the Vercel link and I cannot: it also expires around 12:30pm AEDT on 12 Nov, so it is of no use to me either way.

So the eight-step checklist — shuffle, draw, kiss order, clarifier reveals, Watch Max, Finish part-way, transcript order, written-reading route, PDF twice, reduce-motion — **has not been tested by me.** I am not going to report "passed" on anything I did not see. Every row below is code inspection, and where the answer depends on what appears on screen I have said so.

Claude has already run that checklist and reports all five reading types passing at both sizes. My job here is the independent read of the code, not a second opinion on his eyes.

What inspection *can* establish: the code paths, the strings, the state transitions, the filenames, and the failure modes. Two real defects, one probable edge case, and three things done well.

---

## 1. Findings by request format

| # | Reading type | Device | Step | What happened (by inspection) | What was expected | Severity |
|---|---|---|---|---|---|---|
| T1 | **All** | Any | Download PDF twice from two readings | Filename is built to **minute** resolution from the *draw* time (`app.js:52-56`). Two readings drawn in the same minute produce the **identical** filename. | Each reading gets its own name, "so nothing is overwritten" | **Medium** |
| T2 | **Seven-card** (question mode) | Any | Watch Max, clarifier on position 4 | Position 4's label is `You / Answer`. `spoken()` converts `' · '` to `', '` but **not `' / '`** (`presenter.js:66`). Max says *"Here is your first clarifier for You / Answer, Four of Cups: Judgement, reversed."* — a slash is not speakable. | A spoken form, e.g. "for You, Answer," | **Medium** |
| T3 | Any with an empty clarifier layer | Any | Transcript order | Frames are buffered as `pending` and flushed **forward** into the next chapter (`golden-thread-kiss.js:543-556`). A chapter that emits a frame but no card labels would push that frame into the following section. | Frame stays in its own chapter | Low — **probable, not proven** |
| T4 | All | Any | Reduce motion | Six separate `reduced()` early-returns (lines 315, 446, 474, 575, 602 and guard at 33). Cards still turn. | No light or dust; cards turn | **Correct as written** |
| T5 | All | Any | Watch Max wording | `forPos()` correctly withholds "the" before a label starting "The " or "You" (`presenter.js:69`), producing the approved *"for the Past, Four of Cups: …"* | Exact approved string | **Correct as written** |

---

## 2. T1 — the PDF filename can still collide

```js
function readingPdfName(){
  const d=new Date(state.drawnAt||Date.now()), p=n=>String(n).padStart(2,'0');
  const spread=String(readingTitle()).toLowerCase().normalize('NFKD')
    .replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')||'reading';
  return `resonate-${spread}-${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}.pdf`;
}
```

The spread slug is done properly — NFKD strips accents, runs collapse, leading/trailing dashes trimmed, `||'reading'` fallback. That part is careful work.

The timestamp is not. `HHMM` gives 10,000 possible names per day per spread, so two readings drawn in the same minute collide. That matters more than it sounds, because it keys off `state.drawnAt` — the **draw** time, not the save time. Draw a second reading within a minute of the first, save both, and the second overwrites the first under any browser that does not auto-rename.

**Fix, one line:** add seconds — `${p(d.getSeconds())}`. That raises it to 864,000 distinct names per day per spread and the problem disappears.

Worth noting: it also means *re-downloading the same reading* produces the same filename, which is correct behaviour and should be kept.

---

## 3. T2 — "You / Answer" will be spoken with a slash

```js
const spoken = label => label.replace(/ · /g, ', ');
const forPos = label => (/^(the |you\b)/i.test(label) ? '' : 'the ') + spoken(label);
```

The article logic is right, and the comment at `presenter.js:67-68` explicitly names the seeker labels — *"You", "You / Answer"* — as cases being handled. But it only handles the **article**, not the separator. `spoken()` knows about `·` and nothing else.

`'You / Answer'` is a real label: it is position 4 of the seven-card question reading (`app.js`, spread definition). So on that one position, in that one mode, Max will read a forward slash aloud as "slash" or swallow it.

**Fix:** extend `spoken()` — `label.replace(/ \/ /g, ', ').replace(/ · /g, ', ')`. One line, and it fixes the only label in the product that needs it.

This is a small defect but a telling one: it sits precisely where a comment says the case was considered.

---

## 4. T3 — frames can migrate between transcript chapters

`buildTranscript()` classifies each `<li>` as `label`, `frame` or other. Labels open a box in their chapter; frames close the box and join a `pending` buffer; when the next label arrives, `pending` is flushed into **that** chapter's lead lines.

That is right when every chapter begins with its own frame — which is how `presenter.js` emits them (`frame(chapter, …)` at the top of each layer). But `frame()` is called for a layer **before** the per-card loop filters out empty slots (`presenter.js:98-100`). If a layer exists but contributes no cards, its frame is emitted with no label to claim it, and `pending` carries it into the next chapter's lead.

I have not been able to construct the state that produces an empty layer, so I am calling this **probable, not proven**. A run with a reading that has clarifier layer 1 populated and layer 2 absent would settle it.

---

## 5. Three things done well, and worth keeping

**5.1 Clip-id versioning.** Every wording change mints **new** clip ids (`here-${nth}-clarifier-for`, `pos-${spread}-${i}-for`, `name-${id}-colon`) rather than reusing the old ones, with the comment *"so a recording of the old words never plays under the new caption"* (`presenter.js:106, 108`). That is genuinely good practice — it makes stale-audio bugs impossible rather than unlikely, and I would not have thought to require it.

**5.2 Reduced motion is honoured in six places, not one.** The guard is not bolted on at the top and forgotten; each observer and each animation path checks it independently. The cards still turn. That is the correct fallback shape — the outcome is preserved, only the ceremony is dropped.

**5.3 The transcript is rebuilt from the DOM rather than from the script.** `buildTranscript()` reads the rendered list items, so the transcript cannot drift from what Max actually said. Rebuilding from the same source as the captions is the right architectural choice.

---

## 6. What still needs a browser — and therefore is not my finding either way

These cannot be settled by reading code, and I am not claiming them:

- whether the light kisses **every** card **in order** on all five spreads, and never skips or double-kisses;
- whether it follows Max's strip in time with his speech, rather than racing ahead or lagging (this is the S2 coupling problem — it can only be judged by watching);
- transcript box order **as rendered**, including the T3 case;
- the written-reading route: map, "Part n of N", Next, folded detail — clarity and calm are judgements about experience, not code;
- phone layout, clipping, scroll behaviour during the sequence;
- reduce-motion **as it actually looks** rather than as coded.

The one that matters most is the second. If the light's arrival and Max's sentence drift apart even slightly, the effect stops reading as alive and starts reading as a second animation. That is the failure mode I would watch for hardest on a phone, and it is the one I cannot see.

— Deep
