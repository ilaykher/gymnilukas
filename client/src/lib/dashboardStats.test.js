import assert from 'node:assert/strict';
import test from 'node:test';
import { parseWalkInsToday } from './dashboardStats.js';

test('walk-ins today accepts zero from the new Manila day query', () => {
  assert.equal(parseWalkInsToday({ walk_ins_today: 0 }), 0);
  assert.equal(parseWalkInsToday({ walk_ins_today: '0' }), 0);
});

test('walk-ins today rejects malformed dashboard counts', () => {
  assert.throws(() => parseWalkInsToday({ walk_ins_today: -1 }), /invalid walk-in count/);
  assert.throws(() => parseWalkInsToday({ walk_ins_today: null }), /invalid walk-in count/);
  assert.throws(() => parseWalkInsToday({}), /invalid walk-in count/);
});
