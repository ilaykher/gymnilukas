import React, { useState } from 'react';

export default function MemberProfile() {
  // State para sa Reset Password modal
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // State para sa Add Body Weight modal
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
  const [bodyWeight, setBodyWeight] = useState('');
  
  // States para sa Renew Monthly Membership modal
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [membershipType, setMembershipType] = useState('Student'); // 'Student' o 'Regular'
  const [paymentMethod, setPaymentMethod] = useState('Cash'); // 'Cash' o 'GCash'
  
  // ✨ [BAGO/INUPDATE]: State para sa 13-digit reference number input sa GCash payment
  const [gcashRef, setGcashRef] = useState('');

  // Kunin ang kasalukuyang petsa para sa auto-generation ng weight
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  const handleResetPasswordSubmit = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('Hindi magkatugma ang mga password!');
      return;
    }
    alert('Matagumpay na na-reset ang password ng miyembro!');
    setIsResetModalOpen(false);
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleAddWeightSubmit = (e) => {
    e.preventDefault();
    alert(`Matagumpay na naidagdag ang bigat na ${bodyWeight} lbs!`);
    setIsWeightModalOpen(false);
    setBodyWeight('');
  };

  // Handler para sa Renewal Submission
  const handleRenewSubmit = (e) => {
    e.preventDefault();
    if (paymentMethod === 'GCash' && !gcashRef) {
      alert('Mangyaring ilagay ang 13-digit GCash Reference Number.');
      return;
    }
    const amount = membershipType === 'Student' ? '₱350.00' : '₱450.00';
    alert(`Matagumpay na na-renew ang membership (${membershipType} Rate) via ${paymentMethod} amounting to ${amount}!`);
    setIsRenewModalOpen(false);
    setGcashRef('');
  };

  const isAnyModalOpen = isResetModalOpen || isWeightModalOpen || isRenewModalOpen;

  // Dynamic price computation
  const currentPrice = membershipType === 'Student' ? '₱350.00' : '₱450.00';

  return (
    <div className="relative min-h-screen transition-colors duration-200">
      {/* Blur effect sa buong page kapag mayroong alinmang modal na bukas */}
      <div className={`space-y-6 transition duration-200 ${isAnyModalOpen ? 'filter blur-sm pointer-events-none select-none' : ''}`}>
        
        {/* Breadcrumb / Top Header */}
        <div className="text-sm text-stone-500 dark:text-neutral-400 flex items-center space-x-2">
          <span className="text-[#0A5C36] dark:text-emerald-400 font-medium">Gym Management</span>
          <span>/</span>
          <span>Dashboard</span>
        </div>

        {/* Title & Subtitle */}
        <div>
          <h2 className="text-2xl font-bold text-stone-900 dark:text-white">Member Profile</h2>
          <p className="text-stone-500 dark:text-neutral-400 text-sm mt-1">Manage member details, history, and billing.</p>
        </div>

        {/* Main Grid Container (Responsive) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT COLUMN: Profile Card */}
          <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-stone-200 dark:border-neutral-800 shadow-sm flex flex-col items-center text-center space-y-4 transition-colors duration-200">
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" 
                alt="Marco Jimenez" 
                className="w-24 h-24 rounded-full object-cover border-4 border-stone-100 dark:border-neutral-800 shadow-sm"
              />
            </div>

            <div>
              <h3 className="text-xl font-bold text-stone-900 dark:text-white">Marco Jimenez</h3>
              <p className="text-xs text-stone-500 dark:text-neutral-400 mt-0.5 flex items-center justify-center space-x-1">
                <span>Username: marcoj</span>
                <svg className="w-3.5 h-3.5 cursor-pointer text-stone-400 dark:text-neutral-500 hover:text-stone-600 dark:hover:text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </p>
            </div>

            {/* Status Badge */}
            <div className="w-full bg-stone-50 dark:bg-neutral-800/60 p-3 rounded-xl flex items-center justify-between border border-stone-200/60 dark:border-neutral-700">
              <span className="text-xs font-semibold text-stone-500 dark:text-neutral-400 uppercase">Status</span>
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400"></span>
                <span>Active</span>
              </span>
            </div>

            {/* Contact & Address Details */}
            <div className="w-full text-left space-y-3 pt-2 border-t border-stone-100 dark:border-neutral-800 text-sm">
              <div>
                <span className="text-xs font-bold text-stone-400 dark:text-neutral-500 uppercase tracking-wider block">Phone</span>
                <p className="text-stone-800 dark:text-neutral-200 font-medium mt-0.5">09XX XXX 0005</p>
              </div>
              <div>
                <span className="text-xs font-bold text-stone-400 dark:text-neutral-500 uppercase tracking-wider block">Address</span>
                <p className="text-stone-800 dark:text-neutral-200 font-medium mt-0.5">North Cal</p>
              </div>
            </div>

            {/* Account Security Button */}
            <div className="w-full pt-4 border-t border-stone-100 dark:border-neutral-800">
              <span className="text-xs font-bold text-stone-400 dark:text-neutral-500 uppercase tracking-wider block text-left mb-2">Account Security</span>
              <button 
                onClick={() => setIsResetModalOpen(true)}
                className="w-full border border-stone-300 dark:border-neutral-700 hover:border-stone-400 dark:hover:border-neutral-500 text-stone-700 dark:text-neutral-200 py-2 rounded-xl text-sm font-medium transition flex items-center justify-center space-x-2 cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                <span>Reset Password</span>
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: Membership & History */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Membership Banner Card */}
            <div className="bg-[#0A5C36] dark:bg-emerald-900 text-white p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm transition-colors duration-200">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-white shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold">Monthly Membership</h3>
                  <p className="text-emerald-200 text-xs mt-0.5">Expires in 45 days (Oct 15, 2024)</p>
                </div>
              </div>
              
              <button 
                onClick={() => setIsRenewModalOpen(true)}
                className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm shadow-md transition whitespace-nowrap cursor-pointer"
              >
                Renew Now
              </button>
            </div>

            {/* Recent Check-ins Card */}
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-stone-200 dark:border-neutral-800 shadow-sm overflow-hidden transition-colors duration-200">
              <div className="p-6 border-b border-stone-200 dark:border-neutral-800">
                <h3 className="font-bold text-stone-900 dark:text-white text-base">Recent Check-ins</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-stone-200 dark:border-neutral-800 text-stone-400 dark:text-neutral-400 text-xs font-semibold tracking-wider bg-stone-50/50 dark:bg-neutral-800/40">
                      <th className="py-3 px-6">DATE</th>
                      <th className="py-3 px-6 text-right">TIME</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-neutral-800 text-sm">
                    {[
                      { date: 'Oct 12, 2024', time: '08:30 AM' },
                      { date: 'Oct 10, 2024', time: '06:15 PM' },
                      { date: 'Oct 08, 2024', time: '07:00 AM' },
                    ].map((row, index) => (
                      <tr key={index} className="hover:bg-stone-50/50 dark:hover:bg-neutral-800/50 transition">
                        <td className="py-4 px-6 text-stone-800 dark:text-neutral-200 font-medium">{row.date}</td>
                        <td className="py-4 px-6 text-stone-600 dark:text-neutral-400 text-right">{row.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Body Metrics Card */}
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-stone-200 dark:border-neutral-800 shadow-sm overflow-hidden p-6 transition-colors duration-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-stone-900 dark:text-white text-base">Body Metrics</h3>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => setIsWeightModalOpen(true)}
                    className="border border-stone-300 dark:border-neutral-700 hover:bg-stone-50 dark:hover:bg-neutral-800 px-3 py-1.5 rounded-lg text-xs font-semibold text-stone-700 dark:text-neutral-300 flex items-center space-x-1.5 transition cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    <span>Manage</span>
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-stone-100 dark:border-neutral-800 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-stone-700 dark:text-neutral-300">Weight</p>
                </div>
                <div className="text-right">
                  <p className="text-base font-bold text-stone-900 dark:text-white">176 lbs</p>
                  <p className="text-xs text-stone-400 dark:text-neutral-500">Oct 1, 2024</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* MODAL 1: RESET PASSWORD */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-stone-200 dark:border-neutral-800 shadow-2xl max-w-md w-full p-6 md:p-8 space-y-6 relative animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-stone-900 dark:text-white">Reset Member Password</h3>
                <p className="text-xs text-stone-500 dark:text-neutral-400 mt-1">Enter a new secure password for Marco Jimenez.</p>
              </div>
              <button 
                onClick={() => setIsResetModalOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-100 dark:bg-neutral-800 text-stone-500 dark:text-neutral-400 hover:bg-stone-200 dark:hover:bg-neutral-700 flex items-center justify-center transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-600 dark:text-neutral-300 uppercase tracking-wider mb-1.5">New Password</label>
                <input 
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-neutral-800 border border-stone-300 dark:border-neutral-700 rounded-xl text-stone-800 dark:text-white placeholder-stone-400 dark:placeholder-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A5C36]"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 dark:text-neutral-300 uppercase tracking-wider mb-1.5">Confirm Password</label>
                <input 
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-neutral-800 border border-stone-300 dark:border-neutral-700 rounded-xl text-stone-800 dark:text-white placeholder-stone-400 dark:placeholder-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A5C36]"
                  required
                />
              </div>
              <div className="flex items-center space-x-3 pt-2">
                <button type="button" onClick={() => setIsResetModalOpen(false)} className="w-1/2 border border-stone-300 dark:border-neutral-700 hover:bg-stone-50 dark:hover:bg-neutral-800 text-stone-700 dark:text-neutral-300 font-semibold py-2.5 rounded-xl text-sm transition cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="w-1/2 bg-[#0A5C36] hover:bg-[#074729] text-white font-semibold py-2.5 rounded-xl text-sm shadow-md transition cursor-pointer">
                  Save Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD BODY WEIGHT */}
      {isWeightModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-stone-200 dark:border-neutral-800 shadow-2xl max-w-md w-full p-6 md:p-8 space-y-6 relative animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-stone-900 dark:text-white">Add Body Weight</h3>
              <button 
                onClick={() => setIsWeightModalOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-100 dark:bg-neutral-800 text-stone-500 dark:text-neutral-400 hover:bg-stone-200 dark:hover:bg-neutral-700 flex items-center justify-center transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddWeightSubmit} className="space-y-5">
              <div>
                <label htmlFor="bodyWeight" className="block text-sm font-medium text-stone-700 dark:text-neutral-300 mb-2">Body Weight</label>
                <input
                  id="bodyWeight"
                  type="text"
                  value={bodyWeight}
                  onChange={(e) => setBodyWeight(e.target.value)}
                  placeholder="e.g. 176 lbs"
                  className="w-full px-4 py-3 bg-stone-50 dark:bg-neutral-800 border border-stone-200 dark:border-neutral-700 rounded-xl text-stone-800 dark:text-white placeholder:text-stone-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#0A5C36]/50 focus:border-[#0A5C36] text-sm transition"
                  required
                />
              </div>

              <div>
                <p className="text-sm text-stone-600 dark:text-neutral-400">Date: <span className="font-medium text-stone-800 dark:text-neutral-200">{currentDate} (Auto-generated)</span></p>
              </div>

              <div className="flex items-center space-x-3 pt-3 border-t border-stone-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsWeightModalOpen(false)}
                  className="w-1/2 bg-stone-100 dark:bg-neutral-800 hover:bg-stone-200 dark:hover:bg-neutral-700 text-stone-800 dark:text-neutral-200 font-semibold py-3 rounded-xl text-sm transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-[#0A5C36] hover:bg-[#074729] text-white font-semibold py-3 rounded-xl text-sm shadow-md transition cursor-pointer"
                >
                  Save Weight
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: RENEW MONTHLY MEMBERSHIP */}
      {isRenewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-stone-200 dark:border-neutral-800 shadow-2xl max-w-lg w-full p-6 md:p-8 space-y-6 relative max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-neutral-800 pb-4">
              <h3 className="text-xl font-bold text-[#0A5C36] dark:text-emerald-400">Renew Monthly Membership</h3>
              <button 
                onClick={() => setIsRenewModalOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-100 dark:bg-neutral-800 text-stone-500 dark:text-neutral-400 hover:bg-stone-200 dark:hover:bg-neutral-700 flex items-center justify-center transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRenewSubmit} className="space-y-5">
              
              {/* Renewal Summary Box */}
              <div className="bg-stone-50 dark:bg-neutral-800/60 border border-stone-200/80 dark:border-neutral-700 rounded-2xl p-4 space-y-2 text-xs md:text-sm">
                <p className="text-stone-400 dark:text-neutral-400 font-bold uppercase tracking-wider text-[10px]">Renewal Summary</p>
                <div className="flex justify-between text-stone-700 dark:text-neutral-300">
                  <span>Current Expiry:</span>
                  <span className="font-semibold text-stone-900 dark:text-white">Oct 15, 2024</span>
                </div>
                <div className="flex justify-between text-stone-700 dark:text-neutral-300">
                  <span>Renewal Term:</span>
                  <span className="font-semibold text-stone-900 dark:text-white">1 Month</span>
                </div>
                <div className="flex justify-between text-stone-700 dark:text-neutral-300">
                  <span>New Expiry Date:</span>
                  <span className="font-semibold text-[#0A5C36] dark:text-emerald-400">Nov 15, 2024</span>
                </div>
              </div>

              {/* Select Membership Tier / Rate */}
              <div>
                <label className="block text-[10px] font-bold text-stone-400 dark:text-neutral-400 uppercase tracking-wider mb-2">
                  Select Membership Tier
                </label>
                <div className="space-y-2.5">
                  {/* Regular Rate Option */}
                  <div 
                    onClick={() => setMembershipType('Regular')}
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition flex items-center justify-between ${
                      membershipType === 'Regular' 
                        ? 'border-[#0A5C36] bg-[#0A5C36]/5 dark:bg-emerald-950/30' 
                        : 'border-stone-200 dark:border-neutral-700 hover:border-stone-300 dark:hover:border-neutral-600'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <input 
                        type="radio" 
                        name="membershipType" 
                        checked={membershipType === 'Regular'} 
                        onChange={() => setMembershipType('Regular')}
                        className="accent-[#0A5C36] w-4 h-4"
                      />
                      <div>
                        <p className="font-bold text-stone-900 dark:text-white text-sm">Regular Rate</p>
                      </div>
                    </div>
                    <span className="font-extrabold text-stone-900 dark:text-white text-sm">₱450.00</span>
                  </div>

                  {/* Student Rate Option */}
                  <div 
                    onClick={() => setMembershipType('Student')}
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition flex items-center justify-between ${
                      membershipType === 'Student' 
                        ? 'border-[#0A5C36] bg-[#0A5C36]/5 dark:bg-emerald-950/30' 
                        : 'border-stone-200 dark:border-neutral-700 hover:border-stone-300 dark:hover:border-neutral-600'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <input 
                        type="radio" 
                        name="membershipType" 
                        checked={membershipType === 'Student'} 
                        onChange={() => setMembershipType('Student')}
                        className="accent-[#0A5C36] w-4 h-4"
                      />
                      <div>
                        <p className="font-bold text-stone-900 dark:text-white text-sm">Student Rate</p>
                        <p className="text-[11px] text-stone-500 dark:text-neutral-400">Requires valid Student ID verification upon check-in</p>
                      </div>
                    </div>
                    <span className="font-extrabold text-stone-900 dark:text-white text-sm">₱350.00</span>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-bold text-stone-400 dark:text-neutral-400 uppercase tracking-wider">
                    Payment Details
                  </label>
                  <span className="text-xs font-bold text-orange-600 dark:text-orange-400">Amount Due: {currentPrice}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div 
                    onClick={() => setPaymentMethod('Cash')}
                    className={`p-3 rounded-xl border-2 cursor-pointer flex items-center justify-center space-x-2 transition ${
                      paymentMethod === 'Cash' 
                        ? 'border-[#0A5C36] bg-[#0A5C36]/5 dark:bg-emerald-950/30 text-[#0A5C36] dark:text-emerald-400' 
                        : 'border-stone-200 dark:border-neutral-700 text-stone-600 dark:text-neutral-400'
                    }`}
                  >
                    <input type="radio" name="payment" checked={paymentMethod === 'Cash'} onChange={() => setPaymentMethod('Cash')} className="accent-[#0A5C36]" />
                    <span className="font-bold text-sm">Cash</span>
                  </div>

                  <div 
                    onClick={() => setPaymentMethod('GCash')}
                    className={`p-3 rounded-xl border-2 cursor-pointer flex items-center justify-center space-x-2 transition ${
                      paymentMethod === 'GCash' 
                        ? 'border-[#0A5C36] bg-[#0A5C36]/5 dark:bg-emerald-950/30 text-[#0A5C36] dark:text-emerald-400' 
                        : 'border-stone-200 dark:border-neutral-700 text-stone-600 dark:text-neutral-400'
                    }`}
                  >
                    <input type="radio" name="payment" checked={paymentMethod === 'GCash'} onChange={() => setPaymentMethod('GCash')} className="accent-[#0A5C36]" />
                    <span className="font-bold text-sm">GCash</span>
                  </div>
                </div>

                {/* GCash QR Scanner & Reference Number Input Area */}
                {paymentMethod === 'GCash' && (
                  <div className="bg-stone-50 dark:bg-neutral-800/60 border border-stone-200 dark:border-neutral-700 p-4 rounded-2xl space-y-3 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <p className="text-stone-400 dark:text-neutral-400 font-medium">ACCOUNT NAME</p>
                        <p className="font-bold text-stone-900 dark:text-white">Gym ni Lucas</p>
                      </div>
                      <div className="text-right">
                        <p className="text-stone-400 dark:text-neutral-400 font-medium">ACCOUNT NUMBER</p>
                        <p className="font-bold text-stone-900 dark:text-white">09XX-XXX-XXXX</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 pt-2 border-t border-stone-200 dark:border-neutral-700">
                      <div className="w-20 h-20 bg-stone-200 dark:bg-neutral-700 rounded-xl flex items-center justify-center text-stone-500 dark:text-neutral-300 text-[10px] font-semibold shrink-0 border border-stone-300 dark:border-neutral-600">
                        [ QR CODE ]
                      </div>
                      <div className="flex-1 space-y-1">
                        <label className="block text-[10px] font-bold text-stone-500 dark:text-neutral-400 uppercase">Input Reference Number</label>
                        <input 
                          type="text"
                          placeholder="Enter 13-digit Reference"
                          value={gcashRef}
                          onChange={(e) => setGcashRef(e.target.value)}
                          className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-stone-300 dark:border-neutral-700 rounded-xl text-xs text-stone-800 dark:text-white placeholder-stone-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#0A5C36]"
                        />
                        <p className="text-[10px] text-stone-400 dark:text-neutral-500">Ref. number is required for verification</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3 pt-3 border-t border-stone-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsRenewModalOpen(false)}
                  className="w-1/2 border border-stone-300 dark:border-neutral-700 hover:bg-stone-50 dark:hover:bg-neutral-800 text-stone-700 dark:text-neutral-300 font-semibold py-3 rounded-xl text-sm transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-[#0A5C36] hover:bg-[#074729] text-white font-semibold py-3 rounded-xl text-sm shadow-md transition cursor-pointer"
                >
                  Confirm & Pay ({currentPrice})
                </button>
              </div>

            </form>

          </div>
        </div>
      )}
    </div>
  );
}