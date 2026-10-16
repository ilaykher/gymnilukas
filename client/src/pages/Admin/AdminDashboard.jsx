import React, { useState, useRef, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/Admin/AdminSidebar';
import Employees from './Employees';
import RegisterEmployee from './RegisterEmployee';
import ActivityLog from './ActivityLog';
import Transactions from './Transactions';
import Settings from '../Settings';

function AdminReportsView() {
  const [timeframe, setTimeframe] = useState('Monthly');
  const [revenueFilter, setRevenueFilter] = useState('All Revenues');

  return (
    <div className="space-y-6 transition-colors duration-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-stone-900 dark:text-white">Sales Dashboard</h2>
          <p className="text-stone-500 dark:text-neutral-400 text-sm mt-1">Overview of facility revenue and membership growth.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 p-1 rounded-xl flex items-center shadow-sm text-xs font-semibold transition-colors duration-200">
            {['Daily', 'Monthly', 'Yearly'].map((item) => (
              <button
                key={item}
                onClick={() => setTimeframe(item)}
                className={`px-3.5 py-1.5 rounded-lg transition cursor-pointer ${
                  timeframe === item ? 'bg-[#0A5C36] text-white' : 'text-stone-600 dark:text-neutral-400 hover:bg-stone-100 dark:hover:bg-neutral-800'
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 px-3.5 py-2 rounded-xl text-xs font-semibold text-stone-700 dark:text-neutral-300 shadow-sm flex items-center space-x-2 transition-colors duration-200">
            <svg className="w-4 h-4 text-stone-500 dark:text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Oct 01, 2024 - Oct 31, 2024</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <select
          value={revenueFilter}
          onChange={(e) => setRevenueFilter(e.target.value)}
          className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 px-4 py-2 rounded-xl text-xs font-semibold text-stone-700 dark:text-neutral-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0A5C36] transition-colors duration-200"
        >
          <option value="All Revenues" className="bg-white dark:bg-neutral-900">All Revenues</option>
          <option value="Membership" className="bg-white dark:bg-neutral-900">Membership Revenue</option>
          <option value="Walk-in" className="bg-white dark:bg-neutral-900">Daily / Walk-in Revenue</option>
        </select>

        <button className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 hover:bg-stone-50 dark:hover:bg-neutral-800 px-4 py-2 rounded-xl text-xs font-semibold text-stone-700 dark:text-neutral-300 shadow-sm flex items-center space-x-2 transition cursor-pointer">
          <svg className="w-4 h-4 text-stone-500 dark:text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span>Export CSV / PDF</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-stone-200 dark:border-neutral-800 shadow-sm relative overflow-hidden transition-colors duration-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-stone-400 dark:text-neutral-500 uppercase tracking-wider">Total Earnings</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-[#0A5C36] dark:text-emerald-400 flex items-center justify-center font-bold">₱</div>
          </div>
          <h3 className="text-3xl font-extrabold text-stone-900 dark:text-white mt-1">₱124,500</h3>
        </div>

        <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-stone-200 dark:border-neutral-800 shadow-sm relative overflow-hidden transition-colors duration-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-stone-400 dark:text-neutral-500 uppercase tracking-wider">Membership Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-[#0A5C36] dark:text-emerald-400 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
          <h3 className="text-3xl font-extrabold text-stone-900 dark:text-white mt-1">₱102,000</h3>
        </div>

        <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-stone-200 dark:border-neutral-800 shadow-sm relative overflow-hidden transition-colors duration-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-stone-400 dark:text-neutral-500 uppercase tracking-wider">Daily / Walk-in Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
          </div>
          <h3 className="text-3xl font-extrabold text-stone-900 dark:text-white mt-1">₱22,500</h3>
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-stone-200 dark:border-neutral-800 shadow-sm p-6 space-y-6 transition-colors duration-200">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-stone-900 dark:text-white text-base">Revenue Breakdown Over Time</h3>
          <div className="flex items-center space-x-4 text-xs font-semibold">
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0A5C36]"></span>
              <span className="text-stone-600 dark:text-neutral-400">Membership</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
              <span className="text-stone-600 dark:text-neutral-400">Walk-In</span>
            </div>
          </div>
        </div>

        <div className="h-64 border-b border-stone-200 dark:border-neutral-800 relative flex items-center justify-center px-4">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 700 200">
            <line x1="0" y1="40" x2="700" y2="40" stroke="#f0f0ed" strokeWidth="1" strokeDasharray="4 4" className="dark:stroke-neutral-800" />
            <line x1="0" y1="100" x2="700" y2="100" stroke="#f0f0ed" strokeWidth="1" strokeDasharray="4 4" className="dark:stroke-neutral-800" />
            <line x1="0" y1="160" x2="700" y2="160" stroke="#f0f0ed" strokeWidth="1" strokeDasharray="4 4" className="dark:stroke-neutral-800" />

            <path d="M 50 130 Q 170 80, 290 90 T 530 50 T 650 30" fill="none" stroke="#0A5C36" strokeWidth="3" />
            <path d="M 50 160 Q 170 140, 290 120 T 530 110 T 650 90" fill="none" stroke="#f97316" strokeWidth="3" />

            {[
              { x: 50, yMem: 130, yWalk: 160 },
              { x: 170, yMem: 95, yWalk: 145 },
              { x: 290, yMem: 90, yWalk: 120 },
              { x: 410, yMem: 70, yWalk: 115 },
              { x: 530, yMem: 50, yWalk: 110 },
              { x: 650, yMem: 30, yWalk: 90 },
            ].map((pt, idx) => (
              <g key={idx}>
                <circle cx={pt.x} cy={pt.yMem} r="5" fill="#ffffff" stroke="#0A5C36" strokeWidth="3" className="dark:fill-neutral-900" />
                <circle cx={pt.x} cy={pt.yWalk} r="5" fill="#ffffff" stroke="#f97316" strokeWidth="3" className="dark:fill-neutral-900" />
              </g>
            ))}
          </svg>
        </div>

        <div className="flex justify-between px-4 text-xs font-semibold text-stone-400 dark:text-neutral-500">
          <span>Jan</span>
          <span>Feb</span>
          <span>Mar</span>
          <span>Apr</span>
          <span>May</span>
          <span className="text-[#0A5C36] dark:text-emerald-400">Jun</span>
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-stone-200 dark:border-neutral-800 shadow-sm overflow-hidden transition-colors duration-200">
        <div className="p-6 border-b border-stone-200 dark:border-neutral-800 flex items-center justify-between">
          <h3 className="font-bold text-stone-900 dark:text-white text-base">Recent Transactions</h3>
          <button className="text-xs font-bold text-[#0A5C36] dark:text-emerald-400 hover:underline cursor-pointer">
            View All →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-200 dark:border-neutral-800 text-stone-400 dark:text-neutral-400 text-xs font-semibold tracking-wider bg-stone-50/50 dark:bg-neutral-800/40">
                <th className="py-3 px-6">TRANSACTION ID</th>
                <th className="py-3 px-6">DATE &amp; TIME</th>
                <th className="py-3 px-6">CUSTOMER NAME</th>
                <th className="py-3 px-6">REVENUE CATEGORY</th>
                <th className="py-3 px-6">PAYMENT METHOD</th>
                <th className="py-3 px-6 text-right">AMOUNT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-neutral-800 text-sm">
              {[
                { id: '#TRX-8924', date: 'Today, 10:42 AM', name: 'Jose Santos', cat: 'Membership Renewal', method: 'GCash', amount: '₱499.00' },
                { id: '#TRX-8923', date: 'Today, 09:15 AM', name: 'Guest User', cat: 'Daily Pass', method: 'Cash', amount: '₱25.00' },
                { id: '#TRX-8922', date: 'Yesterday, 04:30 PM', name: 'Alma Vera', cat: 'Membership Renewal', method: 'GCash', amount: '₱75.00' },
              ].map((trx, index) => (
                <tr key={index} className="hover:bg-stone-50/50 dark:hover:bg-neutral-800/50 transition">
                  <td className="py-4 px-6 font-medium text-stone-600 dark:text-neutral-400">{trx.id}</td>
                  <td className="py-4 px-6 text-stone-600 dark:text-neutral-400">{trx.date}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-stone-200 dark:bg-neutral-800 text-stone-700 dark:text-neutral-300 font-bold text-xs flex items-center justify-center">
                        {trx.name.split(' ').map(n => n[0]).join('')}
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
                  <td className="py-4 px-6 text-stone-600 dark:text-neutral-400">{trx.method}</td>
                  <td className="py-4 px-6 text-right font-bold text-stone-900 dark:text-white">{trx.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setDropdownOpen(false);
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-stone-100 dark:bg-neutral-950 flex font-sans select-none transition-colors duration-200">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white dark:bg-neutral-900 border-b border-stone-200 dark:border-neutral-800 h-16 flex items-center justify-between px-8 relative z-20 transition-colors duration-200">
          <span className="font-semibold text-stone-800 dark:text-neutral-200 text-sm">Gym Management</span>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-10 h-10 rounded-full bg-stone-200 dark:bg-neutral-800 flex items-center justify-center text-stone-600 dark:text-neutral-300 border border-stone-300 dark:border-neutral-700 hover:bg-stone-300 dark:hover:bg-neutral-700 transition cursor-pointer shadow-xs"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-2xl shadow-xl py-3 px-4 z-50 animate-in fade-in zoom-in-95 duration-150 transition-colors duration-200">
                <div className="pb-3 border-b border-stone-100 dark:border-neutral-800">
                  <h4 className="font-bold text-stone-900 dark:text-white text-sm">Lucas Admin</h4>
                  <span className="inline-block mt-1 px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[11px] font-semibold rounded-md">
                    System Administrator
                  </span>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleLogout}
                    className="w-full px-3 py-2 text-left text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition flex items-center space-x-2.5 cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        <main className="p-8 max-w-6xl w-full mx-auto flex-1">
          <Routes>
            <Route index element={<AdminReportsView />} />
            <Route path="employees" element={<Employees />} />
            <Route path="register-employee" element={<RegisterEmployee />} />
            <Route path="activity-log" element={<ActivityLog />} />
            <Route path="transaction" element={<Transactions />} />
            <Route path="settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}