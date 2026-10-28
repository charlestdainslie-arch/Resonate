// GET/POST the team notes every agent reads (current state and priorities).
const { route } = require('../lib/http');
const hub = require('../lib/hub');
module.exports = route({
  async GET({ store }) { return { notes: await hub.getNotes(store) }; },
  async POST({ store, body }) { await hub.setNotes(store, body.notes); return { ok: true }; },
});
