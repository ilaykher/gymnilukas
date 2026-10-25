import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const PAGE_SIZE = 8;

// Mock data. The first three entries are the "recent" ones on the Activity Log page.
const activityLogs = [
  { time: 'Oct 15, 10:42 AM', name: 'Sara Jimenez', action: 'New Monthly Membership', type: 'emerald', member: 'Jose Santos' },
  { time: 'Oct 15, 09:15 AM', name: 'Elena Reyes', action: 'Renewed Monthly Membership', type: 'orange', member: 'Marco Jimenez' },
  { time: 'Oct 14, 04:30 PM', name: 'Mark Valencia', action: 'Reset Member PIN', type: 'stone', member: 'Alma Vera' },
  { time: 'Oct 14, 02:10 PM', name: 'Sara Jimenez', action: 'Renewed Monthly Membership', type: 'orange', member: 'Maria Ramos' },
  { time: 'Oct 14, 11:25 AM', name: 'Elena Reyes', action: 'Walk-in Registration', type: 'blue', member: 'Ana Santos' },
  { time: 'Oct 14, 09:05 AM', name: 'Daniel Katigbak', action: 'New Monthly Membership', type: 'emerald', member: 'Andrea Lim' },
  { time: 'Oct 13, 05:40 PM', name: 'Elena Reyes', action: 'Walk-in Registration', type: 'blue', member: 'Diego Bautista' },
  { time: 'Oct 13, 03:05 PM', name: 'Sara Jimenez', action: 'Renewed Monthly Membership', type: 'orange', member: 'Diego Torres' },
  { time: 'Oct 13, 01:20 PM', name: 'Mark Valencia', action: 'New Monthly Membership', type: 'emerald', member: 'Ella Cruz' },
  { time: 'Oct 13, 10:10 AM', name: 'Elena Reyes', action: 'Reset Member PIN', type: 'stone', member: 'Carla Reyes' },
  { time: 'Oct 12, 06:45 PM', name: 'Daniel Katigbak', action: 'Walk-in Registration', type: 'blue', member: 'Liza Navarro' },
  { time: 'Oct 12, 04:15 PM', name: 'Sara Jimenez', action: 'New Monthly Membership', type: 'emerald', member: 'Paolo Mendoza' },
  { time: 'Oct 12, 01:30 PM', name: 'Elena Reyes', action: 'Renewed Monthly Membership', type: 'orange', member: 'Rafael Soriano' },
  { time: 'Oct 12, 09:50 AM', name: 'Mark Valencia', action: 'Walk-in Registration', type: 'blue', member: 'Noel Garcia' },
  { time: 'Oct 11, 05:20 PM', name: 'Daniel Katigbak', action: 'Renewed Monthly Membership', type: 'orange', member: 'Bea Villanueva' },
  { time: 'Oct 11, 02:40 PM', name: 'Sara Jimenez', action: 'Reset Member PIN', type: 'stone', member: 'Trisha Lim' },
  { time: 'Oct 11, 11:15 AM', name: 'Elena Reyes', action: 'New Monthly Membership', type: 'emerald', member: 'Miguel Jacinto' },
  { time: 'Oct 11, 08:30 AM', name: 'Mark Valencia', action: 'Renewed Monthly Membership', type: 'orange', member: 'Juan Dizon' },
];

const attendanceRows = [
  { name: 'Sara Jimenez', date: 'Oct 15, 2024', timeIn: '08:00 AM', timeOut: '05:00 PM', hours: '9.0 hrs', status: 'Shift Completed' },
  { name: 'Elena Reyes', date: 'Oct 15, 2024', timeIn: '09:00 AM', timeOut: '--:--', hours: '--', status: 'On Duty' },
];

const ACTION_STYLES = {
  emerald: {
    pill: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300',
    dot: 'bg-emerald-600 dark:bg-emerald-400',
  },
  orange: {
    pill: 'bg-orange-100 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300',
    dot: 'bg-orange-600 dark:bg-orange-400',
  },
  blue: {
    pill: 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300',
    dot: 'bg-blue-600 dark:bg-blue-400',
  },
  stone: {
    pill: 'bg-stone-100 dark:bg-neutral-800 text-stone-700 dark:text-neutral-300',
    dot: 'bg-stone-500 dark:bg-neutral-400',
  },
};

const getInitials = (name) => name.split(' ').map((n) => n[0]).join('');

