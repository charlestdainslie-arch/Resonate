// For layout tests that need every position at its fullest: deals the Major Arcana first, so under
// Chas's clarifier rule (Issue #13) every card gets a first clarifier and every first clarifier a second.
// Order within the Majors and within the rest stays random. Pass to page/context.addInitScript().
module.exports = function majorsFirst() {
  let deck;
  Object.defineProperty(window, 'ResonateDeck', {
    configurable: true,
    get() { return deck; },
    set(api) {
      const isMajor = id => id < 22;
      const shuffle = (ids, random) => { const out = api.shuffle(ids, random); return [...out.filter(isMajor), ...out.filter(id => !isMajor(id))]; };
      deck = Object.freeze({ ...api, shuffle, drawRemaining(ids, used, count, random) { const u = new Set(used); return shuffle(ids.filter(id => !u.has(id)), random).slice(0, count); } });
    }
  });
};
