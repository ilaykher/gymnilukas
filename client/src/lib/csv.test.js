import assert from 'node:assert/strict';
import test from 'node:test';
import { escapeCsvCell } from './csv.js';

test('CSV cells are quoted and embedded quotes are escaped', () => {
  assert.equal(escapeCsvCell('Taylor "T" Staff'), '"Taylor ""T"" Staff"');
  assert.equal(escapeCsvCell(null), '""');
});

test('CSV formula prefixes are neutralized', () => {
  for (const value of ['=1+1', '+1+1', '-1+1', '@SUM(A1:A2)']) {
    assert.equal(escapeCsvCell(value), '"' + "'" + value + '"');
  }
});