function LogTable({ rows, emptyMessage = 'No activities found.' }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-stone-200 dark:border-neutral-800 text-stone-400 dark:text-neutral-400 text-xs font-semibold tracking-wider bg-stone-50/50 dark:bg-neutral-800/40">
            <th className="py-3.5 px-6">TIME & DATE</th>
            <th className="py-3.5 px-6">STAFF NAME</th>
            <th className="py-3.5 px-6">ACTION DONE</th>
            <th className="py-3.5 px-6">AFFECTED MEMBER</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100 dark:divide-neutral-800 text-sm">
          {rows.length === 0 && (
            <tr>
              <td colSpan={4} className="py-12 text-center text-stone-500 dark:text-neutral-400">
                {emptyMessage}
              </td>
            </tr>
          )}
          {rows.map((log) => {
            const style = ACTION_STYLES[log.type] || ACTION_STYLES.stone;
            return (
              <tr key={`${log.time}-${log.name}-${log.member}`} className="hover:bg-stone-50/50 dark:hover:bg-neutral-800/50 transition">
                <td className="py-4 px-6 font-medium text-stone-600 dark:text-neutral-400 text-xs">{log.time}</td>
                <td className="py-4 px-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-stone-200 dark:bg-neutral-800 text-stone-700 dark:text-neutral-300 font-bold text-xs flex items-center justify-center shrink-0">
                      {getInitials(log.name)}
                    </div>
                    <span className="font-semibold text-stone-900 dark:text-white">{log.name}</span>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium space-x-1.5 ${style.pill}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`}></span>
                    <span>{log.action}</span>
                  </span>
                </td>
                <td className="py-4 px-6 font-medium text-stone-800 dark:text-neutral-200">{log.member}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Pagination({ page, totalPages, onChange }) {
  const base = 'w-8 h-8 rounded-lg border text-xs font-semibold flex items-center justify-center transition';
  const idle =
    'border-stone-300 dark:border-neutral-700 text-stone-600 dark:text-neutral-300 hover:bg-white dark:hover:bg-neutral-800 cursor-pointer';
  const active = 'border-[#0A5C36] bg-[#0A5C36] text-white';
  const disabled = 'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent';

  return (
    <nav aria-label="Pagination" className="flex items-center space-x-2">
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
        className={`${base} ${idle} ${disabled}`}
      >
        &lt;
      </button>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onChange(p)}
          aria-current={p === page ? 'page' : undefined}
          aria-label={`Page ${p}`}
          className={`${base} ${p === page ? active : idle}`}
        >
          {p}
        </button>
      ))}

      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page"
        className={`${base} ${idle} ${disabled}`}
      >
        &gt;
      </button>
    </nav>
  );
}

// "View Older Activities" screen: every activity, searchable by staff name, with pagination.
function AllActivities({ onBack }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return activityLogs.filter((log) => !q || log.name.toLowerCase().includes(q));
  }, [searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageRows = filtered.slice(start, start + PAGE_SIZE);

  return (
    <div className="space-y-6 transition-colors duration-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-stone-900 dark:text-white">All Staff Activities</h2>
          <p className="text-stone-500 dark:text-neutral-400 text-sm mt-1">
            Every recorded staff action. Search by staff name to narrow it down.
          </p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="self-start md:self-auto text-sm font-semibold text-stone-700 dark:text-neutral-200 bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 hover:bg-stone-50 dark:hover:bg-neutral-800 px-4 py-2.5 rounded-xl shadow-sm transition flex items-center space-x-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A5C36]"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back to Activity Log</span>
        </button>
      </div>

      <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-stone-200 dark:border-neutral-800 shadow-sm transition-colors duration-200">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-stone-400 dark:text-neutral-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search by staff name"
            aria-label="Search by staff name"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="w-full pl-11 pr-10 py-2.5 bg-white dark:bg-neutral-800 border border-stone-300 dark:border-neutral-700 rounded-xl text-sm text-stone-800 dark:text-white placeholder-stone-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#0A5C36]"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setPage(1);
              }}
              aria-label="Clear search"
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 dark:text-neutral-500 hover:text-stone-600 dark:hover:text-neutral-300 cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-stone-200 dark:border-neutral-800 shadow-sm overflow-hidden transition-colors duration-200">
        <LogTable rows={pageRows} emptyMessage="No staff activity matches your search." />

        <div className="p-4 border-t border-stone-200 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500 dark:text-neutral-400 bg-stone-50/50 dark:bg-neutral-800/40">
          <span aria-live="polite">
            Showing {filtered.length === 0 ? 0 : start + 1} to {start + pageRows.length} of {filtered.length} entries
          </span>
          <Pagination page={currentPage} totalPages={totalPages} onChange={setPage} />
        </div>
      </div>
    </div>
  );
}

export default function ActivityLog() {
  // ?view=all keeps the "all activities" screen in the URL, so the browser Back button works too.
  const [searchParams, setSearchParams] = useSearchParams();
  const showAll = searchParams.get('view') === 'all';

  if (showAll) {
    return <AllActivities onBack={() => setSearchParams({})} />;
  }

  return (
    <div className="space-y-8 transition-colors duration-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-stone-900 dark:text-white">Activity Log & Staff Actions</h2>
          <p className="text-stone-500 dark:text-neutral-400 text-sm mt-1">Track staff operations, registration activities, and attendance records.</p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 px-3.5 py-2 rounded-xl text-xs font-semibold text-stone-700 dark:text-neutral-300 shadow-sm flex items-center space-x-2 transition-colors duration-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <svg className="w-4 h-4 text-stone-500 dark:text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Oct 15, 2024</span>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-stone-200 dark:border-neutral-800 shadow-sm overflow-hidden transition-colors duration-200">
        <div className="p-6 border-b border-stone-200 dark:border-neutral-800 flex items-center justify-between">
          <h3 className="font-bold text-stone-900 dark:text-white text-base">Recent Staff Activities</h3>
          <button type="button" className="text-xs font-semibold text-[#0A5C36] dark:text-emerald-400 hover:underline flex items-center space-x-1.5 cursor-pointer">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Export CSV</span>
          </button>
        </div>

        <LogTable rows={activityLogs.slice(0, 3)} />

        <div className="p-4 border-t border-stone-200 dark:border-neutral-800 text-center bg-stone-50/50 dark:bg-neutral-800/40">
          <button
            type="button"
            onClick={() => setSearchParams({ view: 'all' })}
            className="text-xs font-semibold text-stone-600 dark:text-neutral-400 hover:text-stone-900 dark:hover:text-white cursor-pointer transition"
          >
            View Older Activities
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-stone-200 dark:border-neutral-800 shadow-sm overflow-hidden transition-colors duration-200">
        <div className="p-6 border-b border-stone-200 dark:border-neutral-800 flex items-center space-x-2">
          <svg className="w-5 h-5 text-stone-600 dark:text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="font-bold text-stone-900 dark:text-white text-base">Staff Shift Attendance</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-200 dark:border-neutral-800 text-stone-400 dark:text-neutral-400 text-xs font-semibold tracking-wider bg-stone-50/50 dark:bg-neutral-800/40">
                <th className="py-3.5 px-6">STAFF NAME</th>
                <th className="py-3.5 px-6">DATE</th>
                <th className="py-3.5 px-6">TIME IN</th>
                <th className="py-3.5 px-6">TIME OUT</th>
                <th className="py-3.5 px-6">TOTAL HOURS</th>
                <th className="py-3.5 px-6">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-neutral-800 text-sm">
              {attendanceRows.map((att) => (
                <tr key={att.name} className="hover:bg-stone-50/50 dark:hover:bg-neutral-800/50 transition">
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-stone-200 dark:bg-neutral-800 text-stone-700 dark:text-neutral-300 font-bold text-xs flex items-center justify-center shrink-0">
                        {getInitials(att.name)}
                      </div>
                      <span className="font-semibold text-stone-900 dark:text-white">{att.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-stone-600 dark:text-neutral-400 text-xs">{att.date}</td>
                  <td className="py-4 px-6 font-medium text-stone-800 dark:text-neutral-200 text-xs">{att.timeIn}</td>
                  <td className="py-4 px-6 font-medium text-stone-800 dark:text-neutral-200 text-xs">{att.timeOut}</td>
                  <td className="py-4 px-6 text-stone-600 dark:text-neutral-400 text-xs">{att.hours}</td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium space-x-1.5 ${
                      att.status === 'Shift Completed' ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300' : 'bg-emerald-600 text-white shadow-sm'
                    }`}>
                      {att.status === 'Shift Completed' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400"></span>}
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