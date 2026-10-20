// Mock data shared by StaffDashboard and RealtimeActivity.
// `expiresOn` is an ISO date (null for walk-ins, who have no membership).
export const activityRows = [
  { name: 'Juan Dizon', time: '10:42 AM', type: 'Monthly Member', status: 'Active', expiresOn: '2026-11-12' },
  { name: 'Ana Santos', time: '10:15 AM', type: 'Walk-in', status: 'Active', expiresOn: null },
  { name: 'Miguel Jacinto', time: '09:50 AM', type: 'Monthly Member', status: 'Expires Soon', expiresOn: '2026-10-22' },
  { name: 'Ella Cruz', time: '09:30 AM', type: 'Monthly Member', status: 'Active', expiresOn: '2026-12-03' },
  { name: 'Diego Bautista', time: '09:15 AM', type: 'Walk-in', status: 'Active', expiresOn: null },
  { name: 'Carla Reyes', time: '08:58 AM', type: 'Monthly Member', status: 'Active', expiresOn: '2026-11-28' },
  { name: 'Paolo Mendoza', time: '08:40 AM', type: 'Monthly Member', status: 'Expires Soon', expiresOn: '2026-10-21' },
  { name: 'Liza Navarro', time: '08:22 AM', type: 'Walk-in', status: 'Active', expiresOn: null },
  { name: 'Rafael Soriano', time: '08:05 AM', type: 'Monthly Member', status: 'Active', expiresOn: '2027-01-15' },
  { name: 'Bea Villanueva', time: '07:48 AM', type: 'Monthly Member', status: 'Active', expiresOn: '2026-11-05' },
  { name: 'Noel Garcia', time: '07:30 AM', type: 'Walk-in', status: 'Active', expiresOn: null },
  { name: 'Trisha Lim', time: '07:12 AM', type: 'Monthly Member', status: 'Expires Soon', expiresOn: '2026-10-23' },
];

export const STATUS_OPTIONS = ['All', 'Active', 'Expires Soon'];
