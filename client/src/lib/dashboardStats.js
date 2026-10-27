export function parseWalkInsToday(dashboard) {
  const value = dashboard?.walk_ins_today;
  let count = Number.NaN;
  if (typeof value === 'number') count = value;
  else if (typeof value === 'string' && /^\d+$/.test(value)) count = Number(value);
  if (!Number.isInteger(count) || count < 0) {
    throw new Error('The dashboard API returned an invalid walk-in count.');
  }
  return count;
}
