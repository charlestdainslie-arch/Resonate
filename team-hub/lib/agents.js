// The three team members, the API each one runs on, and what a call costs.
// Prices are USD per 1M tokens, checked 28 Oct 2026; override with PRICES_JSON if a provider changes them.
// The monitor shows these as estimates: each provider's own billing page is the real bill.
'use strict';

const AGENTS = {
  'si-aye': {
    id: 'si-aye', name: 'Si Aye', provider: 'openai', keyEnv: 'OPENAI_API_KEY',
    model: () => process.env.OPENAI_MODEL || 'gpt-5.4-mini',
    role: 'Conductor and coordinator: consolidates instructions, reviews risk, terms and access, keeps evidence-backed handovers and status, and decides who should do what next.',
  },
  claude: {
    id: 'claude', name: 'Claude', provider: 'anthropic', keyEnv: 'ANTHROPIC_API_KEY',
    model: () => process.env.CLAUDE_MODEL || 'claude-sonnet-5-5',
    role: 'Builder and independent reviewer: code, UAT and browser testing, honest PASS/FAIL evidence, draft PRs only.',
  },
  deep: {
    id: 'deep', name: 'Deep', provider: 'deepseek', keyEnv: 'DEEPSEEK_API_KEY',
    model: () => process.env.DEEPSEEK_MODEL || 'deepseek-chat',
    role: 'Specialist and independent second opinion: motion/animation specs (author of the v1.0.1 motion spec), content and interpretation checks, and challenging assumptions.',
  },
};
const ORDER = ['si-aye', 'claude', 'deep'];

const DEFAULT_PRICES = {
  'claude-sonnet-5-5': { in: 2.0, out: 10.0 },
  'gpt-5.4-mini': { in: 0.75, out: 4.5 },
  'deepseek-chat': { in: 0.14, out: 0.28 },
};
// Unknown models are priced high on purpose, so a misconfigured model can't sneak past the caps.
const FALLBACK_PRICE = { in: 15, out: 75 };
function prices() {
  try { return { ...DEFAULT_PRICES, ...JSON.parse(process.env.PRICES_JSON || '{}') }; } catch { return DEFAULT_PRICES; }
}
function priceFor(model) { return prices()[model] || FALLBACK_PRICE; }
function costOf(model, inTok, outTok) { const p = priceFor(model); return (inTok * p.in + outTok * p.out) / 1e6; }

const MAX_OUT = () => Number(process.env.MAX_REPLY_TOKENS || 700);

function briefing(agent, notes) {
  const team = ORDER.map(id => `- ${AGENTS[id].name}: ${AGENTS[id].role}`).join('\n');
  return `You are ${agent.name}, a member of the RESONATE team, chatting live in the RESONATE Team Hub.
RESONATE is Chas's tarot app (GitHub: charlestdainslie-arch/Resonate), plus a wider creative ecosystem.

Team:
- Chas: owner and captain. His word is final. A message starting "CHAS:" is a direction everyone follows.
${team}

How to write here:
- Start your message with a header line naming who it's to, e.g. "**${agent.name} → Claude**" or "**${agent.name} → All**". To hand the floor to someone, mention them by name (@Claude, @Si Aye, @Deep). Mention "@Chas" when a decision or approval is needed from him.
- Be brief and concrete: short paragraphs or bullets, plain English, a few sentences unless detail is asked for. No filler or flattery. Disagree openly when you see a problem.
- Never invent facts about the code, branches, tests or what others did. If you don't know, say so and ask.

What you can and can't do from this chat:
- This hub is conversation only. You cannot run code, open links or change GitHub from here. Real code work happens in each member's own tools (Claude Code, Si Aye's GitHub access) on draft branches. So: agree plans, split the work, review evidence, and record decisions.
- Rules from the Control Room (#12) and Team Hub (#39) apply: code travels only by git branch + draft PR; no merges, production changes, purchases, new paid services or account changes without Chas's explicit approval; never share personal readings or private data outside.
- If the conversation is going in circles, or a decision is Chas's to make, stop and ask @Chas.
${notes ? `\nTeam notes from Chas (current state and priorities):\n${notes}\n` : ''}`;
}

function transcriptText(messages) {
  return messages.map(m => {
    const who = m.from === 'chas' ? 'Chas' : m.from === 'system' ? 'Hub' : (AGENTS[m.from]?.name || m.from);
    return `[${who}]\n${m.text}`;
  }).join('\n\n');
}

async function postJSON(url, headers, body) {
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    // Never echo request headers or keys; keep only the provider's short message.
    const msg = json?.error?.message || json?.message || ('HTTP ' + res.status);
    const err = new Error(String(msg).slice(0, 200)); err.status = res.status; throw err;
  }
  return json;
}

// Returns { text, inTok, outTok, model }.
async function callAgent(agent, messages, notes) {
  const key = process.env[agent.keyEnv];
  if (!key) throw Object.assign(new Error(`${agent.keyEnv} is not set`), { status: 0 });
  const model = agent.model();
  const system = briefing(agent, notes);
  const user = `Here is the conversation so far:\n\n${transcriptText(messages)}\n\nReply now as ${agent.name}. Remember the header line.`;
  if (agent.provider === 'anthropic') {
    const j = await postJSON((process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com') + '/v1/messages',
      { 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      { model, max_tokens: MAX_OUT(), system, messages: [{ role: 'user', content: user }] });
    const text = (j.content || []).filter(b => b.type === 'text').map(b => b.text).join('\n').trim();
    return { text, inTok: j.usage?.input_tokens || 0, outTok: j.usage?.output_tokens || 0, model };
  }
  const base = agent.provider === 'openai' ? (process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1') : (process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com');
  const limit = agent.provider === 'openai' ? { max_completion_tokens: MAX_OUT() } : { max_tokens: MAX_OUT() };
  const j = await postJSON(base + '/chat/completions', { Authorization: `Bearer ${key}` },
    { model, ...limit, messages: [{ role: 'system', content: system }, { role: 'user', content: user }] });
  const text = (j.choices?.[0]?.message?.content || '').trim();
  return { text, inTok: j.usage?.prompt_tokens || 0, outTok: j.usage?.completion_tokens || 0, model };
}

// Rough pre-call estimate (4 characters ≈ 1 token) used to stop before a call that would cross a cap.
function estimateCost(agent, messages, notes) {
  const chars = briefing(agent, notes).length + transcriptText(messages).length + 200;
  return costOf(agent.model(), Math.ceil(chars / 4), MAX_OUT());
}

module.exports = { AGENTS, ORDER, callAgent, costOf, priceFor, estimateCost, briefing, transcriptText, DEFAULT_PRICES };
