import React, { useMemo, useState } from 'react';

const PAGE_SIZE = 6;
const CATEGORIES = ['Membership Renewal', 'Daily Pass'];
const PAYMENT_METHODS = ['GCash', 'Cash'];

// Mock data (amount is a number so it can be formatted consistently).
const TRANSACTIONS = [
  { id: '#TRX-8924', date: 'Today, 10:42 AM', name: 'Jose Santos', cat: 'Membership Renewal', method: 'GCash', amount: 499 },
  { id: '#TRX-8923', date: 'Today, 09:15 AM', name: 'Guest User', cat: 'Daily Pass', method: 'Cash', amount: 25 },
  { id: '#TRX-8922', date: 'Yesterday, 04:30 PM', name: 'Alma Vera', cat: 'Membership Renewal', method: 'GCash', amount: 75 },
  { id: '#TRX-8921', date: 'Yesterday, 02:10 PM', name: 'Jose Santos', cat: 'Membership Renewal', method: 'GCash', amount: 1200 },
  { id: '#TRX-8920', date: 'Yesterday, 11:45 AM', name: 'Mark Valencia', cat: 'Membership Renewal', method: 'Cash', amount: 850 },
  { id: '#TRX-8919', date: 'Yesterday, 09:20 AM', name: 'Elena Reyes', cat: 'Membership Renewal', method: 'GCash', amount: 499 },
  { id: '#TRX-8918', date: 'Oct 13, 05:40 PM', name: 'Ana Santos', cat: 'Daily Pass', method: 'Cash', amount: 15 },
  { id: '#TRX-8917', date: 'Oct 13, 03:05 PM', name: 'Marco Jimenez', cat: 'Membership Renewal', method: 'GCash', amount: 450 },
  { id: '#TRX-8916', date: 'Oct 13, 10:20 AM', name: 'Guest User', cat: 'Daily Pass', method: 'Cash', amount: 15 },
  { id: '#TRX-8915', date: 'Oct 12, 06:45 PM', name: 'Andrea Lim', cat: 'Membership Renewal', method: 'Cash', amount: 350 },
  { id: '#TRX-8914', date: 'Oct 12, 01:15 PM', name: 'Diego Torres', cat: 'Membership Renewal', method: 'GCash', amount: 450 },
  { id: '#TRX-8913', date: 'Oct 12, 09:30 AM', name: 'Guest User', cat: 'Daily Pass', method: 'GCash', amount: 15 },
  { id: '#TRX-8912', date: 'Oct 11, 04:10 PM', name: 'Maria Ramos', cat: 'Membership Renewal', method: 'Cash', amount: 350 },
  { id: '#TRX-8911', date: 'Oct 11, 11:00 AM', name: 'Guest User', cat: 'Daily Pass', method: 'Cash', amount: 15 },
];

