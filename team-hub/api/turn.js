// POST → run the next queued agent reply (one at a time; a lock stops two pages running turns together).
const { route } = require('../lib/http');
const hub = require('../lib/hub');
module.exports = route({ async POST({ store }) { const r = await hub.runTurn(store); return { ...r, state: await hub.state(store) }; } });
