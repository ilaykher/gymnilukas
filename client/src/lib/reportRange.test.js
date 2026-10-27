import assert from 'node:assert/strict';
import test from 'node:test';
import {
  defaultReportRange,
  formatReportRange,
  pickerValuesToRange,
  rangeToPickerValues,
  sumReportBuckets,
} from './reportRange.js';

test('daily ranges use calendar dates and display both selected days', () => {
  const range = pickerValuesToRange('Daily', {
    start: '2026-10-21',
    end: '2026-10-27',
  });
  assert.deepEqual(range, { from: '2026-10-21', to: '2026-10-27' });
  assert.equal(formatReportRange('Daily', range), 'Oct 21, 2026 - Oct 27, 2026');
});

test('monthly ranges expand to whole calendar months across years', () => {
  const range = pickerValuesToRange('Monthly', { start: '2025-12', end: '2026-02' });
  assert.deepEqual(range, { from: '2025-12-01', to: '2026-02-28' });
  assert.equal(formatReportRange('Monthly', range), 'Dec 2025 - Feb 2026');
  assert.deepEqual(rangeToPickerValues('Monthly', range), { start: '2025-12', end: '2026-02' });
});

test('yearly ranges cover full calendar years and show years', () => {
  const range = pickerValuesToRange('Yearly', { start: '2024', end: '2026' });
  assert.deepEqual(range, { from: '2024-01-01', to: '2026-12-31' });
  assert.equal(formatReportRange('Yearly', range), '2024 - 2026');
});

test('invalid or reversed selection cannot produce an applicable range', () => {
  assert.equal(pickerValuesToRange('Daily', { start: '2026-02-31', end: '2026-03-01' }), null);
  const reversed = pickerValuesToRange('Monthly', { start: '2026-03', end: '2026-01' });
  assert.ok(reversed.from > reversed.to);
});

test('mode defaults retain the current rolling window semantics at calendar granularity', () => {
  assert.deepEqual(defaultReportRange('Daily', '2026-10-27'), {
    from: '2026-10-21',
    to: '2026-10-27',
  });
  assert.deepEqual(defaultReportRange('Monthly', '2026-10-27'), {
    from: '2026-05-01',
    to: '2026-10-31',
  });
  assert.deepEqual(defaultReportRange('Yearly', '2026-10-27'), {
    from: '2022-01-01',
    to: '2026-12-31',
  });
});

test('summary cards total all selected chart buckets for the applied range', () => {
  const buckets = {
    membership: [100, 200, 50],
    walkIn: [25, 30, 45],
  };
  assert.equal(sumReportBuckets(buckets.membership), 350);
  assert.equal(sumReportBuckets(buckets.walkIn), 100);
});
