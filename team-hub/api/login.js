// POST {passcode} → session cookie. Five wrong tries locks sign-in for 15 minutes.
const { route, send, checkPasscode, sessionCookie, COOKIE } = require('../lib/http');
const { getStore } = require('../lib/store');
module.exports = route({
  async POST({ req, res, body }) {
    if (!process.env.HUB_PASSCODE) return send(res, 503, { error: 'The hub is locked: no passcode has been set in Vercel yet.', setup: true });
    const store = getStore();
    const ip = String(req.headers['x-forwarded-for'] || 'x').split(',')[0].trim();
    const key = 'hub:fail:' + ip;
    if (store && Number(await store.cmd('GET', key) || 0) >= 5) return send(res, 429, { error: 'Too many tries. Wait 15 minutes.' });
    if (!checkPasscode(body.passcode)) {
      if (store) { await store.cmd('INCR', key); await store.cmd('EXPIRE', key, 900); }
      return send(res, 401, { error: 'Wrong passcode' });
    }
    if (store) await store.cmd('DEL', key);
    return send(res, 200, { ok: true }, { 'Set-Cookie': sessionCookie() });
  },
  async DELETE({ res }) { return send(res, 200, { ok: true }, { 'Set-Cookie': `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0` }); },
}, { open: true });
