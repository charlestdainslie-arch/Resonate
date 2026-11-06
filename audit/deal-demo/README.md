# Deck theatre — demo recordings for Chas (UAT, 6 Nov 2026)

Recorded on `70b6105` (branch `claude/uat-shuffle-deal`) by `audit/tools/deal-demo.cjs`. Each is the real app page `presenter-uat.html`: open the table, **Shuffle Cards**, **Draw Cards** (the deal), then the existing reading page and Golden Thread reveal. Nothing is staged; each recording is a real random draw.

| File | Screen | Spread |
|---|---|---|
| `guidance-412.mp4` | phone 412×915 | One-card |
| `three-412.mp4` | phone 412×915 | Past · Present · Future |
| `relationship-412.mp4` | phone 412×915 | Relationship (5) |
| `seven-412.mp4` | phone 412×915 | Seven-card V |
| `celtic-412.mp4` | phone 412×915 | Celtic Cross (10) |
| `celtic-1280.mp4` | desktop 1280×800 | Celtic Cross |
| `seven-1280.mp4` | desktop 1280×800 | Seven-card V |

`recordings.json`: for each recording, the cards dealt (top of the shuffled deck), the reading's cards with orientation, `sameCards` (dealt = reading; true in all 7) and page errors (0 in all 7).

**Notes:**
- Headless Chromium, software rendering: motion is smooth here, but a real Samsung phone is **not tested**.
- The phone-sized recordings use a 412×915 viewport; they are not a recording of a real device.
- Playback is real time. The longer videos include the Golden Thread reveal on the reading page after the deal.
