import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';

export default function Settings() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  const [plans, setPlans] = useState([
    { id: 1, name: 'Monthly Membership', type: 'Recurring', rate: '49.99', unit: '/mo', badgeStyle: 'bg-emerald-100 text-emerald-800' },
    { id: 2, name: 'Day Pass', type: 'One-Time', rate: '15.00', unit: '/visit', badgeStyle: 'bg-orange-100 text-orange-800' }
  ]);

  const handleRateChange = (id, newRate) => {
    if (!isAdmin) return;
    setPlans(plans.map(p => p.id === id ? { ...p, rate: newRate } : p));
  };

  const handleSave = (planName) => {
    if (!isAdmin) return;
    alert(`Successfully saved changes for ${planName}!`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-bold text-stone-900">Settings</h2>
            {!isAdmin && (
              <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2.5 py-0.5 rounded-md tracking-wider">
                STAFF VIEW ONLY
              </span>
            )}
          </div>
          <p className="text-stone-500 text-sm mt-1">Manage subscription plans and the rates members are billed.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-stone-200 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-base">Subscription Plans</h3>
              <p className="text-xs text-stone-500">{plans.length} plans - {plans.length} active</p>
            </div>
          </div>

          <button 
            disabled={!isAdmin}
            onClick={() => alert('Add plan feature')}
            className={`font-semibold px-4 py-2 rounded-xl text-xs shadow-sm transition flex items-center space-x-1.5 ${
              isAdmin 
                ? 'bg-[#0A5C36] hover:bg-[#074729] text-white cursor-pointer' 
                : 'bg-stone-200 text-stone-400 cursor-not-allowed'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>Add plan</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-200 text-stone-400 text-xs font-semibold tracking-wider bg-stone-50/30">
                <th className="py-3.5 px-6">PLAN NAME</th>
                <th className="py-3.5 px-6">TYPE</th>
                <th className="py-3.5 px-6">RATE (PHP)</th>
                <th className="py-3.5 px-6 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-sm">
              {plans.map((plan) => (
                <tr key={plan.id} className="hover:bg-stone-50/50 transition">
                  <td className="py-4 px-6 font-semibold text-stone-900">{plan.name}</td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${plan.badgeStyle}`}>
                      {plan.type}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <span className="text-stone-500 font-medium">₱</span>
                      <input 
                        type="text" 
                        value={plan.rate}
                        onChange={(e) => handleRateChange(plan.id, e.target.value)}
                        disabled={!isAdmin}
                        className={`w-28 px-3 py-1.5 border border-stone-200 rounded-lg text-stone-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0A5C36] ${
                          !isAdmin ? 'bg-stone-50 text-stone-500 cursor-not-allowed' : 'bg-white'
                        }`}
                      />
                      <span className="text-xs text-stone-400 font-medium">{plan.unit}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button 
                      disabled={!isAdmin}
                      onClick={() => handleSave(plan.name)}
                      className={`px-4 py-1.5 border rounded-xl text-xs font-semibold transition ${
                        isAdmin 
                          ? 'border-stone-300 text-stone-700 hover:bg-stone-50 cursor-pointer' 
                          : 'border-stone-200 text-stone-300 bg-stone-50 cursor-not-allowed'
                      }`}
                    >
                      Save
                    </button>
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