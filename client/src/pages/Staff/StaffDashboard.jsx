import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function StaffDashboard() {
  const navigate = useNavigate();
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');

  const handleCheckInSubmit = (e) => {
    e.preventDefault();
    setIsCheckInModalOpen(false); // Isara ang form modal
    setIsSuccessModalOpen(true);  // Buksan ang success modal
  };

  return (
    <div className="space-y-6 relative transition-colors duration-200">
      {/* Header & Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-stone-900 dark:text-white">Dashboard Overview</h2>
          <p className="text-stone-500 dark:text-neutral-400 text-sm mt-1">Today's snapshot for Gym ni Lucas branch.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setIsCheckInModalOpen(true)}
            className="bg-[#8B4513] hover:bg-[#703610] text-white font-semibold px-5 py-2.5 rounded-xl text-sm shadow-md transition cursor-pointer"
          >
            Quick Member Check-in
          </button>
          <button 
            onClick={() => navigate('/walk-in-registration')}
            className="bg-[#0A5C36] hover:bg-[#074729] text-white font-medium px-4 py-2.5 rounded-xl text-sm shadow-sm transition flex items-center space-x-2 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            <span>Walk-in Registration</span>
          </button>
        </div>
      </div>

      {/* Stats Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-stone-200 dark:border-neutral-800 shadow-sm relative overflow-hidden transition-colors duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-xl flex items-center justify-center font-bold">
              👥
            </div>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full">+12%</span>
          </div>
          <p className="text-xs font-bold text-stone-400 dark:text-neutral-500 uppercase tracking-wider">CUSTOMERS TODAY</p>
          <h3 className="text-3xl font-extrabold text-stone-900 dark:text-white mt-1">24</h3>
        </div>

        <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-stone-200 dark:border-neutral-800 shadow-sm relative overflow-hidden transition-colors duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-xl flex items-center justify-center font-bold">
              ₱
            </div>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full">+5%</span>
          </div>
          <p className="text-xs font-bold text-stone-400 dark:text-neutral-500 uppercase tracking-wider">TODAY'S INCOME</p>
          <h3 className="text-3xl font-extrabold text-stone-900 dark:text-white mt-1">₱1,250</h3>
        </div>

        <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-stone-200 dark:border-neutral-800 shadow-sm relative overflow-hidden transition-colors duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 rounded-xl flex items-center justify-center font-bold">
              ⚠️
            </div>
          </div>
          <p className="text-xs font-bold text-stone-400 dark:text-neutral-500 uppercase tracking-wider">MEMBERSHIPS EXPIRING TODAY</p>
          <h3 className="text-3xl font-extrabold text-stone-900 dark:text-white mt-1">5</h3>
        </div>
      </div>

      {/* Real-time Activity Table Container */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-stone-200 dark:border-neutral-800 shadow-sm overflow-hidden transition-colors duration-200">
        <div className="p-6 border-b border-stone-200 dark:border-neutral-800 flex items-center justify-between">
          <h3 className="font-bold text-stone-900 dark:text-white text-base">Real-time Activity: Last 5 Walk-ins</h3>
          <button className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 text-sm font-semibold flex items-center space-x-1 cursor-pointer">
            <span>View All</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-200 dark:border-neutral-800 text-stone-400 dark:text-neutral-400 text-xs font-semibold tracking-wider bg-stone-50/50 dark:bg-neutral-800/40">
                <th className="py-3 px-6">MEMBER NAME</th>
                <th className="py-3 px-6">TIME</th>
                <th className="py-3 px-6">TYPE</th>
                <th className="py-3 px-6">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-neutral-800 text-sm">
              {[
                { name: 'Juan Dizon', time: '10:42 AM', type: 'Monthly Member', status: 'Active' },
                { name: 'Ana Santos', time: '10:15 AM', type: 'Walk-in', status: 'Active' },
                { name: 'Miguel Jacinto', time: '09:50 AM', type: 'Monthly Member', status: 'Expires Soon' },
                { name: 'Ella Cruz', time: '09:30 AM', type: 'Monthly Member', status: 'Active' },
                { name: 'Diego Bautista', time: '09:15 AM', type: 'Walk-in', status: 'Active' },
              ].map((row, index) => (
                <tr key={index} className="hover:bg-stone-50/50 dark:hover:bg-neutral-800/50 transition">
                  <td className="py-4 px-6 flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-stone-200 dark:bg-neutral-800 text-stone-700 dark:text-neutral-300 font-bold text-xs flex items-center justify-center">
                      {row.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span className="font-semibold text-stone-900 dark:text-white">{row.name}</span>
                  </td>
                  <td className="py-4 px-6 text-stone-600 dark:text-neutral-400">{row.time}</td>
                  <td className="py-4 px-6">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      row.type === 'Monthly Member' 
                        ? 'bg-stone-100 dark:bg-neutral-800 text-stone-700 dark:text-neutral-300' 
                        : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                    }`}>
                      {row.type}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                      row.status === 'Active' 
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300' 
                        : 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${row.status === 'Active' ? 'bg-emerald-600 dark:bg-emerald-400' : 'bg-red-600 dark:bg-red-400'}`}></span>
                      <span>{row.status}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Check-In Modal with Blurred Background */}
      {isCheckInModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-stone-200 dark:border-neutral-800 shadow-2xl max-w-md w-full p-8 relative animate-in fade-in zoom-in duration-200">
            <div className="text-center mb-6">
              <h3 className="text-xl font-extrabold text-[#004D40] dark:text-emerald-400">Member Check-In</h3>
              <p className="text-stone-500 dark:text-neutral-400 text-xs mt-1">Please enter your username and PIN to check-in</p>
            </div>

            <form onSubmit={handleCheckInSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-neutral-300 mb-1">Username:</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400 dark:text-neutral-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </span>
                  <input 
                    type="text" 
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-neutral-800 border border-stone-200 dark:border-neutral-700 rounded-xl text-stone-800 dark:text-white placeholder-stone-400 dark:placeholder-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#004D40]" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-neutral-300 mb-1">PIN:</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400 dark:text-neutral-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </span>
                  <input 
                    type="password" 
                    placeholder="Enter PIN"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-neutral-800 border border-stone-200 dark:border-neutral-700 rounded-xl text-stone-800 dark:text-white placeholder-stone-400 dark:placeholder-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#004D40]" 
                  />
                </div>
              </div>

              <div className="pt-2">
                <button 
                  type="submit"
                  className="w-full py-3 bg-[#004D40] hover:bg-[#00382E] text-white rounded-xl text-sm font-bold shadow-md transition flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <span>Check-In</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>

              <div className="text-center pt-1">
                <button 
                  type="button"
                  onClick={() => setIsCheckInModalOpen(false)}
                  className="text-xs text-stone-500 dark:text-neutral-400 hover:text-stone-800 dark:hover:text-white transition cursor-pointer"
                >
                  × Cancel and Return to Dashboard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-stone-200 dark:border-neutral-800 shadow-2xl max-w-md w-full p-8 text-center relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setIsSuccessModalOpen(false)}
              className="absolute top-5 right-5 text-stone-400 dark:text-neutral-500 hover:text-stone-600 dark:hover:text-neutral-300 transition cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950 text-[#0A5C36] dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h3 className="text-xl font-extrabold text-[#0A5C36] dark:text-emerald-400">Check-In Successful</h3>

            <div className="my-5">
              <div className="w-16 h-16 bg-stone-200 dark:bg-neutral-800 rounded-2xl mx-auto mb-2 flex items-center justify-center text-stone-600 dark:text-neutral-300 font-bold text-lg shadow-inner">
                MJ
              </div>
              <h4 className="font-bold text-stone-900 dark:text-white text-base">Marco Jimenez</h4>
              <p className="text-xs text-stone-400 dark:text-neutral-500">marcoj</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-left mb-6">
              <div className="bg-stone-50 dark:bg-neutral-800/60 p-4 rounded-2xl border border-stone-200 dark:border-neutral-700">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-stone-400 dark:text-neutral-500 uppercase">Membership Status</span>
                  <svg className="w-4 h-4 text-stone-500 dark:text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="font-bold text-stone-900 dark:text-white text-xs">Monthly Membership</p>
                <p className="text-[10px] text-stone-500 dark:text-neutral-400 mt-0.5">Expires in 45 days (Oct 15, 2024)</p>
                <span className="inline-block mt-2 px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-semibold rounded-full">
                  ● Active
                </span>
              </div>

              <div className="bg-stone-50 dark:bg-neutral-800/60 p-4 rounded-2xl border border-stone-200 dark:border-neutral-700">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-stone-400 dark:text-neutral-500 uppercase">Current Weight</span>
                  <svg className="w-4 h-4 text-stone-500 dark:text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                  </svg>
                </div>
                <p className="font-bold text-stone-900 dark:text-white text-xs mt-1">176 lbs / 79.8 kg</p>
                <p className="text-[10px] text-stone-500 dark:text-neutral-400 mt-6">(Recorded: Oct 1, 2024)</p>
              </div>
            </div>

            <button 
              onClick={() => setIsSuccessModalOpen(false)}
              className="w-full py-3.5 bg-[#004D40] hover:bg-[#00382E] text-white rounded-xl text-sm font-bold shadow-md transition cursor-pointer mb-2"
            >
              Done
            </button>
            <p className="text-[11px] text-stone-400 dark:text-neutral-500">This window will automatically close in 0 seconds.</p>
          </div>
        </div>
      )}
    </div>
  );
}