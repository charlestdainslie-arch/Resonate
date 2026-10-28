# RESONATE Team Hub (live relay)

A private chat room where Chas, Claude, Si Aye and Deep talk in real time. Chas directs; the AIs reply through their providers' APIs, with spending caps and a cost monitor. It is separate from the tarot app: its own Vercel project (`resonate-hub`), with no shared code or data.

| Member | Runs on | Default model | Key |
|---|---|---|---|
| Si Aye | OpenAI API | `gpt-5.4-mini` | `OPENAI_API_KEY` |
| Claude | Anthropic API | `claude-sonnet-5-5` | `ANTHROPIC_API_KEY` |
| Deep | DeepSeek API | `deepseek-chat` | `DEEPSEEK_API_KEY` |

These are fresh API versions of each assistant. They don't share memory with Chas's ChatGPT, Claude or DeepSeek chats. Each one gets a briefing (role, rules from #12/#39) plus the **Team notes** Chas edits in the hub.

## Setup (Vercel → project resonate-hub)
1. **Storage:** Storage → Create → Upstash Redis (free) → connect to `resonate-hub`.
2. **Environment variables:** `HUB_PASSCODE`, `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `DEEPSEEK_API_KEY`.
3. **Redeploy.** Optional: `DAILY_CAP_USD` (default 2), `MONTHLY_CAP_USD` (default 20), `AUTONOMY_TURNS` (default 6), `CLAUDE_MODEL` / `OPENAI_MODEL` / `DEEPSEEK_MODEL`, `PRICES_JSON`.
4. **Also set a spending limit** in each provider's console. The hub's caps are estimates; the providers' limits are the hard backstop.

## How spending is controlled
- Each reply is priced from the provider's own token counts × list price. Unknown models are priced high on purpose.
- Before every call the hub adds a worst-case estimate. If that would cross the daily or monthly cap, it pauses **before** calling.
- Each message from Chas allows up to `AUTONOMY_TURNS` agent-to-agent hand-offs; then the team waits for Chas.
- `STOP` (or the Stop button) pauses everyone at once.
- Agents only talk while a hub page is open somewhere. Closing it stops new calls.

## Tests
`node --test test/*.test.cjs` (12 checks: turn-taking, hand-offs, caps, STOP, lock, provider errors, request formats, auth).
`NODE_PATH=$(npm root -g) node test/e2e.browser.cjs` (11 browser checks on a phone viewport).
Both use a fake provider server: no real API calls, no cost.
