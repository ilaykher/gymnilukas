export function toActivityRow(row) {
  const details = row.activity_details || {};
  const isWalkIn = row.entity_type === 'walk_in';
  const status = details.status === 'expiring'
    ? 'Expires Soon'
    : details.status === 'expired'
      ? 'Expired'
      : 'Active';

  return {
    name: details.name || row.customer_name || 'Unknown',
    time: new Date(row.activity_date_created).toLocaleTimeString('en-PH', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Manila',
    }),
    type: isWalkIn ? 'Walk-in' : 'Monthly Member',
    status,
    expiresOn: isWalkIn
      ? null
      : Object.hasOwn(row, 'membership_expires_on')
        ? row.membership_expires_on
        : details.expiresOn || row.expires_on || null,
  };
}

function manilaDateParts(value) {
  if (typeof value !== 'string') return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-').map(Number);
    const parsedDate = new Date(Date.UTC(year, month - 1, day));
    if (
      parsedDate.getUTCFullYear() !== year ||
      parsedDate.getUTCMonth() !== month - 1 ||
      parsedDate.getUTCDate() !== day
    ) return null;
    return { year, month, day };
  }
  if (!/^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:\d{2})$/.test(value)) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const parts = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Asia/Manila',
  }).formatToParts(date);
  return {
    year: Number(parts.find((part) => part.type === 'year')?.value),
    month: Number(parts.find((part) => part.type === 'month')?.value),
    day: Number(parts.find((part) => part.type === 'day')?.value),
  };
}

export function formatMembershipExpiry(value) {
  const parts = manilaDateParts(value);
  if (!parts) return null;
  const isoDate = `${String(parts.year).padStart(4, '0')}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')}`;
  const [year, month, day] = isoDate.split('-').map(Number);
  const parsedDate = new Date(Date.UTC(year, month - 1, day));
  if (
    parsedDate.getUTCFullYear() !== year ||
    parsedDate.getUTCMonth() !== month - 1 ||
    parsedDate.getUTCDate() !== day
  ) return null;
  const date = new Date(`${isoDate}T12:00:00+08:00`);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat('en-PH', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Manila',
  }).format(date);
}

export function getCheckInExpiryText(value) {
  const formattedDate = formatMembershipExpiry(value);
  return formattedDate ? `Expires ${formattedDate}` : 'Expiration date unavailable';
}

export function getActivityExpiryText(row) {
  if (row.type === 'Walk-in') return 'Day pass — no membership expiry';
  const formattedDate = formatMembershipExpiry(row.expiresOn);
  return formattedDate ? `Membership expires: ${formattedDate}` : 'Membership expiration unavailable';
}
