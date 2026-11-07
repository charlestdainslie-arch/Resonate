// Since the team directive of 7 Nov 2026 the main clarifier button clarifies one card at a time (finishing
// that card before the next). Tests that need every card clarified under Chas's teaching rule press it until
// the rule has nothing left to draw. Returns the number of presses.
module.exports = async function clarifyAll(page, max = 40) {
  let presses = 0;
  for (; presses < max; presses++) {
    const button = page.locator('#primaryClarifierAction');
    if (!(await button.count()) || !/Clarifier/.test(await button.innerText())) break;
    await button.click();
    await page.waitForTimeout(60);
  }
  return presses;
};
