import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function MemberCheckIn() {
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');

  const handleCheckIn = (e) => {
    e.preventDefault();
    // Dito mo ilalagay ang logic para sa pag-check-in ng member (API call, atbp.)
    console.log('Checking in:', { username, pin });
    alert(`Checking in member: ${username}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 font-sans">
      {/* Subtle background gradient/texture */}
      <div className="fixed inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(#e0e7e2 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

      <div className="w-full max-w-md px-6 py-12 z-10">
        
        {/* Header Text */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-stone-900">Member Check-In</h2>
          <p className="text-stone-600 mt-2 text-sm">Please enter your username and PIN to check-in</p>
        </div>

        {/* Check-In Card */}
        <form onSubmit={handleCheckIn} className="bg-white p-8 rounded-3xl border border-stone-200 shadow-xl space-y-6">
          
          {/* Username Field */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-stone-700 mb-2">
              Username:
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-stone-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </span>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full pl-12 pr-4 py-3 bg-white border border-stone-300 rounded-xl text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#0A5C36]/50 focus:border-[#0A5C36] text-sm transition"
                required
              />
            </div>
          </div>

          {/* PIN Field */}
          <div>
            <label htmlFor="pin" className="block text-sm font-medium text-stone-700 mb-2">
              PIN:
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-stone-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </span>
              <input
                id="pin"
                type="password" // Ginawang password type para sa security
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Enter PIN"
                className="w-full pl-12 pr-4 py-3 bg-white border border-stone-300 rounded-xl text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#0A5C36]/50 focus:border-[#0A5C36] text-sm transition"
                required
              />
            </div>
          </div>

          {/* Check-In Button */}
          <button
            type="submit"
            className="w-full flex items-center justify-center space-x-2.5 bg-[#0A5C36] hover:bg-[#074729] text-white py-3.5 px-6 rounded-xl font-semibold text-sm shadow-md transition-all duration-150 active:scale-[0.98]"
          >
            <span>Check-In</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>

        </form>

        {/* Cancel Link */}
        <div className="text-center mt-6">
          <Link to="/" className="text-sm text-stone-500 hover:text-stone-900 transition flex items-center justify-center space-x-1.5">
            <span>×</span>
            <span>Cancel and Return to Dashboard</span>
          </Link>
        </div>

      </div>
    </div>
  );
}