import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  formatMembershipExpiry,
  getActivityExpiryText,
  getCheckInExpiryText,
  toActivityRow,
} from './activity.js';

const sourceDirectory = path.dirname(fileURLToPath(import.meta.url));

test('member activity uses the associated database membership expiration date', () => {
  const row = toActivityRow({
    entity_type: 'member',
    activity_date_created: '2026-10-27T16:30:00.000Z',
    activity_details: { name: 'Member One', expiresOn: '2026-12-01' },
    membership_expires_on: '2026-11-27',
  });
  assert.equal(row.expiresOn, '2026-11-27');
  assert.equal(row.type, 'Monthly Member');
  assert.equal(formatMembershipExpiry(row.expiresOn), 'November 27, 2026');
  assert.equal(getActivityExpiryText(row), 'Membership expires: November 27, 2026');
  assert.equal(
    row.time,
    new Intl.DateTimeFormat('en-PH', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Manila',
    }).format(new Date('2026-10-27T16:30:00.000Z'))
  );
});

test('PostgreSQL DATE JSON serialization is normalized back to its Manila calendar date', () => {
  const apiRow = JSON.parse(JSON.stringify({
    entity_type: 'member',
    activity_date_created: '2026-10-27T14:36:06.097Z',
    activity_details: { name: 'Member One', status: 'active' },
    membership_expires_on: new Date('2026-11-26T16:00:00.000Z'),
  }));
  const row = toActivityRow(apiRow);
  assert.equal(apiRow.membership_expires_on, '2026-11-26T16:00:00.000Z');
  assert.equal(row.expiresOn, '2026-11-26T16:00:00.000Z');
  assert.equal(getActivityExpiryText(row), 'Membership expires: November 27, 2026');
});

test('check-in success expiry handles canonical and PostgreSQL-serialized membership dates', () => {
  assert.equal(getCheckInExpiryText('2026-11-27'), 'Expires November 27, 2026');

  const apiResponse = JSON.parse(JSON.stringify({
    success: true,
    data: { expiresOn: new Date('2026-11-26T16:00:00.000Z') },
  }));
  assert.equal(apiResponse.data.expiresOn, '2026-11-26T16:00:00.000Z');
  assert.equal(getCheckInExpiryText(apiResponse.data.expiresOn), 'Expires November 27, 2026');
});

test('check-in success expiry uses a fallback for missing or invalid dates', () => {
  for (const value of [undefined, null, '', 'not-a-date', '2026-02-31']) {
    const text = getCheckInExpiryText(value);
    assert.equal(text, 'Expiration date unavailable');
    assert.doesNotMatch(text, /Invalid Date/);
  }
});

test('day-pass entries and missing membership dates do not invent an expiration date', () => {
  const dayPass = toActivityRow({
    entity_type: 'walk_in',
    activity_date_created: '2026-10-27T16:30:00.000Z',
    activity_details: { name: 'Visitor', expiresOn: '2026-12-01' },
    membership_expires_on: null,
  });
  assert.equal(dayPass.expiresOn, null);
  assert.equal(dayPass.type, 'Walk-in');
  assert.equal(getActivityExpiryText(dayPass), 'Day pass — no membership expiry');

  const missingMembership = toActivityRow({
    entity_type: 'member',
    activity_date_created: '2026-10-27T16:30:00.000Z',
    activity_details: { name: 'Member One', expiresOn: '2026-12-01' },
    membership_expires_on: null,
  });
  assert.equal(missingMembership.expiresOn, null);
  assert.equal(formatMembershipExpiry(null), null);
  assert.equal(getActivityExpiryText(missingMembership), 'Membership expiration unavailable');
  assert.equal(formatMembershipExpiry('2026-02-31'), null);
});

test('activity table shows expiry in a fixed overlay without changing row layout', () => {
  const component = fs.readFileSync(
    path.join(sourceDirectory, '../pages/Staff/ActivityTable.jsx'),
    'utf8'
  );
  assert.match(component, /aria-expanded=\{isDisclosed\}/);
  assert.match(component, /onMouseEnter=\{\(event\) => showTooltip/);
  assert.match(component, /onFocus=\{\(event\) => showTooltip/);
  assert.match(component, /onClick=\{\(event\) => toggleTooltip/);
  assert.match(component, /createPortal\(/);
  assert.match(component, /className="fixed z-\[100\]/);
  assert.doesNotMatch(component, /group-hover:block|group-focus-within:block|mt-2 text-xs font-medium text-stone-700/);
  assert.match(component, /overflow-x-auto/);
  assert.match(component, /getActivityExpiryText\(row\)/);
});
