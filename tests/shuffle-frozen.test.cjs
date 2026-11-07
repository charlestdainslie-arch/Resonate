// BT-08 (QA matrix, 7 Nov 2026): the approved shuffle and deal stay byte-for-byte identical to the build Chas
// approved on 6 Nov (commit 73da97d). SHA-256 of each file at 73da97d; works without git (for example, in the ZIP).
// Changing any of these files on purpose needs Chas's approval and a new reference here.
// 7 Nov 2026: Chas approved secure randomness for live draws. deck-engine.js changed only its random source
// (crypto.getRandomValues instead of Math.random; same Fisher–Yates). Its reference is the approved new
// version; the shuffle and deal animation (deck-theatre.*) and the draw flow (reading-stage.js) are unchanged
// from 73da97d. tests/secure-random.test.cjs checks the change itself.
'use strict';
const test = require('node:test');
const assert = require('assert/strict');
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const REFERENCE = {
  'deck-theatre.js': '8e959708835024f9693f1553e41808977213de281d24c71ea31e8261cdc99dac',
  'deck-theatre.css': '5a43866c3838385ae0dd3d39f5d3fa03b9e52f8ec420abdf058e8b2b08db6ad8',
  'deck-engine.js': 'b1007b014290b0f0891ccb0edd9bdc146e53ff9fcc2ad37f7857b11be69a9f67', // approved change, 7 Nov 2026 (was 8d607203… at 73da97d)
  'reading-stage.js': '2a74c07526298850bf62b30484d7fb7dccbe965bc40f4e89c66087677ce8ce50'
};
for (const [file, sha] of Object.entries(REFERENCE)) {
  test(`BT-08 approved shuffle unchanged: ${file}`, () => {
    const got = crypto.createHash('sha256').update(fs.readFileSync(path.join(__dirname, '..', file))).digest('hex');
    assert.equal(got, sha, `${file} differs from the approved reference (73da97d)`);
  });
}
