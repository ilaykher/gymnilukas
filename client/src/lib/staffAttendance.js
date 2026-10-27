function validDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function toStaffAttendanceRow(record) {
  const attendanceDate = typeof record.attendance_date === 'string'
    ? validDate(`${record.attendance_date}T12:00:00+08:00`)
    : null;
  const timeIn = validDate(record.time_in);
  const timeOut = validDate(record.time_out);
  const totalHours = record.total_hours == null ? null : Number(record.total_hours);
  return {
    id: record.staff_shift_attendance_id,
    name: record.staff_name || 'Unknown staff member',
    date: attendanceDate
      ? attendanceDate.toLocaleDateString('en-PH', { timeZone: 'Asia/Manila' })
      : '—',
    timeIn: timeIn
      ? timeIn.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Manila' })
      : '—',
    timeOut: timeOut
      ? timeOut.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Manila' })
      : '—',
    totalHours: Number.isFinite(totalHours) ? totalHours.toFixed(2) : '—',
    status: record.status || (timeOut ? 'Completed' : 'On shift'),
  };
}
