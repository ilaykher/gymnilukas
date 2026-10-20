import React from 'react';

const formatDate = (iso) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const daysLeft = (iso) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((new Date(`${iso}T00:00:00`) - today) / 86400000);
};

const expiryText = (row) => {
  if (!row.expiresOn) return 'Walk-in: no membership to expire';
  const d = daysLeft(row.expiresOn);
  const when = d < 0 ? 'Expired' : d === 0 ? 'Expires today' : `Expires in ${d} day${d === 1 ? '' : 's'}`;
  return `${when} (${formatDate(row.expiresOn)})`;
};

const badgeStyles = {
  Active: {
    pill: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300',
    dot: 'bg-emerald-600 dark:bg-emerald-400',
  },
  'Expires Soon': {
    pill: 'bg-yellow-100 dark:bg-yellow-950/60 text-yellow-800 dark:text-yellow-300',
    dot: 'bg-yellow-500 dark:bg-yellow-400',
  },
};

export default function ActivityTable({ rows, emptyMessage = 'No activity found.' }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-stone-200 dark:border-neutral-800 text-stone-500 dark:text-neutral-400 text-xs font-semibold tracking-wider bg-stone-50/50 dark:bg-neutral-800/40">
            <th className="py-3 px-6">MEMBER NAME</th>
            <th className="py-3 px-6">TIME</th>
            <th className="py-3 px-6">TYPE</th>
            <th className="py-3 px-6">SUBSCRIPTION STATUS</th>
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
          {rows.map((row, index) => {
            const style = badgeStyles[row.status] || badgeStyles.Active;
            return (
              <tr
                key={`${row.name}-${index}`}
                tabIndex={0}
                className="group hover:bg-stone-50 dark:hover:bg-neutral-800/50 focus:bg-stone-50 dark:focus:bg-neutral-800/50 focus:outline-none transition"
              >
                <td className="py-4 px-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-stone-200 dark:bg-neutral-800 text-stone-700 dark:text-neutral-300 font-bold text-xs flex items-center justify-center shrink-0">
                      {row.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <span className="font-semibold text-stone-900 dark:text-white">{row.name}</span>
                  </div>
                </td>
                <td className="py-4 px-6 text-stone-600 dark:text-neutral-400">{row.time}</td>
                <td className="py-4 px-6">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      row.type === 'Monthly Member'
                        ? 'bg-stone-100 dark:bg-neutral-800 text-stone-700 dark:text-neutral-300'
                        : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                    }`}
                  >
                    {row.type}
                  </span>
                </td>
                <td className="py-4 px-6 relative">
                  <span
                    className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium ${style.pill}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`}></span>
                    <span>{row.status}</span>
                  </span>

                  {/* Expiry tooltip: shown on row hover or keyboard focus */}
                  <span
                    role="tooltip"
                    className="pointer-events-none absolute right-full top-1/2 -translate-y-1/2 mr-2 z-10 whitespace-nowrap rounded-lg bg-stone-900 dark:bg-neutral-700 px-3 py-1.5 text-xs font-medium text-white shadow-lg opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus:opacity-100"
                  >
                    {expiryText(row)}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
