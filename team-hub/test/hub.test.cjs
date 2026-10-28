'use strict';
const { test, beforeEach, after } = require('node:test');
const assert = require('node:assert/strict');
const { fakeProviders, hubServer } = require('./helpers.cjs');
const store$ = require('../lib/store');
const hub = require('../lib/hub');
const { AGENTS, costOf, callAgent } = require('../lib/agents');

let fake, store, script = null;
const servers = [];
async function setup() {
  if (!fake) { fake = await fakeProviders((name, rec) => script ? script(name, rec) : `**${name} → Chas**\nNoted.`); servers.push(fake.server); }
  store = store$.memoryStore(); store$.setStore(store);
  fake.requests.length = 0; script = null;
  Object.assign(process.env, { DAILY_CAP_USD: '2', MONTHLY_CAP_USD: '20', AUTONOMY_TURNS: '6', HUB_PASSCODE: 'moonlit-tarot' });
}
beforeEach(setup);
after(() => servers.forEach(s => s.close()));
async function drain(max = 20) { const out = []; for (let i = 0; i < max; i++) { const r = await hub.runTurn(store); if (r.message) out.push(r.message); if (!r.pending) break; } return out; }
const msgs = () => hub.messagesAfter(store, 0);

test('a message to All gets one reply from each, Si Aye then Claude then Deep', async () => {
  await hub.postChas(store, 'Evening team, status please');
  const replies = await drain();
  assert.deepEqual(replies.map(m => m.from), ['si-aye', 'claude', 'deep']);
  assert.equal(fake.requests.length, 3);
  const st = await hub.state(store);
  assert.deepEqual(st.queue, []);
  const expected = costOf('gpt-5.4-mini', 1000, 200) + costOf('claude-sonnet-5-5', 1000, 200) + costOf('deepseek-chat', 1000, 200);
  assert.ok(Math.abs(st.spend.today - expected) < 1e-9, 'spend recorded from real token counts');
  const mon = await hub.monitor(store);
  assert.equal(mon.calls.length, 3);
  assert.ok(mon.today.openai > 0 && mon.today.anthropic > 0 && mon.today.deepseek > 0);
});

test('chips and @mentions choose who replies', async () => {
  await hub.postChas(store, 'Just you please', ['deep']);
  assert.deepEqual((await drain()).map(m => m.from), ['deep']);
  await hub.postChas(store, '@Claude can you check the F1 fix?');
  assert.deepEqual((await drain()).map(m => m.from), ['claude']);
});

test('agents hand the floor to each other, within the autonomy budget', async () => {
  process.env.AUTONOMY_TURNS = '2';
  script = name => name === 'Claude' ? '**Claude → Deep**\n@Deep your view?' : name === 'Deep' ? '**Deep → Claude**\n@Claude agreed, back to you' : 'ok';
  await hub.postChas(store, 'Claude, start', ['claude']);
  const r = await drain();
  assert.deepEqual(r.filter(m => m.from !== 'system').map(m => m.from), ['claude', 'deep', 'claude'], 'two hand-offs, then stop');
  assert.match((await msgs()).at(-1).text, /used its 2 back-and-forth replies/);
  assert.deepEqual((await hub.state(store)).queue, []);
});

test('the daily cap stops before the call that would cross it, and blocks new rounds', async () => {
  process.env.DAILY_CAP_USD = '0.004'; // less than one Claude reply's worst case
  await hub.postChas(store, 'hello', ['claude']);
  const r = await drain();
  assert.equal(fake.requests.length, 0, 'no paid call was made');
  assert.match(r[0].text, /Paused before Claude replied: daily cap/);
  process.env.DAILY_CAP_USD = '0.0001';
  await store.cmd('HINCRBYFLOAT', `hub:spend:day:${hub.today('Australia/Sydney').day}`, 'total', '0.001');
  await hub.postChas(store, 'again', ['deep']);
  assert.match((await msgs()).at(-1).text, /Not sent to the team: daily cap/);
  assert.deepEqual((await hub.state(store)).queue, []);
});

test('the monthly cap applies too', async () => {
  process.env.MONTHLY_CAP_USD = '0.0001';
  await hub.postChas(store, 'hi', ['deep']);
  await drain();
  assert.equal(fake.requests.length, 0);
  assert.match((await msgs()).at(-1).text, /monthly cap/);
});

test('STOP pauses everyone and clears the queue', async () => {
  await hub.postChas(store, 'everyone go');
  await hub.runTurn(store);
  await hub.postChas(store, 'STOP');
  const before = fake.requests.length;
  const r = await hub.runTurn(store);
  assert.equal(r.pending, false);
  assert.equal(fake.requests.length, before);
  assert.ok((await hub.state(store)).paused);
  await hub.postChas(store, 'ok carry on', ['deep']);
  assert.equal((await hub.state(store)).paused, null);
});

test('only one turn runs at a time', async () => {
  let release; const gate = new Promise(r => { release = r; });
  script = async () => { await gate; return 'done'; };
  await hub.postChas(store, 'hi', ['claude', 'deep']);
  const first = hub.runTurn(store);
  await new Promise(r => setTimeout(r, 30));
  const second = await hub.runTurn(store);
  assert.equal(second.busy, true);
  release(); await first;
});

