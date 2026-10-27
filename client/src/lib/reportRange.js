const pad = (value) => String(value).padStart(2, '0');

export function getManilaToday() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const value = (type) => parts.find((part) => part.type === type)?.value;
  return `${value('year')}-${value('month')}-${value('day')}`;
}

function shiftMonth(date, amount) {
  const [year, month] = date.split('-').map(Number);
  const shifted = new Date(Date.UTC(year, month - 1 + amount, 1));
  return `${shifted.getUTCFullYear()}-${pad(shifted.getUTCMonth() + 1)}`;
}

export function defaultReportRange(mode, today = getManilaToday()) {
  const [year, month] = today.split('-').map(Number);
  if (mode === 'Daily') {
    const end = new Date(`${today}T00:00:00Z`);
    end.setUTCDate(end.getUTCDate() - 6);
    return { from: end.toISOString().slice(0, 10), to: today };
  }
  if (mode === 'Monthly') {
    const fromMonth = shiftMonth(`${today.slice(0, 7)}-01`, -5);
    const endDate = new Date(Date.UTC(year, month, 0)).getUTCDate();
    return {
      from: `${fromMonth}-01`,
      to: `${today.slice(0, 7)}-${pad(endDate)}`,
    };
  }
  return {
    from: `${year - 4}-01-01`,
    to: `${year}-12-31`,
  };
}

export function rangeToPickerValues(mode, range) {
  if (mode === 'Monthly') {
    return { start: range.from.slice(0, 7), end: range.to.slice(0, 7) };
  }
  if (mode === 'Yearly') {
    return { start: range.from.slice(0, 4), end: range.to.slice(0, 4) };
  }
  return { start: range.from, end: range.to };
}

export function pickerValuesToRange(mode, values) {
  if (mode === 'Monthly') {
    if (!/^\d{4}-\d{2}$/.test(values.start) || !/^\d{4}-\d{2}$/.test(values.end)) return null;
    const [startYear, startMonth] = values.start.split('-').map(Number);
    const [endYear, endMonth] = values.end.split('-').map(Number);
    if (startYear < 1 || endYear < 1 ||
        startMonth < 1 || startMonth > 12 || endMonth < 1 || endMonth > 12) return null;
    const endDay = new Date(Date.UTC(endYear, endMonth, 0)).getUTCDate();
    return {
      from: `${values.start}-01`,
      to: `${values.end}-${pad(endDay)}`,
    };
  }
  if (mode === 'Yearly') {
    if (!/^\d{4}$/.test(values.start) || !/^\d{4}$/.test(values.end)) return null;
    if (Number(values.start) < 1 || Number(values.end) < 1) return null;
    return { from: `${values.start}-01-01`, to: `${values.end}-12-31` };
  }
  if (!isValidDate(values.start) || !isValidDate(values.end)) return null;
  return { from: values.start, to: values.end };
}

export function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return false;
  const [year, month, day] = value.split('-').map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day;
}

export function formatReportRange(mode, range) {
  if (!range) return '';
  if (mode === 'Yearly') return `${range.from.slice(0, 4)} - ${range.to.slice(0, 4)}`;
  if (mode === 'Monthly') {
    const formatMonth = (date) => new Date(`${date.slice(0, 7)}-01T00:00:00Z`)
      .toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' });
    return `${formatMonth(range.from)} - ${formatMonth(range.to)}`;
  }
  const formatDate = (date) => new Date(`${date}T00:00:00Z`)
    .toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
  return `${formatDate(range.from)} - ${formatDate(range.to)}`;
}

export function sumReportBuckets(values) {
  return values.reduce((total, value) => total + Number(value || 0), 0);
}
