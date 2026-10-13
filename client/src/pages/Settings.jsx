import React, { useState } from 'react';

export default function Settings() {
  // State para sa editable rates kung sakaling baguhin ng user
  const [plans, setPlans] = useState([
    { id: 1, name: 'Monthly Membership', type: 'Recurring', rate: '49.99', unit: '/ mo' },
    { id: 2, name: 'Day Pass', type: 'One-Time', rate: '15.00', unit: '/ visit' }
  ]);

  const handleRateChange = (id, newRate) => {
    setPlans(plans.map(p => p.id === id ? { ...p, rate: newRate } : p));
  };

  const handleSave = (planName) => {
    alert(`Na-save ang bagong rate para sa ${planName}!`);
  };

  return (
    <div className="space-y-6">
      {/* Header Title & Subtitle */}
      <div>
        <div className="flex items-center space-x-3">
          <h2 className="text-2xl font-bold text-stone-900">Settings</h2>
          <span className="px-2.5 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded-md uppercase tracking-wide">
            Staff View Only
          </span>
        </div>
        <p className="text-stone-500 text-sm mt-1">Manage subscription plans and the rates members are billed.</p>
      </div>

      {/* Subscription Plans Card Container */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        
        {/* Card Header */}
        <div className="p-6 border-b border-stone-200 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-base">Subscription Plans</h3>
              <p className="text-xs text-stone-500">2 plans · 2 active</p>
            </div>
          </div>

          <button className="flex items-center space-x-2 bg-[#0A5C36] hover:bg-[#074729] text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm transition">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>Add plan</span>
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-200 text-stone-400 text-xs font-semibold tracking-wider bg-stone-50/50">
                <th className="py-3 px-6">PLAN NAME</th>
                <th className="py-3 px-6">TYPE</th>
                <th className="py-3 px-6">RATE (PHP)</th>
                <th className="py-3 px-6 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-sm">
              {plans.map((plan) => (
                <tr key={plan.id} className="hover:bg-stone-50/50 transition">
                  
                  {/* Plan Name */}
                  <td className="py-4 px-6 font-semibold text-stone-900">
                    {plan.name}
                  </td>

                  {/* Type Badge */}
                  <td className="py-4 px-6">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      plan.type === 'Recurring' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {plan.type}
                    </span>
                  </td>

                  {/* Rate Input */}
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2 max-w-[180px]">
                      <span className="text-stone-500 font-medium">₱</span>
                      <input
                        type="text"
                        value={plan.rate}
                        onChange={(e) => handleRateChange(plan.id, e.target.value)}
                        className="w-full bg-white border border-stone-300 rounded-lg px-3 py-1.5 text-stone-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#0A5C36] text-sm"
                      />
                      <span className="text-stone-400 text-xs whitespace-nowrap">{plan.unit}</span>
                    </div>
                  </td>

                  {/* Action Button */}
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => handleSave(plan.name)}
                      className="px-4 py-1.5 border border-stone-300 hover:border-stone-400 text-stone-700 hover:bg-stone-50 rounded-lg text-sm font-medium transition shadow-sm"
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