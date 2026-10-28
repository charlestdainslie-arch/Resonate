// Local stand-ins for Vercel (routes /api/<name> to api/<name>.js) and for the three AI providers.
'use strict';
const http = require('http'), fs = require('fs'), path = require('path');
const root = path.resolve(__dirname, '..');

function listen(server) { return new Promise(r => server.listen(0, '127.0.0.1', () => r(server))); }
const urlOf = s => `http://127.0.0.1:${s.address().port}`;

// Fake provider. script(agentName, request) → reply text; records every request for assertions.
async function fakeProviders(script = name => `**${name} → Chas**\nNoted.`) {
  const requests = [];
  const server = http.createServer(async (req, res) => {
    const chunks = []; for await (const c of req) chunks.push(c);
    const body = JSON.parse(Buffer.concat(chunks).toString() || '{}');
    const rec = { path: req.url, headers: req.headers, body }; requests.push(rec);
    const sys = body.system || body.messages?.[0]?.content || '';
    const name = (String(sys).match(/^You are ([^,]+),/) || [])[1] || '?';
    const r = await script(name, rec);
    if (r && r.status) { res.writeHead(r.status, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ error: { message: r.message } })); }
    res.setHeader('Content-Type', 'application/json');
    if (req.url === '/v1/messages') return res.end(JSON.stringify({ content: [{ type: 'text', text: r }], usage: { input_tokens: 1000, output_tokens: 200 } }));
    res.end(JSON.stringify({ choices: [{ message: { content: r } }], usage: { prompt_tokens: 1000, completion_tokens: 200 } }));
  });
  await listen(server);
  const base = urlOf(server);
  Object.assign(process.env, {
    ANTHROPIC_BASE_URL: base, OPENAI_BASE_URL: base + '/v1', DEEPSEEK_BASE_URL: base,
    ANTHROPIC_API_KEY: 'test-anthropic-key', OPENAI_API_KEY: 'test-openai-key', DEEPSEEK_API_KEY: 'test-deepseek-key',
  });
  return { server, requests, base };
}

// Minimal Vercel-like server for the hub.
async function hubServer() {
  const types = { '.html': 'text/html', '.js': 'text/javascript' };
  const server = http.createServer(async (req, res) => {
    const p = new URL(req.url, 'http://x').pathname;
    const m = p.match(/^\/api\/([a-z]+)$/);
    if (m && fs.existsSync(path.join(root, 'api', m[1] + '.js'))) {
      const handler = require(path.join(root, 'api', m[1] + '.js'));
      // Vercel adds res.status/json helpers but the hub only uses Node's own response API.
      return handler(req, res);
    }
    const file = path.join(root, p === '/' ? 'index.html' : p);
    if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end(); }
    res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
    fs.createReadStream(file).pipe(res);
  });
  await listen(server);
  return { server, url: urlOf(server) };
}

module.exports = { fakeProviders, hubServer, urlOf };
