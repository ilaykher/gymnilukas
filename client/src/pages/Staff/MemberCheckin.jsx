import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function MemberCheckIn() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const handleCheckIn = (e) => {
    e.preventDefault();
    setIsSuccessModalOpen(true);
  };

  return (
    <div className="max-w-xl mx-auto py-12 select-none">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-[#0A5C36]">Member Check-In</h2>
        <p className="text-stone-500 text-sm mt-1">Please enter your username and PIN to check-in</p>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200 shadow-xl p-8 max-w-lg mx-auto">
        <form onSubmit={handleCheckIn} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">Username:</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
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
                className="w-full pl-10 pr-4 py-3 bg-white border border-stone-200 rounded-xl text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A5C36]" 
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">PIN:</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
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
                className="w-full pl-10 pr-4 py-3 bg-white border border-stone-200 rounded-xl text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A5C36]" 
              />
            </div>
          </div>

          <div className="pt-2">
            <button 
              type="submit"
              className="w-full py-3.5 bg-[#004D40] hover:bg-[#00382E] text-white rounded-xl text-sm font-bold shadow-md transition flex items-center justify-center space-x-2 cursor-pointer"
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
                onClick={() => navigate('/')}
                className="text-xs text-stone-500 hover:text-stone-800 transition cursor-pointer"
              >
                × Cancel and Return to Dashboard
              </button>

          </div>
        </form>
      </div>

      {isSuccessModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200 p-8 text-center relative">
            <button 
              onClick={() => setIsSuccessModalOpen(false)}
              className="absolute top-5 right-5 text-stone-400 hover:text-stone-600 transition cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="w-14 h-14 bg-emerald-100 text-[#0A5C36] rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h3 className="text-xl font-extrabold text-[#0A5C36]">Check-In Successful</h3>

            <div className="my-5">
              <div className="w-16 h-16 bg-stone-200 rounded-2xl mx-auto mb-2 flex items-center justify-center text-stone-600 font-bold text-lg shadow-inner">
                MJ
              </div>
              <h4 className="font-bold text-stone-900 text-base">Marco Jimenez</h4>
              <p className="text-xs text-stone-400">marcoj</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-left mb-6">
              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-stone-400 uppercase">Membership Status</span>
                  <svg className="w-4 h-4 text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="font-bold text-stone-900 text-xs">Monthly Membership</p>
                <p className="text-[10px] text-stone-500 mt-0.5">Expires in 45 days (Oct 15, 2024)</p>
                <span className="inline-block mt-2 px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-semibold rounded-full">
                  ● Active
                </span>
              </div>

              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-stone-400 uppercase">Current Weight</span>
                  <svg className="w-4 h-4 text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                  </svg>
                </div>
                <p className="font-bold text-stone-900 text-xs mt-1">176 lbs / 79.8 kg</p>
                <p className="text-[10px] text-stone-500 mt-6">(Recorded: Oct 1, 2024)</p>
              </div>
            </div>

            <button 
              onClick={() => {
                setIsSuccessModalOpen(false);
                navigate('/staff');
              }}
              className="w-full py-3.5 bg-[#004D40] hover:bg-[#00382E] text-white rounded-xl text-sm font-bold shadow-md transition cursor-pointer mb-2"
            >
              Done
            </button>
            <p className="text-[11px] text-stone-400">This window will automatically close in 0 seconds.</p>
          </div>
        </div>
      )}
    </div>
  );
}