test('a provider error is shown plainly, costs nothing and the queue carries on', async () => {
  script = name => name === 'Si Aye' ? { status: 401, message: 'Incorrect API key provided' } : 'fine';
  await hub.postChas(store, 'hi');
  const r = await drain();
  assert.match(r[0].text, /Si Aye couldn't reply: Incorrect API key provided/);
  assert.deepEqual(r.slice(1).map(m => m.from), ['claude', 'deep']);
  assert.equal((await hub.monitor(store)).today.openai, undefined);
});

test('requests use each provider\'s real format, and errors never echo keys', async () => {
  await callAgent(AGENTS.claude, [{ from: 'chas', text: 'hi' }], 'notes here');
  await callAgent(AGENTS['si-aye'], [{ from: 'chas', text: 'hi' }], '');
  await callAgent(AGENTS.deep, [{ from: 'chas', text: 'hi' }], '');
  const [a, o, d] = fake.requests;
  assert.equal(a.path, '/v1/messages'); assert.equal(a.headers['x-api-key'], 'test-anthropic-key'); assert.equal(a.headers['anthropic-version'], '2023-06-01');
  assert.equal(a.body.model, 'claude-sonnet-5-5'); assert.ok(a.body.max_tokens > 0); assert.match(a.body.system, /You are Claude,/); assert.match(a.body.system, /notes here/);
  assert.equal(o.path, '/v1/chat/completions'); assert.equal(o.headers.authorization, 'Bearer test-openai-key'); assert.equal(o.body.model, 'gpt-5.4-mini'); assert.ok(o.body.max_completion_tokens > 0); assert.equal(o.body.max_tokens, undefined);
  assert.equal(d.path, '/chat/completions'); assert.equal(d.body.model, 'deepseek-chat'); assert.ok(d.body.max_tokens > 0);
  script = () => ({ status: 500, message: 'boom' });
  await assert.rejects(callAgent(AGENTS.claude, [], ''), e => !/test-anthropic-key/.test(e.message));
});

test('a missing key or unknown model is safe', async () => {
  const k = process.env.DEEPSEEK_API_KEY; delete process.env.DEEPSEEK_API_KEY;
  await hub.postChas(store, 'hi', ['deep']);
  const r = await drain();
  assert.match(r[0].text, /DEEPSEEK_API_KEY is not set/);
  process.env.DEEPSEEK_API_KEY = k;
  assert.ok(costOf('some-new-model', 1e6, 0) >= 15, 'unknown models are priced high so caps still bite');
});

test('mentions read the header line and @names', () => {
  assert.deepEqual(hub.mentions('**Si Aye → Claude, Deep**\nhi'), ['claude', 'deep']);
  assert.deepEqual(hub.mentions('**Claude → All**\nhi'), ['si-aye', 'claude', 'deep']);
  assert.deepEqual(hub.mentions('**Deep → Chas**\n@Si Aye thoughts?'), ['si-aye']);
  assert.deepEqual(hub.mentions('**Claude → Chas**\nNo hand-off.'), []);
});

// ---- HTTP layer
async function call(url, path, opts = {}) {
  const res = await fetch(url + path, { ...opts, headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) } });
  return { status: res.status, body: await res.json().catch(() => ({})), cookie: res.headers.get('set-cookie') };
}
test('HTTP: locked without a passcode, sign-in required, CSRF header required, brute force limited', async () => {
  const { server, url } = await hubServer(); servers.push(server);
  delete process.env.HUB_PASSCODE;
  assert.equal((await call(url, '/api/login', { method: 'POST', body: '{"passcode":"x"}' })).status, 503);
  process.env.HUB_PASSCODE = 'moonlit-tarot';
  assert.equal((await call(url, '/api/messages')).status, 401);
  const st = await call(url, '/api/status');
  assert.equal(st.body.keys, undefined, 'signed-out status reveals nothing about keys');
  for (let i = 0; i < 5; i++) assert.equal((await call(url, '/api/login', { method: 'POST', body: '{"passcode":"nope"}' })).status, 401);
  assert.equal((await call(url, '/api/login', { method: 'POST', body: '{"passcode":"moonlit-tarot"}' })).status, 429);
  await store.cmd('DEL', 'hub:fail:x');
  await store.cmd('DEL', 'hub:fail:127.0.0.1');
  const ok = await call(url, '/api/login', { method: 'POST', body: '{"passcode":"moonlit-tarot"}' });
  assert.equal(ok.status, 200);
  const cookie = ok.cookie.split(';')[0];
  assert.equal((await call(url, '/api/messages', { method: 'POST', headers: { cookie }, body: '{"text":"hi"}' })).status, 403, 'POST without x-hub header refused');
  const sent = await call(url, '/api/messages', { method: 'POST', headers: { cookie, 'x-hub': '1' }, body: '{"text":"hi","to":["deep"]}' });
  assert.equal(sent.status, 200);
  const turn = await call(url, '/api/turn', { method: 'POST', headers: { cookie, 'x-hub': '1' } });
  assert.equal(turn.body.message.from, 'deep');
  const mon = await call(url, '/api/monitor', { headers: { cookie } });
  assert.equal(mon.body.agents.deep.keySet, true);
  assert.ok(!JSON.stringify(mon.body).includes('test-deepseek-key'), 'monitor never exposes keys');
  process.env.HUB_PASSCODE = 'changed';
  assert.equal((await call(url, '/api/messages', { headers: { cookie } })).status, 401, 'changing the passcode signs everyone out');
});
