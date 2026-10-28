// Tiny Redis client over the Upstash REST API (no dependencies). Vercel's Upstash integration sets
// KV_REST_API_URL/KV_REST_API_TOKEN (or UPSTASH_REDIS_REST_URL/TOKEN). Tests use the in-memory store.
'use strict';

function restStore(url, token) {
  async function call(path, body) {
    const res = await fetch(url.replace(/\/$/, '') + path, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error('Storage error ' + res.status);
    return json;
  }
  return {
    async cmd(...args) { const r = await call('/', args.map(String)); if (r.error) throw new Error(r.error); return r.result; },
    async pipe(cmds) {
      const r = await call('/pipeline', cmds.map(c => c.map(String)));
      return r.map(x => { if (x.error) throw new Error(x.error); return x.result; });
    },
  };
}

// Just enough Redis for the hub and its tests.
function memoryStore() {
  const kv = new Map(), exp = new Map();
  const now = () => Date.now();
  const live = k => { if (exp.has(k) && exp.get(k) <= now()) { kv.delete(k); exp.delete(k); } return kv.get(k); };
  const list = k => { let v = live(k); if (!Array.isArray(v)) { v = []; kv.set(k, v); } return v; };
  const hash = k => { let v = live(k); if (!(v instanceof Map)) { v = new Map(); kv.set(k, v); } return v; };
  const ops = {
    GET: k => { const v = live(k); return v === undefined ? null : String(v); },
    SET: (k, v, ...o) => {
      const nx = o.includes('NX'), px = o.indexOf('PX');
      if (nx && live(k) !== undefined) return null;
      kv.set(k, v); if (px >= 0) exp.set(k, now() + Number(o[px + 1])); else exp.delete(k);
      return 'OK';
    },
    DEL: (...ks) => ks.reduce((n, k) => n + (kv.delete(k) ? 1 : 0), 0),
    INCR: k => { const v = Number(live(k) || 0) + 1; kv.set(k, String(v)); return v; },
    DECR: k => { const v = Number(live(k) || 0) - 1; kv.set(k, String(v)); return v; },
    RPUSH: (k, ...v) => list(k).push(...v),
    LPUSH: (k, ...v) => { const l = list(k); v.forEach(x => l.unshift(x)); return l.length; },
    LPOP: k => { const l = list(k); return l.length ? l.shift() : null; },
    LLEN: k => list(k).length,
    LRANGE: (k, a, b) => { const l = list(k); a = Number(a); b = Number(b); const n = l.length; const s = a < 0 ? Math.max(0, n + a) : a; const e = b < 0 ? n + b : Math.min(b, n - 1); return l.slice(s, e + 1); },
    LTRIM: (k, a, b) => { const l = list(k); const r = ops.LRANGE(k, a, b); l.splice(0, l.length, ...r); return 'OK'; },
    HINCRBYFLOAT: (k, f, by) => { const h = hash(k); const v = Number(h.get(f) || 0) + Number(by); h.set(f, String(v)); return String(v); },
    HGETALL: k => { const h = live(k); if (!(h instanceof Map)) return []; return [...h].flat(); },
    EXPIRE: (k, s) => { if (kv.has(k)) exp.set(k, now() + Number(s) * 1000); return 1; },
    PEXPIRE: (k, ms) => { if (kv.has(k)) exp.set(k, now() + Number(ms)); return 1; },
  };
  return {
    async cmd(op, ...a) { const f = ops[String(op).toUpperCase()]; if (!f) throw new Error('memory store: ' + op); return f(...a.map(String)); },
    async pipe(cmds) { const out = []; for (const c of cmds) out.push(await this.cmd(...c)); return out; },
    _kv: kv,
  };
}

let shared = null;
function getStore() {
  if (shared) return shared;
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) return (shared = restStore(url, token));
  if (process.env.HUB_MEMORY_STORE === '1') return (shared = memoryStore());
  return null;
}
function setStore(s) { shared = s; }

module.exports = { getStore, setStore, memoryStore, restStore };
