import React, { useState } from 'react';

export default function Transactions() {
  const [searchQuery, setSearchQuery] = useState('');
  const [revenueCategory, setRevenueCategory] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');

  return (
    <div className="space-y-6 transition-colors duration-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-stone-900 dark:text-white">Manage Transactions</h2>
          <p className="text-stone-500 dark:text-neutral-400 text-sm mt-1">View and manage all gym transactions and payments.</p>
        </div>

        <div>
          <button className="text-xs font-semibold text-[#0A5C36] dark:text-emerald-400 hover:underline flex items-center space-x-1.5 cursor-pointer bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 px-4 py-2 rounded-xl shadow-sm transition">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-stone-200 dark:border-neutral-800 shadow-sm p-4 flex flex-wrap items-center gap-4 transition-colors duration-200">
        <div className="relative flex-1 min-w-[240px]">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400 dark:text-neutral-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input 
            type="text" 
            placeholder="Search by Transaction ID or Name" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-neutral-800 border border-stone-200 dark:border-neutral-700 rounded-xl text-stone-800 dark:text-white placeholder-stone-400 dark:placeholder-neutral-500 text-xs focus:outline-none focus:ring-2 focus:ring-[#0A5C36]"
          />
        </div>

        <div className="w-48">
          <select 
            value={revenueCategory}
            onChange={(e) => setRevenueCategory(e.target.value)}
            className="w-full px-3.5 py-2 bg-white dark:bg-neutral-800 border border-stone-200 dark:border-neutral-700 rounded-xl text-stone-700 dark:text-neutral-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#0A5C36]"
          >
            <option value="" className="bg-white dark:bg-neutral-900">Revenue Category</option>
            <option value="Membership Renewal" className="bg-white dark:bg-neutral-900">Membership Renewal</option>
            <option value="Daily Pass" className="bg-white dark:bg-neutral-900">Daily Pass</option>
          </select>
        </div>

        <div className="w-48">
          <select 
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full px-3.5 py-2 bg-white dark:bg-neutral-800 border border-stone-200 dark:border-neutral-700 rounded-xl text-stone-700 dark:text-neutral-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#0A5C36]"
          >
            <option value="" className="bg-white dark:bg-neutral-900">Payment Method</option>
            <option value="GCash" className="bg-white dark:bg-neutral-900">GCash</option>
            <option value="Cash" className="bg-white dark:bg-neutral-900">Cash</option>
          </select>
        </div>
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
              {[
                { id: '#TRX-8924', date: 'Today, 10:42 AM', name: 'Jose Santos', initials: 'JS', cat: 'Membership Renewal', method: 'GCash', amount: '₱499.00' },
                { id: '#TRX-8923', date: 'Today, 09:15 AM', name: 'Guest User', initials: 'Guest', cat: 'Daily Pass', method: 'Cash', amount: '₱25.00' },
                { id: '#TRX-8922', date: 'Yesterday, 04:30 PM', name: 'Alma Vera', initials: 'AV', cat: 'Membership Renewal', method: 'GCash', amount: '₱75.00' },
                { id: '#TRX-8921', date: 'Yesterday, 02:10 PM', name: 'Jose Santos', initials: 'JS', cat: 'Membership Renewal', method: 'GCash', amount: '₱1,200.00' },
                { id: '#TRX-8920', date: 'Yesterday, 11:45 AM', name: 'Mark Valencia', initials: 'MV', cat: 'Membership Renewal', method: 'Cash', amount: '₱850.00' },
                { id: '#TRX-8919', date: 'Yesterday, 09:20 AM', name: 'Elena Reyes', initials: 'ER', cat: 'Membership Renewal', method: 'GCash', amount: '₱499.00' },
              ].map((trx, index) => (
                <tr key={index} className="hover:bg-stone-50/50 dark:hover:bg-neutral-800/50 transition">
                  <td className="py-4 px-6 font-medium text-stone-600 dark:text-neutral-400 text-xs">{trx.id}</td>
                  <td className="py-4 px-6 text-stone-600 dark:text-neutral-400 text-xs">{trx.date}</td>
                  <td className="py-4 px-6 flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-stone-200 dark:bg-neutral-800 text-stone-700 dark:text-neutral-300 font-bold text-xs flex items-center justify-center">
                      {trx.initials}
                    </div>
                    <span className="font-semibold text-stone-900 dark:text-white">{trx.name}</span>
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
                  <td className="py-4 px-6 text-right font-bold text-stone-900 dark:text-white text-sm">{trx.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-stone-200 dark:border-neutral-800 flex items-center justify-between text-xs text-stone-500 dark:text-neutral-400 bg-stone-50/50 dark:bg-neutral-800/40">
          <span>Showing 1 to 6 of 48 entries</span>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1.5 border border-stone-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-stone-400 dark:text-neutral-600 cursor-not-allowed">Previous</button>
            <button className="px-3 py-1.5 border border-stone-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-stone-700 dark:text-neutral-300 hover:bg-stone-50 dark:hover:bg-neutral-800 cursor-pointer transition">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}