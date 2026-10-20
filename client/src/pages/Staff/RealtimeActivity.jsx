import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ActivityTable from './ActivityTable';
import { activityRows } from './activityData';

export default function RealtimeActivity() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return activityRows.filter((r) => {
      const matchesSearch = !q || r.name.toLowerCase().includes(q) || r.type.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter]);

  return (
    <div className="w-full flex-1 flex flex-col gap-6 transition-colors duration-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-stone-900 dark:text-white">Real-time Activity</h2>
          <p className="text-stone-500 dark:text-neutral-400 text-sm mt-1">
            All check-ins and walk-ins for today. Hover a row to see when the subscription expires.
          </p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="self-start md:self-auto text-sm font-semibold text-stone-700 dark:text-neutral-200 bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 hover:bg-stone-50 dark:hover:bg-neutral-800 px-4 py-2.5 rounded-xl shadow-sm transition flex items-center space-x-2 cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back to Dashboard</span>
        </button>
      </div>

      {/* Search + status filter: same layout as Members.jsx */}
      <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-stone-200 dark:border-neutral-800 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between transition-colors duration-200">
        <div className="relative w-full md:w-3/4">
          <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-stone-400 dark:text-neutral-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search by Name or Type"
            aria-label="Search activity"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-neutral-800 border border-stone-300 dark:border-neutral-700 rounded-xl text-sm text-stone-800 dark:text-white placeholder-stone-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#0A5C36]"
          />
        </div>

        <div className="w-full md:w-1/4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by subscription status"
            className="w-full py-2.5 px-4 bg-white dark:bg-neutral-800 border border-stone-300 dark:border-neutral-700 rounded-xl text-sm text-stone-700 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#0A5C36] cursor-pointer"
          >
            <option value="All">Status: All</option>
            <option value="Active">Active</option>
            <option value="Expiring Soon">Expiring Soon</option>
            <option value="Expired">Expired</option>
          </select>
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-white dark:bg-neutral-900 rounded-2xl border border-stone-200 dark:border-neutral-800 shadow-sm">
        <ActivityTable rows={filtered} emptyMessage="No activity matches your search or filter." />

        <p className="px-6 py-3 mt-auto text-xs text-stone-500 dark:text-neutral-400 border-t border-stone-100 dark:border-neutral-800" aria-live="polite">
          Showing {filtered.length} of {activityRows.length} entries
        </p>
      </div>
    </div>
  );
}