const formatPeso = (amount) =>
  `₱${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const getInitials = (name) => name.split(' ').map((n) => n[0]).join('');

// Lowercase and drop "#" and spaces so "trx 8924", "#TRX-8924" and "josesantos" all match.
const normalize = (value) => value.toLowerCase().replace(/[#\s]/g, '');

const selectClass =
  'w-full px-3.5 py-2 bg-white dark:bg-neutral-800 border border-stone-200 dark:border-neutral-700 rounded-xl text-stone-700 dark:text-neutral-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#0A5C36] cursor-pointer';

export default function Transactions() {
  const [searchQuery, setSearchQuery] = useState('');
  const [revenueCategory, setRevenueCategory] = useState('All');
  const [paymentMethod, setPaymentMethod] = useState('All');
  const [page, setPage] = useState(1);

  const hasActiveFilters = searchQuery.trim() !== '' || revenueCategory !== 'All' || paymentMethod !== 'All';

  // Filters are applied instantly on every keystroke / selection.
  const filtered = useMemo(() => {
    const q = normalize(searchQuery);
    return TRANSACTIONS.filter((trx) => {
      const matchesSearch = !q || normalize(trx.id).includes(q) || normalize(trx.name).includes(q);
      const matchesCategory = revenueCategory === 'All' || trx.cat === revenueCategory;
      const matchesMethod = paymentMethod === 'All' || trx.method === paymentMethod;
      return matchesSearch && matchesCategory && matchesMethod;
    });
  }, [searchQuery, revenueCategory, paymentMethod]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageRows = filtered.slice(start, start + PAGE_SIZE);

  const clearFilters = () => {
    setSearchQuery('');
    setRevenueCategory('All');
    setPaymentMethod('All');
    setPage(1);
  };

  return (
    <div className="space-y-6 transition-colors duration-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-stone-900 dark:text-white">Manage Transactions</h2>
          <p className="text-stone-500 dark:text-neutral-400 text-sm mt-1">View and manage all gym transactions and payments.</p>
        </div>

        <div>
          <button type="button" className="text-xs font-semibold text-[#0A5C36] dark:text-emerald-400 hover:underline flex items-center space-x-1.5 cursor-pointer bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 px-4 py-2 rounded-xl shadow-sm transition">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-stone-200 dark:border-neutral-800 shadow-sm p-4 flex flex-wrap items-center gap-4 transition-colors duration-200">
        <div className="relative flex-1 min-w-60">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400 dark:text-neutral-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search by Transaction ID or Name"
            aria-label="Search by transaction ID or client name"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-neutral-800 border border-stone-200 dark:border-neutral-700 rounded-xl text-stone-800 dark:text-white placeholder-stone-400 dark:placeholder-neutral-500 text-xs focus:outline-none focus:ring-2 focus:ring-[#0A5C36]"
          />
        </div>

        <div className="w-48">
          <select
            value={revenueCategory}
            onChange={(e) => {
              setRevenueCategory(e.target.value);
              setPage(1);
            }}
            aria-label="Filter by revenue category"
            className={selectClass}
          >
            <option value="All" className="bg-white dark:bg-neutral-900">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat} className="bg-white dark:bg-neutral-900">{cat}</option>
            ))}
          </select>
        </div>

        <div className="w-48">
          <select
            value={paymentMethod}
            onChange={(e) => {
              setPaymentMethod(e.target.value);
              setPage(1);
            }}
            aria-label="Filter by payment method"
            className={selectClass}
          >
            <option value="All" className="bg-white dark:bg-neutral-900">All Payment Methods</option>
            {PAYMENT_METHODS.map((method) => (
              <option key={method} value={method} className="bg-white dark:bg-neutral-900">{method}</option>
            ))}
          </select>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-xs font-semibold text-stone-600 dark:text-neutral-300 hover:text-stone-900 dark:hover:text-white underline-offset-2 hover:underline cursor-pointer"
          >
            Clear filters
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-stone-200 dark:border-neutral-800 shadow-sm overflow-hidden transition-colors duration-200">
        <div className="p-6 border-b border-stone-200 dark:border-neutral-800">
          <h3 className="font-bold text-stone-900 dark:text-white text-base">Transactions</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-200 dark:border-neutral-800 text-stone-400 dark:text-neutral-400 text-xs font-semibold tracking-wider bg-stone-50/50 dark:bg-neutral-800/40">
                <th className="py-3.5 px-6">TRANSACTION ID</th>
                <th className="py-3.5 px-6">DATE & TIME</th>
                <th className="py-3.5 px-6">NAME</th>
                <th className="py-3.5 px-6">REVENUE CATEGORY</th>
                <th className="py-3.5 px-6">PAYMENT METHOD</th>
                <th className="py-3.5 px-6 text-right">AMOUNT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-neutral-800 text-sm">
              {pageRows.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-stone-500 dark:text-neutral-400">
                    No transactions match your search or filters.
                  </td>
                </tr>
              )}
              {pageRows.map((trx) => (
                <tr key={trx.id} className="hover:bg-stone-50/50 dark:hover:bg-neutral-800/50 transition">
                  <td className="py-4 px-6 font-medium text-stone-600 dark:text-neutral-400 text-xs">{trx.id}</td>
                  <td className="py-4 px-6 text-stone-600 dark:text-neutral-400 text-xs">{trx.date}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-stone-200 dark:bg-neutral-800 text-stone-700 dark:text-neutral-300 font-bold text-xs flex items-center justify-center shrink-0">
                        {getInitials(trx.name)}
                      </div>
                      <span className="font-semibold text-stone-900 dark:text-white">{trx.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                      trx.cat === 'Membership Renewal'
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                        : 'bg-orange-100 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300'
                    }`}>
                      {trx.cat}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-stone-600 dark:text-neutral-400 text-xs">{trx.method}</td>
                  <td className="py-4 px-6 text-right font-bold text-stone-900 dark:text-white text-sm">{formatPeso(trx.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-stone-200 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500 dark:text-neutral-400 bg-stone-50/50 dark:bg-neutral-800/40">
          <span aria-live="polite">
            Showing {filtered.length === 0 ? 0 : start + 1} to {start + pageRows.length} of {filtered.length} entries
          </span>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setPage(currentPage - 1)}
              disabled={currentPage <= 1}
              className="px-3 py-1.5 border border-stone-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-stone-700 dark:text-neutral-300 hover:bg-stone-50 dark:hover:bg-neutral-800 cursor-pointer transition disabled:text-stone-400 dark:disabled:text-neutral-600 disabled:cursor-not-allowed disabled:hover:bg-white dark:disabled:hover:bg-neutral-900"
            >
              Previous
            </button>
            <span className="px-1 font-medium">Page {currentPage} of {totalPages}</span>
            <button
              type="button"
              onClick={() => setPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="px-3 py-1.5 border border-stone-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-stone-700 dark:text-neutral-300 hover:bg-stone-50 dark:hover:bg-neutral-800 cursor-pointer transition disabled:text-stone-400 dark:disabled:text-neutral-600 disabled:cursor-not-allowed disabled:hover:bg-white dark:disabled:hover:bg-neutral-900"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}