// Conversation, turn-taking and spend caps. One agent reply per runTurn() call, so each serverless
// call stays short; any open hub page drives the queue, and a lock makes sure only one turn runs at once.
// Agents only talk while a hub page is open: closing the page is also an off switch for spending.
'use strict';
const { AGENTS, ORDER, callAgent, costOf, estimateCost } = require('./agents');

const K = {
  msgs: 'hub:msgs', seq: 'hub:seq', queue: 'hub:queue', budget: 'hub:budget', lock: 'hub:lock',
  paused: 'hub:paused', notes: 'hub:notes', calls: 'hub:calls',
  day: d => `hub:spend:day:${d}`, month: m => `hub:spend:month:${m}`,
};
const cfg = () => ({
  dailyCap: Number(process.env.DAILY_CAP_USD || 2),
  monthlyCap: Number(process.env.MONTHLY_CAP_USD || 20),
  autonomy: Number(process.env.AUTONOMY_TURNS || 6), // agent-to-agent replies allowed per Chas message
  context: Number(process.env.CONTEXT_MESSAGES || 40),
  tz: process.env.HUB_TIMEZONE || 'Australia/Sydney',
});

function today(tz) {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date()).map(x => [x.type, x.value]));
  return { day: `${p.year}-${p.month}-${p.day}`, month: `${p.year}-${p.month}` };
}
const hashObj = arr => { const o = {}; for (let i = 0; i < (arr || []).length; i += 2) o[arr[i]] = Number(arr[i + 1]); return o; };

// Who a message hands the floor to: "@Name" mentions and the "→ A, B" header line.
function mentions(text) {
  const head = (String(text).split('\n')[0].match(/→\s*([^*\n]+)/) || [])[1] || '';
  const hay = (head + ' ' + (String(text).match(/@[A-Za-z][A-Za-z\- ]{0,10}/g) || []).join(' ')).toLowerCase();
  const out = new Set();
  if (/\ball\b|\bteam\b|\beveryone\b/.test(head.toLowerCase())) ORDER.forEach(id => out.add(id));
  if (/claude/.test(hay)) out.add('claude');
  if (/si[\s-]?aye|siaye/.test(hay)) out.add('si-aye');
  if (/\bdeep(seek)?\b/.test(hay)) out.add('deep');
  return ORDER.filter(id => out.has(id));
}

async function addMessage(store, m) {
  const id = await store.cmd('INCR', K.seq);
  const msg = { id, at: new Date().toISOString(), ...m };
  await store.cmd('RPUSH', K.msgs, JSON.stringify(msg));
  await store.cmd('LTRIM', K.msgs, -2000, -1);
  return msg;
}
async function allMessages(store) { return (await store.cmd('LRANGE', K.msgs, 0, -1)).map(s => JSON.parse(s)); }
async function messagesAfter(store, after) { return (await allMessages(store)).filter(m => m.id > Number(after || 0)); }

async function spend(store) {
  const { day, month } = today(cfg().tz);
  const [d, m] = await store.pipe([['HGETALL', K.day(day)], ['HGETALL', K.month(month)]]);
  return { day, month, today: hashObj(d), thisMonth: hashObj(m) };
}

async function state(store) {
  const [queue, paused, budget] = await store.pipe([['LRANGE', K.queue, 0, -1], ['GET', K.paused], ['GET', K.budget]]);
  const s = await spend(store), c = cfg();
  return {
    queue, paused: paused || null, budget: Number(budget || 0),
    spend: { today: s.today.total || 0, month: s.thisMonth.total || 0, dailyCap: c.dailyCap, monthlyCap: c.monthlyCap },
  };
}

function capReason(s, extra = 0) {
  const c = cfg();
  if ((s.today.total || 0) + extra >= c.dailyCap) return `daily cap of $${c.dailyCap.toFixed(2)} reached`;
  if ((s.thisMonth.total || 0) + extra >= c.monthlyCap) return `monthly cap of $${c.monthlyCap.toFixed(2)} reached`;
  return null;
}

// Chas posts. "STOP" pauses everyone; otherwise the named agents (or all three) are queued to reply.
async function postChas(store, text, to) {
  text = String(text || '').trim().slice(0, 8000);
  if (!text) throw Object.assign(new Error('Empty message'), { status: 400 });
  const msg = await addMessage(store, { from: 'chas', text });
  if (/^stop\b/i.test(text)) {
    await store.pipe([['DEL', K.queue], ['SET', K.paused, 'Stopped by Chas'], ['SET', K.budget, 0]]);
    await addMessage(store, { from: 'system', text: 'Paused. Nobody will reply until Chas sends another message.' });
    return msg;
  }
  let targets = (Array.isArray(to) ? to : []).filter(id => AGENTS[id]);
  if (!targets.length) targets = mentions(text);
  if (!targets.length) targets = ORDER.slice();
  const over = capReason(await spend(store));
  if (over) {
    await store.cmd('SET', K.paused, `Spending ${over}`);
    await addMessage(store, { from: 'system', text: `Not sent to the team: ${over}. Raise the cap in Vercel settings, or wait for tomorrow.` });
    return msg;
  }
  await store.pipe([['DEL', K.queue], ['DEL', K.paused], ['SET', K.budget, cfg().autonomy], ['RPUSH', K.queue, ...targets]]);
  return msg;
}

