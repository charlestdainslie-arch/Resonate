// GET → is the hub set up, and is this browser signed in? Reveals no secrets.
const { route, authed } = require('../lib/http');
const { getStore } = require('../lib/store');
module.exports = route({
  async GET({ req }) {
    const s = !!getStore(), signedIn = authed(req);
    return { signedIn, passcodeSet: !!process.env.HUB_PASSCODE, storage: s,
      keys: !signedIn ? undefined : { anthropic: !!process.env.ANTHROPIC_API_KEY, openai: !!process.env.OPENAI_API_KEY, deepseek: !!process.env.DEEPSEEK_API_KEY } };
  },
}, { open: true });
