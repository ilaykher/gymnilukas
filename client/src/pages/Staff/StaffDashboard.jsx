import React from 'react';
import { useNavigate } from 'react-router-dom';
import ActivityTable from './ActivityTable';
import { activityRows } from './activityData';

const stats = [
  { label: "CUSTOMERS TODAY", value: '24', icon: '👥', badge: '+12%', tone: 'emerald' },
  { label: "TODAY'S INCOME", value: '₱1,250', icon: '₱', badge: '+5%', tone: 'emerald' },
  { label: 'MEMBERSHIPS EXPIRING TODAY', value: '5', icon: '⚠️', badge: null, tone: 'red' },
];

const iconTone = {
  emerald: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300',
  red: 'bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400',
};

export default function StaffDashboard() {
  const navigate = useNavigate();

  return (
    <div className="w-full flex-1 flex flex-col gap-6 relative transition-colors duration-200">
      {/* Header (action buttons moved to the sidebar) */}
      <div>
        <h2 className="text-2xl font-bold text-stone-900 dark:text-white">Dashboard Overview</h2>
        <p className="text-stone-500 dark:text-neutral-400 text-sm mt-1">Today's snapshot for Gym ni Lucas branch.</p>
      </div>

      {/* Stats Grid Cards: title first, then icon */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-stone-200 dark:border-neutral-800 shadow-sm relative overflow-hidden transition-colors duration-200"
          >
            <p className="text-sm md:text-base font-bold text-stone-500 dark:text-neutral-400 uppercase tracking-wide">
              {s.label}
            </p>
            <div className="flex items-center justify-between mt-4">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-lg ${iconTone[s.tone]}`}>
                {s.icon}
              </div>
              {s.badge && (
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full">
                  {s.badge}
                </span>
              )}
            </div>
            <h3 className="text-4xl font-extrabold text-stone-900 dark:text-white mt-3">{s.value}</h3>
          </div>
        ))}
      </div>

      {/* Real-time Activity: grows to fill the remaining height */}
      <div className="flex-1 flex flex-col bg-white dark:bg-neutral-900 rounded-2xl border border-stone-200 dark:border-neutral-800 shadow-sm transition-colors duration-200">
        <div className="p-6 border-b border-stone-200 dark:border-neutral-800 flex items-center justify-between">
          <h3 className="font-bold text-stone-900 dark:text-white text-base">Real-time Activity: Last 5 Walk-ins</h3>
          <button
            onClick={() => navigate('/realtime-activity')}
            className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 text-sm font-semibold flex items-center space-x-1 cursor-pointer focus-visible:outline-none focus-visible:underline"
          >
            <span>View All</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <ActivityTable rows={activityRows.slice(0, 5)} />
      </div>
    </div>
  );
}
