// Since the team directive of 7 Nov 2026 every clarifier is drawn for one card at a time. Tests that need
// every card clarified under Chas's teaching rule do it the way a seeker can on screen:
//   1. each card's own "✦ Draw Clarifier 1" button, card by card, then
//   2. the main button, which works through every card still waiting (each Clarifier 2), one at a time.
// With Majors dealt first (helpers/majors-first.cjs) this gives every position two clarifiers, as the
// spread-wide flow did before. Returns the number of presses.
module.exports = async function clarifyAll(page, max = 40) {
  let presses = 0;
  for (; presses < max; presses++) {
    const due = page.locator('[data-clarify-position].clarify-due', { hasText: 'Clarifier 1' });
    if (!(await due.count())) break;
    await due.first().click();
    await page.waitForTimeout(60);
  }
  for (; presses < max * 2; presses++) {
    const button = page.locator('#primaryClarifierAction');
    if (!(await button.count()) || !/Clarifier/.test(await button.innerText())) break;
    await button.click();
    await page.waitForTimeout(60);
  }
  return presses;
};
