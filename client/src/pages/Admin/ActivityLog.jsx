import React from 'react';

export default function ActivityLog() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-stone-900">Activity Log & Staff Actions</h2>
          <p className="text-stone-500 text-sm mt-1">Track staff operations, registration activities, and attendance records.</p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="bg-white border border-stone-200 px-3.5 py-2 rounded-xl text-xs font-semibold text-stone-700 shadow-sm flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <svg className="w-4 h-4 text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Oct 15, 2024</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-stone-200 flex items-center justify-between">
          <h3 className="font-bold text-stone-900 text-base">Recent Staff Activities</h3>
          <button className="text-xs font-semibold text-[#0A5C36] hover:underline flex items-center space-x-1.5 cursor-pointer">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Export CSV</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-200 text-stone-400 text-xs font-semibold tracking-wider bg-stone-50/50">
                <th className="py-3.5 px-6">TIME & DATE</th>
                <th className="py-3.5 px-6">STAFF NAME</th>
                <th className="py-3.5 px-6">ACTION DONE</th>
                <th className="py-3.5 px-6">AFFECTED MEMBER</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-sm">
              {[
                { time: 'Oct 15, 10:42 AM', name: 'Sara Jimenez', initials: 'SJ', action: 'New Monthly Membership', type: 'emerald', member: 'Jose Santos' },
                { time: 'Oct 15, 09:15 AM', name: 'Elena Reyes', initials: 'ER', action: 'Renewed Monthly Membership', type: 'orange', member: 'Marco Jimenez' },
                { time: 'Oct 14, 04:30 PM', name: 'Mark Valencia', initials: 'MV', action: 'Reset Member Password', type: 'stone', member: 'Alma Vera' },
              ].map((log, index) => (
                <tr key={index} className="hover:bg-stone-50/50 transition">
                  <td className="py-4 px-6 font-medium text-stone-600 text-xs">{log.time}</td>
                  <td className="py-4 px-6 flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-stone-200 text-stone-700 font-bold text-xs flex items-center justify-center">
                      {log.initials}
                    </div>
                    <span className="font-semibold text-stone-900">{log.name}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium space-x-1.5 ${
                      log.type === 'emerald' ? 'bg-emerald-100 text-emerald-800' :
                      log.type === 'orange' ? 'bg-orange-100 text-orange-800' : 'bg-stone-100 text-stone-700'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        log.type === 'emerald' ? 'bg-emerald-600' :
                        log.type === 'orange' ? 'bg-orange-600' : 'bg-stone-500'
                      }`}></span>
                      <span>{log.action}</span>
                    </span>
                  </td>
                  <td className="py-4 px-6 font-medium text-stone-800">{log.member}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-stone-200 text-center bg-stone-50/50">
          <button className="text-xs font-semibold text-stone-600 hover:text-stone-900 cursor-pointer transition">
            View Older Activities
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-stone-200 flex items-center space-x-2">
          <svg className="w-5 h-5 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="font-bold text-stone-900 text-base">Staff Shift Attendance</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-200 text-stone-400 text-xs font-semibold tracking-wider bg-stone-50/50">
                <th className="py-3.5 px-6">STAFF NAME</th>
                <th className="py-3.5 px-6">DATE</th>
                <th className="py-3.5 px-6">TIME IN</th>
                <th className="py-3.5 px-6">TIME OUT</th>
                <th className="py-3.5 px-6">TOTAL HOURS</th>
                <th className="py-3.5 px-6">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-sm">
              {[
                { name: 'Sara Jimenez', initials: 'SJ', date: 'Oct 15, 2024', timeIn: '08:00 AM', timeOut: '05:00 PM', hours: '9.0 hrs', status: 'Shift Completed' },
                { name: 'Elena Reyes', initials: 'ER', date: 'Oct 15, 2024', timeIn: '09:00 AM', timeOut: '--:--', hours: '--', status: 'On Duty' },
              ].map((att, index) => (
                <tr key={index} className="hover:bg-stone-50/50 transition">
                  <td className="py-4 px-6 flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-stone-200 text-stone-700 font-bold text-xs flex items-center justify-center">
                      {att.initials}
                    </div>
                    <span className="font-semibold text-stone-900">{att.name}</span>
                  </td>
                  <td className="py-4 px-6 text-stone-600 text-xs">{att.date}</td>
                  <td className="py-4 px-6 font-medium text-stone-800 text-xs">{att.timeIn}</td>
                  <td className="py-4 px-6 font-medium text-stone-800 text-xs">{att.timeOut}</td>
                  <td className="py-4 px-6 text-stone-600 text-xs">{att.hours}</td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium space-x-1.5 ${
                      att.status === 'Shift Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald-600 text-white shadow-sm'
                    }`}>
                      {att.status === 'Shift Completed' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>}
                      <span>{att.status}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}