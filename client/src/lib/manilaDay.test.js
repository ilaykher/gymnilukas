import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getManilaDateKey,
  getNextManilaMidnight,
  observeManilaDay,
} from './manilaDay.js';

function createEventTarget() {
  const listeners = new Map();
  return {
    addEventListener(type, listener) {
      listeners.set(type, listener);
    },
    removeEventListener(type, listener) {
      if (listeners.get(type) === listener) listeners.delete(type);
    },
    dispatch(type) {
      listeners.get(type)?.();
    },
    get listenerCount() {
      return listeners.size;
    },
  };
}

function createClock(initialTime) {
  let currentTime = new Date(initialTime);
  let nextTimer = 1;
  const timers = new Map();
  return {
    now: () => new Date(currentTime),
    setNow(value) {
      currentTime = new Date(value);
    },
    setTimeout(callback, delay) {
      const id = nextTimer++;
      timers.set(id, { callback, delay });
      return id;
    },
    clearTimeout(id) {
      timers.delete(id);
    },
    get timer() {
      return [...timers.values()][0];
    },
    fire() {
      const [id, timer] = timers.entries().next().value;
      timers.delete(id);
      timer.callback();
    },
    get timerCount() {
      return timers.size;
    },
  };
}

test('Manila date conversion changes at the business midnight boundary', () => {
  assert.equal(getManilaDateKey(new Date('2026-10-27T15:59:59.999Z')), '2026-10-27');
  assert.equal(getManilaDateKey(new Date('2026-10-27T16:00:00.000Z')), '2026-10-28');
  assert.equal(
    getNextManilaMidnight(new Date('2026-10-27T15:00:00.000Z')).toISOString(),
    '2026-10-27T16:00:00.000Z'
  );
});

test('daily refresh runs at Manila midnight and schedules the following day', () => {
  const clock = createClock('2026-10-27T15:00:00.000Z');
  const document = createEventTarget();
  document.visibilityState = 'visible';
  const window = createEventTarget();
  const changedDays = [];
  const stop = observeManilaDay(
    (day) => changedDays.push(day),
    { ...clock, document, window }
  );

  assert.equal(clock.timer.delay, 60 * 60 * 1000 + 25);
  clock.setNow('2026-10-27T16:00:00.025Z');
  clock.fire();
  assert.deepEqual(changedDays, ['2026-10-28']);
  assert.equal(clock.timer.delay, 24 * 60 * 60 * 1000);

  clock.setNow('2026-10-28T16:00:00.025Z');
  clock.fire();
  assert.deepEqual(changedDays, ['2026-10-28', '2026-10-29']);
  assert.equal(clock.timer.delay, 24 * 60 * 60 * 1000);
  stop();
  assert.equal(clock.timerCount, 0);
  assert.equal(document.listenerCount, 0);
  assert.equal(window.listenerCount, 0);
});

test('visibility and focus recheck a suspended tab without duplicate day refreshes', () => {
  const clock = createClock('2026-10-27T15:00:00.000Z');
  const document = createEventTarget();
  document.visibilityState = 'visible';
  const window = createEventTarget();
  const changedDays = [];
  const stop = observeManilaDay(
    (day) => changedDays.push(day),
    { ...clock, document, window }
  );

  clock.setNow('2026-10-27T17:00:00.000Z');
  document.dispatch('visibilitychange');
  window.dispatch('focus');
  assert.deepEqual(changedDays, ['2026-10-28']);
  assert.equal(clock.timer.delay, 23 * 60 * 60 * 1000 + 25);

  document.visibilityState = 'hidden';
  clock.setNow('2026-10-28T17:00:00.000Z');
  document.dispatch('visibilitychange');
  assert.deepEqual(changedDays, ['2026-10-28']);
  document.visibilityState = 'visible';
  document.dispatch('visibilitychange');
  assert.deepEqual(changedDays, ['2026-10-28', '2026-10-29']);
  stop();
});
