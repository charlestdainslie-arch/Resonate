// GET → estimated spend today/this month per provider, caps, recent calls, and which keys are set (never the keys).
const { route } = require('../lib/http');
const hub = require('../lib/hub');
module.exports = route({ async GET({ store }) { return hub.monitor(store); } });
