# RESONATE — Cloud Source of Truth & Creative Tools Register
**v0.1 · 24 October 2026 · Owner: Chas · coordination: Si Aye · delivery lead: Cousin Dev**

## Decision — ONE project record, separate runtime data

- **Project source of truth = GitHub** `charlestdainslie-arch/Resonate`: source code, requirements, decisions, issues, branches, commits, UAT evidence and release approvals. Do not create competing task trackers in Excel/Notion/Google Sheets. A spreadsheet may be an *export/view*, not the authority.
- **Active engineering base = `develop/v1.0-base`** and `BACKLOG_V1_READING_EXPERIENCE.md`. See [delivery #7](https://github.com/charlestdainslie-arch/Resonate/issues/7), [P1 integrity #10](https://github.com/charlestdainslie-arch/Resonate/issues/10), [future #9](https://github.com/charlestdainslie-arch/Resonate/issues/9), [AI onboarding #11](https://github.com/charlestdainslie-arch/Resonate/issues/11), and [control room #12](https://github.com/charlestdainslie-arch/Resonate/issues/12).
- **IMPORTANT: this GitHub repository is PUBLIC.** Do not put passwords, private health/memoir notes, user names/email/birth details, actual readings, musical works awaiting release, contracts or unreleased footage into public issues or files. Owner to decide separately whether new private storage or private repository is needed.
- **Future application SQL = Supabase/PostgreSQL** as the initial candidate for customer-consented reading/journal persistence, identity/permissions and small metadata. Not a code source of truth, not a video archive. Site: https://supabase.com/ . **No project created or migration approved yet.** ChatGPT has shown an optional Supabase app connection; owner must connect explicitly.
- **CURRENT REALITY:** `journal.js` on `develop/v1.0-base` writes to browser `localStorage`, not to the cloud. Preserve existing use and data before designing migration.
- **Private creative assets = separate owner-controlled storage and backups** (not public GitHub or an SQL row). Keep an index of file IDs, provenance, rights, licence, date, edit state and backup location in private storage; no master video/audio files in repository.

## Supabase — $0 dev-only evaluation
The current public pricing page lists Free as **$0**, 500 MB database, 1 GB file storage, two active projects, and inactivity pausing. Free includes no automatic backups. Verify limits and future bills *in account* before activation.
- Pricing: https://supabase.com/pricing
- Pausing: https://supabase.com/docs/guides/platform/free-project-pausing
- Backup requirements: https://supabase.com/docs/guides/platform/backups
- **Design proposal only:** versioned schema migrations, `users/profiles` (only needed fields), `consents`, `reading_sessions`, `reading_positions`, `clarifier_layers`, `journal_entries`, `export_manifests`, `audit_events`. Immutable reading snapshots, strict RLS per authenticated user, privacy policy, export/delete and recovery tested before any deployment. No identifying customer data during free-tier experiments; use synthetic personas.
- Never put service-role keys or other secrets in browser JS or public GitHub. No paid tier, no payments enabled, no production credentials until specific owner approval.
- **Gate:** first finish the #7/#10 QA and prove journal save→reopen→download matches the baseline. Only then begin **isolated** SQL schema proof-of-concept and no-destructive migration test.

## AI research assistants — *free*, not blanket permission to run tools
| Helper | Purpose | Action now |
|---|---|---|
| **Claude Free** | Independent Rider–Waite text/position/UX/copy review and issue triage using redacted examples | Owner can sign in at https://claude.ai/ ; free usage limited; **Claude Code is not included in Free**. Return evidence, do not edit repo. |
| Perplexity Free | Cited public standards/licence/source checks | Owner can sign in at https://www.perplexity.ai/ ; limited tier. |
| GitHub Copilot Free | Optional autocomplete/test proposals in editor on isolated code | Existing GitHub sign-in, choose Free at https://github.com/features/copilot/plans ; respect caps. |
| Google Antigravity Individual Free | Optional isolated coding investigations only | Free quota/permissions check, https://antigravity.google/pricing . |
| Google AI Studio | Synthetic-only interpretation/prompt experiments | https://aistudio.google.com ; inspect data-use and cost terms. |
| Cline | **PARK**, duplicate coding agent with potential model-inference charges | Not a required install; retain record for reactivation |
| Continue | **PARK** pending maintenance check | No new active dependency |
| Ollama | Optional future local test | https://ollama.com/download ; **defer** pending laptop hardware and model-licence check |
External free AI web chats cannot independently see ChatGPT, coordinate with Cousin Dev, email Si Aye or write in GitHub unless the user separately connects a supported integration and grants scopes. Hand over with a dated prompt/report manually.

## Video / video AI / filming software for Welcome to Chasmania + Finding RESONATE
Do **not** install every overlapping app. Start with **one** video editor after confirming laptop operating system and GPU/RAM.
| Tool | Need | Action / cost |
|---|---|---|
| **DaVinci Resolve Free** | Main edit, colour, Fairlight audio, Fusion effects; edit vlog and promo | Shortlist as first choice on capable laptop; **free**, but many AI Neural Engine tools are Studio-only (paid). https://www.blackmagicdesign.com/au/products/davinciresolve |
| **Kdenlive** | Less demanding alternative if Resolve doesn't suit laptop | Genuine free/open-source editor. https://kdenlive.org/ ; **alternative, not mandatory second editor** |
| **OBS Studio** | Capture DAW, SSL 360°, demos, webcam/multicam, live pop-ups | Free/open-source; install once device suitable. https://obsproject.com/ |
| **Blender** | Animated golden thread / music visualisers / title motion study | Free/open-source, output can be used commercially; **Phase 2 visual prototyping only**, no Tarot production integration. https://www.blender.org/download/ |
| **LosslessCut** | Quick trim of raw footage without re-encode before import | Optional free GitHub release; store versions can be paid. https://github.com/mifi/lossless-cut |
| **HandBrake** | Compress/transcode files for mobile upload/sharing | Optional free/open-source. https://handbrake.fr/ |
| Cloud **AI video generator/editor** | Future supplementary B-roll / generative concepts | **No paid or trial activation now**. Evaluate free credits, watermark, commercial rights, likeness/voice consent, training-use terms, prompt privacy and export restrictions. Do not promise unlimited free video generation or upload private shoots by default. |

## Music / studio software and gear integration
**Never replace the agreed Bitwig + SSL/Akai/MPC studio direction with a random free DAW just because it is downloadable.** Audit hardware/OS integration first, confirm owned licences and then assess optional extras.
| Tool | Role | Action |
|---|---|---|
| **Bitwig Studio** | Intended primary DAW; SSL 360° and MPC integration to be verified | Not free. A trial is **not** perpetual freeware; do not activate or purchase without owner direction. https://www.bitwig.com/ |
| **SSL 360°** + SSL plug-ins | Match actual UF8/UF1/UC1 and planned console/hardware | Create hardware/software mapping by exact model, OS, license and bundle eligibility; don't assume all plugins come with hardware. https://www.solidstatelogic.com/ |
| **Akai MPC desktop software / firmware** | Verify MPC Key 37 G2 / MPC One G2 workflow, USB audio/MIDI and licence | Use official downloads and specific verified device; no Pro Pack purchase implicit. https://www.akaipro.com/ |
| **Audacity** | Fast podcast/dialogue cleanup, sampled sounds, field audio | **Actually free**, optional quick install. https://www.audacityteam.org/ |
| **Surge XT** | Free high-quality synth/VST3, sounds usable commercially | Optional, test with Bitwig once installed. https://surge-synthesizer.github.io/ |
| **Valhalla Supermassive** | Free expansive reverb/delay | Optional, test format/licence, https://valhalladsp.com/shop/reverb/valhalla-supermassive/ |
| **MuseScore Studio** | Music notation, score export and community teaching | Optional and free/open source, https://musescore.org/ |
| **LMMS** | Free DAW alternative/experimentation | **PARK**; redundant if working in Bitwig. https://lmms.io/ |
| **REAPER** | Another audio DAW | **PARK**; 60-day evaluation is NOT permanently free. https://www.reaper.fm/ |
| **ACE Studio 2** and other planned paid tools | Later vocal/production design in Mobile RESONATE | Keep in *paid/conditional budget register*, not the free-download list; check licences independently before buying. |

### Device/gear prep checklist for Cousin Dev
1. Inventory actual laptop OS, RAM, CPU/GPU, free disk space, sound interface, drivers, camera, microphone and portable drives; report **known vs planned** hardware.
2. Pick Resolve **or** Kdenlive; OBS; audio utilities only if needed.
3. Establish `MEDIA_INBOX / RAW / PROJECT / EXPORT / ARCHIVE` in **private** local/cloud media storage, with checksum/version/backup conventions and rights log. No raw footage in the public repository.
4. Capture 20-second **synthetic/non-sensitive** OBS video + audio; import, edit, render 1080p, check sync, colour, captions and licensing before expanding.
5. Verify sample clearance, track ownership, performance/guest releases, commercial-use terms and no copyrighted YouTube music re-use just because linked as inspiration.
6. Gear/driver installs are owner-assisted local actions. Never remote-execute arbitrary downloaded scripts or installers without inspecting publisher, signature and permissions.

## Cousin Dev delivery order: protect the actual base
1. **STATUS** issue #7 branch, last approved SHA, PRs, live/previews and current user-visible functionality. No assumption that build success means UAT.
2. **BLOCK/P1** issue #10: compare complete approved explanations with current candidate (code and screenshots) and repair regressions on isolated branch.
3. Verify 78-card pool, accurate Rider–Waite interpretations, spreads + gold numbered positions, max 2 UNIQUE clarifiers per primary card, opening/closing Oracle, numerology and validated astrology, journal and branded PDF correspondence, accessibility/responsiveness.
4. **Three QA passes** with evidence: functional automated, visual/mobile, independent full user journey with failed/retry cases.
5. Send results back via **Chas's Gmail** with subject `[RESONATE][DEV ISSUE][P1/P2] ...`, include exact branch + SHA + URL, repro and evidence. Chas can ask Si Aye to inspect email; **there is no autonomous 24/7 inbound multi-agent mailbox**.
6. Only after Chas reviews, propose an isolated Supabase prototype, settings/security/privacy/backup and optional integration plan. No code merge, production data migration or deployment until separate sign-off.

## Standard handover response
`STATUS | date | scope and owner permission | issue | branch / SHA / deployment | confirmed PASS/FAIL/UNKNOWN | bugs and steps | privacy/licensing/cost review | exact next decision for Chas`

**Safety:** “Ready to Go” is a musical cue and user context, *not* a tutorial about tools. User shared Republica's official video. Never claim external services were installed or registered merely because they're listed here.