async function setNotes(store, text) { await store.cmd('SET', K.notes, String(text || '').slice(0, 6000)); }
async function getNotes(store) { return (await store.cmd('GET', K.notes)) || ''; }

// Runs at most one agent reply. Returns { ran, busy, message, pending }.
async function runTurn(store, deps = {}) {
  const call = deps.callAgent || callAgent;
  const token = Math.random().toString(36).slice(2);
  if ((await store.cmd('SET', K.lock, token, 'NX', 'PX', 90000)) !== 'OK') return { busy: true, pending: true };
  try {
    if (await store.cmd('GET', K.paused)) { await store.cmd('DEL', K.queue); return { ran: false, pending: false }; }
    const id = await store.cmd('LPOP', K.queue);
    if (!id || !AGENTS[id]) return { ran: false, pending: false };
    const agent = AGENTS[id];
    const notes = await getNotes(store);
    const history = (await allMessages(store)).filter(m => m.from !== 'system').slice(-cfg().context);
    const over = capReason(await spend(store), estimateCost(agent, history, notes));
    if (over) {
      await store.pipe([['DEL', K.queue], ['SET', K.paused, `Spending ${over}`]]);
      const message = await addMessage(store, { from: 'system', text: `Paused before ${agent.name} replied: ${over}. Nothing more will be spent today unless Chas raises the cap.` });
      return { ran: false, message, pending: false };
    }
    let reply;
    try {
      reply = await call(agent, history, notes);
    } catch (e) {
      const message = await addMessage(store, { from: 'system', text: `${agent.name} couldn't reply: ${e.message}` });
      return { ran: false, message, pending: Number(await store.cmd('LLEN', K.queue)) > 0 };
    }
    const usd = costOf(reply.model, reply.inTok, reply.outTok);
    const { day, month } = today(cfg().tz);
    await store.pipe([
      ['HINCRBYFLOAT', K.day(day), 'total', usd], ['HINCRBYFLOAT', K.day(day), agent.provider, usd],
      ['HINCRBYFLOAT', K.month(month), 'total', usd], ['HINCRBYFLOAT', K.month(month), agent.provider, usd],
      ['EXPIRE', K.day(day), 60 * 60 * 24 * 40], ['EXPIRE', K.month(month), 60 * 60 * 24 * 400],
      ['LPUSH', K.calls, JSON.stringify({ at: new Date().toISOString(), agent: agent.name, provider: agent.provider, model: reply.model, inTok: reply.inTok, outTok: reply.outTok, usd })],
      ['LTRIM', K.calls, 0, 199],
    ]);
    const message = await addMessage(store, { from: id, text: reply.text || '(empty reply)', usd, model: reply.model });
    // Hand-offs: agents may call on each other, within the per-message autonomy budget.
    const queued = new Set(await store.cmd('LRANGE', K.queue, 0, -1));
    let skipped = false;
    for (const next of mentions(reply.text).filter(n => n !== id && !queued.has(n))) {
      if (Number(await store.cmd('GET', K.budget) || 0) <= 0) { skipped = true; break; }
      await store.pipe([['DECR', K.budget], ['RPUSH', K.queue, next]]);
      queued.add(next);
    }
    if (skipped) await addMessage(store, { from: 'system', text: `The team has used its ${cfg().autonomy} back-and-forth replies for this round. Over to Chas.` });
    return { ran: true, message, pending: Number(await store.cmd('LLEN', K.queue)) > 0 };
  } finally {
    if ((await store.cmd('GET', K.lock)) === token) await store.cmd('DEL', K.lock);
  }
}

async function monitor(store) {
  const s = await spend(store), c = cfg();
  const calls = (await store.cmd('LRANGE', K.calls, 0, 49)).map(x => JSON.parse(x));
  const keys = Object.fromEntries(ORDER.map(id => [id, { name: AGENTS[id].name, provider: AGENTS[id].provider, model: AGENTS[id].model(), keySet: !!process.env[AGENTS[id].keyEnv] }]));
  return { ...s, dailyCap: c.dailyCap, monthlyCap: c.monthlyCap, autonomy: c.autonomy, timezone: c.tz, calls, agents: keys };
}

module.exports = { postChas, runTurn, messagesAfter, state, monitor, setNotes, getNotes, mentions, today, K };
