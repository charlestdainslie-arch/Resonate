// GET ?after=id → new messages + hub state. POST {text, to[]} → Chas speaks.
const { route } = require('../lib/http');
const hub = require('../lib/hub');
module.exports = route({
  async GET({ store, query }) { return { messages: await hub.messagesAfter(store, query.get('after')), state: await hub.state(store) }; },
  async POST({ store, body }) { const message = await hub.postChas(store, body.text, body.to); return { message, state: await hub.state(store) }; },
});
