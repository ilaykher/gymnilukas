import React, { useState, useRef, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

export default function DashboardLayout() {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  
  // ✨ [BAGO/INUPDATE]: Step 1 ('details') o Step 2 ('payment') para sa Register flow
  const [registerStep, setRegisterStep] = useState('details'); 

  // Form states para sa Register Member
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [address, setAddress] = useState('');
  const [pin, setPin] = useState('');
  const [weight, setWeight] = useState('');

  // ✨ [BAGO/INUPDATE]: States para sa Complete Member Payment (Step 2)
  const [membershipType, setMembershipType] = useState('Regular'); // 'Regular' o 'Student'
  const [paymentMethod, setPaymentMethod] = useState('Cash'); // 'Cash' o 'GCash'
  const [gcashRef, setGcashRef] = useState('');

  const menuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Isara ang profile menu kapag nag-click sa labas nito
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Sinusubaybayan ang URL para buksan ang modal at i-reset sa step 1 kapag binuksan
  useEffect(() => {
    if (location.pathname === '/register-member') {
      setIsRegisterModalOpen(true);
      setRegisterStep('details'); // Laging magsisimula sa Step 1
    } else {
      setIsRegisterModalOpen(false);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    navigate('/login');
  };

  const handleCloseRegisterModal = () => {
    setIsRegisterModalOpen(false);
    navigate(-1);
  };

  // ✨ [BAGO/INUPDATE]: Kapag clinick ang "Register" sa Step 1, lilipat sa Step 2 (Payment Modal)
  const handleProceedToPayment = (e) => {
    e.preventDefault();
    if (!fullName || !username || !contactNumber || !address || !pin) {
      alert('Mangyaring punan ang lahat ng kinakailangang impormasyon.');
      return;
    }
    setRegisterStep('payment');
  };

  // ✨ [BAGO/INUPDATE]: Final submission mula sa Payment Modal (Step 2)
  const handleFinalRegisterSubmit = (e) => {
    e.preventDefault();
    if (paymentMethod === 'GCash' && !gcashRef) {
      alert('Mangyaring ilagay ang 13-digit GCash Reference Number.');
      return;
    }
    const amount = membershipType === 'Student' ? '₱350.00' : '₱450.00';
    alert(`Matagumpay na nairehistro si ${fullName} (${membershipType} Rate) via ${paymentMethod} amounting to ${amount}!`);
    setIsRegisterModalOpen(false);
    navigate(-1);
  };

  const currentPrice = membershipType === 'Student' ? '₱350.00' : '₱450.00';

  return (
    <div className="relative min-h-screen bg-stone-100 flex font-sans">
      {/* Static Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Bar (Mabublur kapag bukas ang modal) */}
        <header className={`bg-white border-b border-stone-200 h-16 flex items-center justify-between px-8 relative transition duration-200 ${isRegisterModalOpen ? 'filter blur-sm pointer-events-none select-none' : ''}`}>
          <span className="font-semibold text-stone-800 text-sm">Gym Management</span>
          
          {/* Profile Icon & Dropdown Container */}
          <div className="relative" ref={menuRef}>
            <button 
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="w-9 h-9 rounded-full bg-stone-200 flex items-center justify-center text-stone-600 border border-stone-300 hover:bg-stone-300 transition cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>

            {/* Profile Dropdown Menu */}
            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-stone-200 py-4 px-5 z-50 animate-in fade-in zoom-in duration-150">
                <div className="space-y-1.5 pb-3">
                  <h4 className="font-bold text-stone-900 text-base leading-tight">Lucas Staff</h4>
                  <div>
                    <span className="inline-block bg-[#E8F0EC] text-[#0A5C36] font-semibold text-xs px-2.5 py-0.5 rounded-full">
                      Font-Desk
                    </span>
                  </div>
                </div>

                <div className="border-t border-stone-100 pt-3">
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2 text-red-600 hover:bg-red-50 px-3 py-2 rounded-xl text-sm font-semibold transition cursor-pointer"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Page Content (Mabublur din kapag bukas ang modal) */}
        <main className={`p-8 max-w-6xl w-full mx-auto flex-1 transition duration-200 ${isRegisterModalOpen ? 'filter blur-sm pointer-events-none select-none' : ''}`}>
          <Outlet />
        </main>
      </div>

      {/* RENDER MODAL DEPENDING ON STEP */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          
          {/* STEP 1: REGISTER MEMBER DETAILS FORM */}
          {registerStep === 'details' && (
            <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-lg w-full p-6 md:p-8 space-y-6 relative max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
              <div>
                <h3 className="text-2xl font-bold text-[#0A5C36]">Register Member</h3>
                <p className="text-stone-500 text-xs md:text-sm mt-1">Please fill in the details below to create a new member profile.</p>
              </div>

              <form onSubmit={handleProceedToPayment} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">FULL NAME</label>
                  <input 
                    type="text"
                    placeholder="Julia Dizon"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-stone-300 rounded-xl text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A5C36]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">USERNAME</label>
                  <input 
                    type="text"
                    placeholder="juliadizon123"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-stone-300 rounded-xl text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A5C36]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">CONTACT NUMBER</label>
                  <input 
                    type="text"
                    placeholder="09XX XXX XXXX"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-stone-300 rounded-xl text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A5C36]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">ADDRESS</label>
                  <input 
                    type="text"
                    placeholder="123 Fitness Ave, Apt 4"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-stone-300 rounded-xl text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A5C36]"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">PIN</label>
                    <input 
                      type="password"
                      placeholder="••••"
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-stone-300 rounded-xl text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A5C36]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">WEIGHT <span className="text-stone-400 font-normal">(KG, Optional)</span></label>
                    <input 
                      type="text"
                      placeholder="e.g. 75"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-stone-300 rounded-xl text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A5C36]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <button
                    type="button"
                    onClick={handleCloseRegisterModal}
                    className="text-stone-700 hover:text-stone-900 font-semibold text-sm transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-[#0A5C36] hover:bg-[#074729] text-white font-semibold px-6 py-3 rounded-xl text-sm shadow-md transition flex items-center space-x-2 cursor-pointer"
                  >
                    <span>Register</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 2: COMPLETE MEMBER PAYMENT MODAL */}
          {registerStep === 'payment' && (
            <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-lg w-full p-6 md:p-8 space-y-6 relative max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                <h3 className="text-xl font-bold text-stone-900">Complete Member Payment</h3>
                <button 
                  onClick={() => setRegisterStep('details')}
                  className="w-8 h-8 rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200 flex items-center justify-center transition cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleFinalRegisterSubmit} className="space-y-5">
                
                {/* Member Summary Card */}
                <div className="bg-stone-50 border border-stone-200/80 rounded-2xl p-4 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-stone-400 font-medium">Member Name</span>
                    <span className="font-bold text-stone-900">{fullName || 'Julia Dizon'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400 font-medium">Username</span>
                    <span className="font-bold text-stone-900">@{username || 'juliadizon123'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400 font-medium">Plan Term</span>
                    <span className="font-bold text-stone-900">Monthly Membership (1 Month)</span>
                  </div>
                </div>

                {/* Select Membership Type */}
                <div>
                  <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2">
                    SELECT MEMBERSHIP TYPE
                  </label>
                  <div className="space-y-2.5">
                    {/* Regular Rate */}
                    <div 
                      onClick={() => setMembershipType('Regular')}
                      className={`p-3.5 rounded-2xl border-2 cursor-pointer transition flex items-center justify-between ${
                        membershipType === 'Regular' ? 'border-[#0A5C36] bg-[#0A5C36]/5' : 'border-stone-200 hover:border-stone-300'
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
                          <p className="font-bold text-stone-900 text-sm">Regular Rate</p>
                          <p className="text-[11px] text-stone-500">Standard full-access membership</p>
                        </div>
                      </div>
                      <span className="font-extrabold text-stone-900 text-sm">₱450.00</span>
                    </div>

                    {/* Student Rate */}
                    <div 
                      onClick={() => setMembershipType('Student')}
                      className={`p-3.5 rounded-2xl border-2 cursor-pointer transition flex items-center justify-between ${
                        membershipType === 'Student' ? 'border-[#0A5C36] bg-[#0A5C36]/5' : 'border-stone-200 hover:border-stone-300'
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
                          <div className="flex items-center space-x-2">
                            <p className="font-bold text-stone-900 text-sm">Student Rate</p>
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-semibold px-2 py-0.5 rounded-full">Special</span>
                          </div>
                          <p className="text-[11px] text-stone-500">Requires valid Student ID verification</p>
                        </div>
                      </div>
                      <span className="font-extrabold text-stone-900 text-sm">₱350.00</span>
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2">
                    PAYMENT METHOD
                  </label>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div 
                      onClick={() => setPaymentMethod('Cash')}
                      className={`p-3 rounded-xl border-2 cursor-pointer flex items-center justify-center space-x-2 transition ${
                        paymentMethod === 'Cash' ? 'border-[#0A5C36] bg-[#0A5C36]/5 text-[#0A5C36]' : 'border-stone-200 text-stone-600'
                      }`}
                    >
                      <input type="radio" name="payment" checked={paymentMethod === 'Cash'} onChange={() => setPaymentMethod('Cash')} className="accent-[#0A5C36]" />
                      <span className="font-bold text-sm">Cash</span>
                    </div>

                    <div 
                      onClick={() => setPaymentMethod('GCash')}
                      className={`p-3 rounded-xl border-2 cursor-pointer flex items-center justify-center space-x-2 transition ${
                        paymentMethod === 'GCash' ? 'border-[#0A5C36] bg-[#0A5C36]/5 text-[#0A5C36]' : 'border-stone-200 text-stone-600'
                      }`}
                    >
                      <input type="radio" name="payment" checked={paymentMethod === 'GCash'} onChange={() => setPaymentMethod('GCash')} className="accent-[#0A5C36]" />
                      <span className="font-bold text-sm">GCash</span>
                    </div>
                  </div>

                  {/* Amount Due Bar */}
                  <div className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl border border-stone-200/80">
                    <span className="text-sm font-semibold text-stone-600">Amount Due</span>
                    <span className="text-xl font-extrabold text-orange-600">{currentPrice}</span>
                  </div>

                  {/* GCash Details Area (Kung GCash ang pinili) */}
                  {paymentMethod === 'GCash' && (
                    <div className="bg-stone-50 border border-stone-200 p-4 rounded-2xl space-y-3 mt-3 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5 text-xs">
                          <p className="text-stone-400">ACCOUNT NAME</p>
                          <p className="font-bold text-stone-900">Gym ni Lucas</p>
                        </div>
                        <div className="space-y-0.5 text-xs text-right">
                          <p className="text-stone-400">ACCOUNT NUMBER</p>
                          <p className="font-bold text-stone-900">09XX-XXX-XXXX</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 pt-2 border-t border-stone-200">
                        <div className="w-20 h-20 bg-stone-200 rounded-xl flex items-center justify-center text-stone-500 text-[10px] font-semibold shrink-0 border border-stone-300">
                          [ QR CODE ]
                        </div>
                        <div className="flex-1 space-y-1">
                          <label className="block text-[10px] font-bold text-stone-500 uppercase">Input Reference Number</label>
                          <input 
                            type="text"
                            placeholder="Enter 13-digit Reference"
                            value={gcashRef}
                            onChange={(e) => setGcashRef(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#0A5C36]"
                          />
                          <p className="text-[10px] text-stone-400">Ref. number is required for verification</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center space-x-3 pt-3 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => setRegisterStep('details')}
                    className="w-1/2 border border-stone-300 hover:bg-stone-50 text-stone-700 font-semibold py-3 rounded-xl text-sm transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 bg-[#0A5C36] hover:bg-[#074729] text-white font-semibold py-3 rounded-xl text-sm shadow-md transition cursor-pointer"
                  >
                    Complete & Pay ({currentPrice})
                  </button>
                </div>

              </form>
            </div>
          )}

        </div>
      )}
    </div>
  );
}