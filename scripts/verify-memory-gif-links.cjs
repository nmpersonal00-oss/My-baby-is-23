'use strict';
/** Validate real game data and uploaded GIFs without changing application code. */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'assets/memory-gif-inventory.json'), 'utf8'));
global.window = {};
require(path.join(root, 'memory-matching-data.js'));
const worlds = global.window.MEMORY_MATCH_DATA;
assert.equal(worlds.length, 8, 'Expected eight categories including Hollow Knight');

function gifFrameCount(filename) {
  const b = fs.readFileSync(filename);
  const check = (ok, message) => assert.ok(ok, `${filename}: ${message}`);
  check(b.length >= 13 && ['GIF89a', 'GIF87a'].includes(b.toString('ascii', 0, 6)), 'not GIF');
  const width = b.readUInt16LE(6), height = b.readUInt16LE(8);
  check(width === 480 && height === 210, `wrong GIF dimensions ${width} × ${height}`);
  let p = 13;
  const globalColor = b[10] & 128;
  if (globalColor) p += 3 * (1 << ((b[10] & 7) + 1));
  let count = 0, trailer = false;
  while (p < b.length) {
    const marker = b[p++];
    if (marker === 0x3b) { trailer = true; break; }
    if (marker === 0x21) {
      p++;
      while (p < b.length) {
        const n = b[p++];
        if (!n) break;
        p += n;
      }
    } else if (marker === 0x2c) {
      check(p + 9 <= b.length, 'truncated frame descriptor');
      const flags = b[p+8]; p += 9;
      if (flags & 128) p += 3 * (1 << ((flags & 7) + 1));
      p++; // LZW code size
      while (p < b.length) {
        const n = b[p++];
        if (!n) break;
        p += n;
      }
      count++;
    } else { throw Error(`${filename}: invalid GIF block marker ${marker}`); }
    check(p <= b.length, 'truncated GIF extension or LZW blocks');
  }
  check(trailer, 'missing GIF trailer');
  check(count >= 2, `expected animated GIF, got ${count} frames`);
  return count;
}

let countAssets = 0, empty = 0;
for (const world of worlds) {
  assert.equal(world.rounds.length, 5, `${world.id}: expected 5 rounds`);
  let all = [];
  for (const [i, round] of world.rounds.entries()) {
    assert.equal(round.pairs.length, 10, `${world.id} round ${i+1}: not 10 answers`);
    assert.equal(new Set(round.pairs.map(p => p.name)).size, 10,
      `${world.id} round ${i+1}: repeated answer`);
    all = all.concat(round.pairs);
  }
  if (world.id === 'hollow-knight') {
    for (const p of all) {
      if (p.gif) assert.ok(p.gif.startsWith('../assets/hollow-knight/'), 'Original Hollow Knight file path changed');
    }
    continue;
  }
  const group = manifest.categories[world.id];
  assert.ok(group, `No inventory for category ${world.id}`);
  assert.equal(group.answers.length, 50, `${world.id}: expected 50 inventory answers`);
  const expected = new Map(group.answers.map(p => [p.name, p.path]));
  assert.equal(expected.size, 50, `${world.id}: inventory contains repeated name`);
  assert.equal(all.length, 50);
  for (const pair of all) {
    assert.ok(expected.has(pair.name), `${world.id}: unmapped answer ${pair.name}`);
    const asset = expected.get(pair.name);
    const absolute = path.join(root, asset);
    if (fs.existsSync(absolute)) {
      assert.ok(pair.gif.startsWith('../' + asset + '?v='),
        `${world.id}: wrong or missing URL for ${pair.name}`);
      gifFrameCount(absolute);
      countAssets++;
    } else {
      assert.equal(pair.gif, '', `${world.id}: missing asset, but GIF URL assigned to ${pair.name}`);
      empty++;
    }
  }
  assert.equal(new Set(all.map(p => p.name)).size, 50, `${world.id}: repeated answer across rounds`);
}
console.log(`PASS: ${countAssets} linked, verified animated 480×210 GIFs; ${empty} awaiting artwork. Hollow Knight untouched.`);