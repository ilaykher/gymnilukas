const TIME_ZONE = 'Asia/Manila';
const MANILA_UTC_OFFSET_MS = 8 * 60 * 60 * 1000;

export function getManilaDateKey(value = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(value);
  const part = (type) => parts.find((item) => item.type === type)?.value;
  return `${part('year')}-${part('month')}-${part('day')}`;
}

export function getNextManilaMidnight(value = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(value);
  const part = (type) => Number(parts.find((item) => item.type === type)?.value);
  const nextDay = new Date(Date.UTC(part('year'), part('month') - 1, part('day') + 1));
  return new Date(nextDay.getTime() - MANILA_UTC_OFFSET_MS);
}

export function observeManilaDay(onDayChange, environment = {}) {
  const now = environment.now || (() => new Date());
  const setTimer = environment.setTimeout || globalThis.setTimeout;
  const clearTimer = environment.clearTimeout || globalThis.clearTimeout;
  const documentObject = environment.document || globalThis.document;
  const windowObject = environment.window || globalThis.window;
  let currentDay = getManilaDateKey(now());
  let timer;
  let stopped = false;

  const schedule = (currentTime) => {
    clearTimer(timer);
    const delay = getNextManilaMidnight(currentTime).getTime() - currentTime.getTime();
    timer = setTimer(checkDay, Math.max(0, delay) + 25);
  };

  const checkDay = () => {
    if (stopped) return;
    const currentTime = now();
    const nextDay = getManilaDateKey(currentTime);
    if (nextDay !== currentDay) {
      currentDay = nextDay;
      onDayChange(nextDay);
    }
    schedule(currentTime);
  };

  const onVisibilityChange = () => {
    if (documentObject.visibilityState === 'visible') checkDay();
  };
  documentObject.addEventListener('visibilitychange', onVisibilityChange);
  windowObject.addEventListener('focus', checkDay);
  schedule(now());

  return () => {
    stopped = true;
    clearTimer(timer);
    documentObject.removeEventListener('visibilitychange', onVisibilityChange);
    windowObject.removeEventListener('focus', checkDay);
  };
}
