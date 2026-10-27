import assert from 'node:assert/strict';
import test from 'node:test';
import { toStaffAttendanceRow } from './staffAttendance.js';

test('staff shift row displays date and timestamps in Philippine local time', () => {
  const row = toStaffAttendanceRow({
    staff_shift_attendance_id: 7,
    staff_name: 'Staff User',
    attendance_date: '2026-10-27',
    time_in: '2026-10-27T15:00:00.000Z',
    time_out: '2026-10-28T01:00:00.000Z',
    total_hours: '10.00',
    status: 'Completed',
  });
  assert.equal(row.name, 'Staff User');
  assert.equal(row.date, '10/27/2026');
  assert.equal(row.timeIn, '11:00 PM');
  assert.equal(row.timeOut, '09:00 AM');
  assert.equal(row.totalHours, '10.00');
  assert.equal(row.status, 'Completed');
});

test('open shifts do not invent timeout or duration values', () => {
  const row = toStaffAttendanceRow({
    staff_shift_attendance_id: 8,
    staff_name: 'Staff User',
    attendance_date: '2026-10-27',
    time_in: '2026-10-27T15:00:00.000Z',
    time_out: null,
    total_hours: null,
    status: 'On shift',
  });
  assert.equal(row.timeOut, '—');
  assert.equal(row.totalHours, '—');
  assert.equal(row.status, 'On shift');
});

test('missing or malformed attendance values render safely', () => {
  const row = toStaffAttendanceRow({
    staff_shift_attendance_id: 9,
    staff_name: null,
    attendance_date: 'invalid',
    time_in: 'invalid',
    time_out: null,
    total_hours: null,
  });
  assert.equal(row.name, 'Unknown staff member');
  assert.equal(row.date, '—');
  assert.equal(row.timeIn, '—');
});
