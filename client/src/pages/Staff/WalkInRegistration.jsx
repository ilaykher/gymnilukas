import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function WalkInRegistration() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amountPaid, setAmountPaid] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Matagumpay na na-rehistro si ${fullName} bilang Walk-in!`);
    navigate('/');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10 transition-colors duration-200">
      
      {/* Header & Back Link */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div>
          <h2 className="text-2xl font-bold text-stone-900 dark:text-white">Manual Walk-in Registration</h2>
          <p className="text-stone-500 dark:text-neutral-400 text-sm mt-0.5">Quick entry form for non-members and single-session visitors.</p>
        </div>
        <button 
          onClick={() => navigate('/')} 
          className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 text-sm font-semibold flex items-center space-x-1 transition cursor-pointer self-start md:self-auto"
        >
          <span>← Back to Check-in</span>
        </button>
      </div>

      {/* Main Card Form */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-stone-200 dark:border-neutral-800 shadow-sm p-6 md:p-8 space-y-6 transition-colors duration-200">
        
        {/* Section Title */}
        <div className="flex items-center space-x-2 border-b border-stone-200 dark:border-neutral-800 pb-4">
          <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-lg flex items-center justify-center font-bold text-sm">
            👤+
          </div>
          <h3 className="font-bold text-stone-900 dark:text-white text-base">Visitor Details</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Row 1: Full Name & Phone Number */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-stone-500 dark:text-neutral-400 uppercase tracking-wider mb-2">
                Full Name
              </label>
              <input
                type="text"
                placeholder="Julia Dizon"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-neutral-800 border border-stone-300 dark:border-neutral-700 rounded-xl text-stone-800 dark:text-white placeholder-stone-400 dark:placeholder-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A5C36]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-500 dark:text-neutral-400 uppercase tracking-wider mb-2">
                Phone Number
              </label>
              <input
                type="text"
                placeholder="09XX XXX 0001"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-neutral-800 border border-stone-300 dark:border-neutral-700 rounded-xl text-stone-800 dark:text-white placeholder-stone-400 dark:placeholder-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A5C36]"
                required
              />
            </div>
          </div>

          {/* Pass Selection */}
          <div>
            <label className="block text-xs font-semibold text-stone-500 dark:text-neutral-400 uppercase tracking-wider mb-2">
              PASS SELECTION
            </label>
            <div className="border-2 border-[#0A5C36] bg-emerald-50/20 dark:bg-emerald-950/30 p-4 rounded-2xl cursor-pointer">
              <h4 className="font-bold text-stone-900 dark:text-white text-sm">Day Pass</h4>
              <p className="text-stone-500 dark:text-neutral-400 text-xs mt-0.5">Unlimited access for 24 hours.</p>
            </div>
          </div>

          {/* Amount Paid */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-stone-500 dark:text-neutral-400 uppercase tracking-wider">
                Amount Paid
              </label>
              <span className="text-xs text-stone-500 dark:text-neutral-400 font-medium">Suggested: ₱15.00</span>
            </div>
            <div className="relative max-w-md">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-stone-400 dark:text-neutral-500 font-bold">₱</span>
              <input
                type="text"
                placeholder="0.00"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                className="w-full pl-9 pr-4 py-3 bg-white dark:bg-neutral-800 border border-stone-300 dark:border-neutral-700 rounded-xl text-stone-800 dark:text-white placeholder-stone-400 dark:placeholder-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A5C36]"
                required
              />
            </div>
          </div>

          {/* Bottom Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-stone-200 dark:border-neutral-800">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-6 py-2.5 border border-stone-300 dark:border-neutral-700 hover:bg-stone-50 dark:hover:bg-neutral-800 text-stone-700 dark:text-neutral-300 font-semibold rounded-xl text-sm transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl text-sm shadow-md transition flex items-center space-x-2 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              <span>Complete Registration</span>
            </button>
          </div>

        </form>
      </div>

      {/* Walk-Ins Today Footer Card */}
      <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-stone-200 dark:border-neutral-800 shadow-sm inline-block min-w-[200px] transition-colors duration-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-stone-100 dark:bg-neutral-800 rounded-xl flex items-center justify-center text-stone-600 dark:text-neutral-300">
            👥
          </div>
          <div>
            <p className="text-xs font-bold text-stone-400 dark:text-neutral-500 uppercase tracking-wider">Walk-Ins Today</p>
            <h4 className="text-xl font-extrabold text-stone-900 dark:text-white">12</h4>
          </div>
        </div>
      </div>

    </div>
  );
}