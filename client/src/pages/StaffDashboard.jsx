import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function StaffDashboard() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Header & Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-stone-900">Dashboard Overview</h2>
          <p className="text-stone-500 text-sm mt-1">Today's snapshot for Gym ni Lucas branch.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => navigate('/check-in')}
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
        {/* Card 1 */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center font-bold">
              👥
            </div>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">+12%</span>
          </div>
          <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">CUSTOMERS TODAY</p>
          <h3 className="text-3xl font-extrabold text-stone-900 mt-1">24</h3>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center font-bold">
              ₱
            </div>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">+5%</span>
          </div>
          <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">TODAY'S INCOME</p>
          <h3 className="text-3xl font-extrabold text-stone-900 mt-1">₱1,250</h3>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-red-100 text-red-600 rounded-xl flex items-center justify-center font-bold">
              ⚠️
            </div>
          </div>
          <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">MEMBERSHIPS EXPIRING TODAY</p>
          <h3 className="text-3xl font-extrabold text-stone-900 mt-1">5</h3>
        </div>
      </div>

      {/* Real-time Activity Table Container */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-stone-200 flex items-center justify-between">
          <h3 className="font-bold text-stone-900 text-base">Real-time Activity: Last 5 Walk-ins</h3>
          <button className="text-emerald-700 hover:text-emerald-800 text-sm font-semibold flex items-center space-x-1 cursor-pointer">
            <span>View All</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-200 text-stone-400 text-xs font-semibold tracking-wider bg-stone-50/50">
                <th className="py-3 px-6">MEMBER NAME</th>
                <th className="py-3 px-6">TIME</th>
                <th className="py-3 px-6">TYPE</th>
                <th className="py-3 px-6">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-sm">
              {[
                { name: 'Juan Dizon', time: '10:42 AM', type: 'Monthly Member', status: 'Active' },
                { name: 'Ana Santos', time: '10:15 AM', type: 'Walk-in', status: 'Active' },
                { name: 'Miguel Jacinto', time: '09:50 AM', type: 'Monthly Member', status: 'Expires Soon' },
                { name: 'Ella Cruz', time: '09:30 AM', type: 'Monthly Member', status: 'Active' },
                { name: 'Diego Bautista', time: '09:15 AM', type: 'Walk-in', status: 'Active' },
              ].map((row, index) => (
                <tr key={index} className="hover:bg-stone-50/50 transition">
                  <td className="py-4 px-6 flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-stone-200 text-stone-700 font-bold text-xs flex items-center justify-center">
                      {row.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span className="font-semibold text-stone-900">{row.name}</span>
                  </td>
                  <td className="py-4 px-6 text-stone-600">{row.time}</td>
                  <td className="py-4 px-6">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      row.type === 'Monthly Member' ? 'bg-stone-100 text-stone-700' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {row.type}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                      row.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-700'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${row.status === 'Active' ? 'bg-emerald-600' : 'bg-red-600'}`}></span>
                      <span>{row.status}</span>
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