// Passcode sign-in and a shared wrapper for the API routes. The passcode lives only in the
// HUB_PASSCODE environment variable; with none set, the hub stays locked.
'use strict';
const crypto = require('crypto');
const { getStore } = require('./store');

const COOKIE = 'hub_session';
const sign = v => crypto.createHmac('sha256', process.env.HUB_PASSCODE || '').update(v).digest('hex');
function sessionCookie() {
  const v = String(Date.now());
  return `${COOKIE}=${v}.${sign(v)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${60 * 60 * 24 * 30}`;
}
function authed(req) {
  if (!process.env.HUB_PASSCODE) return false;
  const raw = String(req.headers.cookie || '').split(/;\s*/).find(c => c.startsWith(COOKIE + '='));
  if (!raw) return false;
  const [v, sig] = raw.slice(COOKIE.length + 1).split('.');
  if (!v || !sig || sig.length !== 64) return false;
  const ok = crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(sign(v)));
  return ok && Date.now() - Number(v) < 1000 * 60 * 60 * 24 * 30;
}
function checkPasscode(given) {
  const want = process.env.HUB_PASSCODE || '';
  if (!want) return false;
  const a = crypto.createHash('sha256').update(String(given || '')).digest();
  const b = crypto.createHash('sha256').update(want).digest();
  return crypto.timingSafeEqual(a, b);
}

function send(res, status, body, extraHeaders = {}) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');
  for (const [k, v] of Object.entries(extraHeaders)) res.setHeader(k, v);
  res.end(JSON.stringify(body));
}
async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') { try { return JSON.parse(req.body); } catch { return {}; } }
  const chunks = []; for await (const c of req) chunks.push(c);
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'); } catch { return {}; }
}

// route({GET, POST}, {open}) → handler. Non-open routes need a session and a configured store.
function route(methods, { open = false } = {}) {
  return async (req, res) => {
    try {
      const fn = methods[req.method];
      if (!fn) return send(res, 405, { error: 'Method not allowed' });
      if (!open && !authed(req)) return send(res, 401, { error: 'Sign in first' });
      const store = getStore();
      if (!open && !store) return send(res, 503, { error: 'Storage is not connected yet (add Upstash Redis in Vercel → Storage).', setup: true });
      if (req.method === 'POST' && !open && req.headers['x-hub'] !== '1') return send(res, 403, { error: 'Bad request' });
      const body = req.method === 'POST' ? await readBody(req) : {};
      const out = await fn({ req, res, body, store, query: new URL(req.url, 'http://x').searchParams });
      if (out !== undefined && !res.writableEnded) send(res, 200, out);
    } catch (e) {
      if (!res.writableEnded) send(res, e.status || 500, { error: e.status ? e.message : 'Something went wrong on the server.' });
      if (!e.status) console.error(e);
    }
  };
}

module.exports = { route, send, authed, checkPasscode, sessionCookie, COOKIE };
