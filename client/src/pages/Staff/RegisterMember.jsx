import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function RegisterMember() {
  const navigate = useNavigate();
  
  // Form states para sa Register Member (Monthly Membership)
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    contactNumber: '',
    address: '',
    pin: '',
    weight: ''
  });

  // States para sa Monthly Payment Modal workflow
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [membershipType, setMembershipType] = useState('regular'); // 'regular' o 'student'
  const [paymentMethod, setPaymentMethod] = useState('cash'); // 'cash' o 'gcash'
  const [refNumber, setRefNumber] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleOpenPayment = (e) => {
    e.preventDefault();
    setShowPaymentModal(true); // Buksan ang Monthly Payment modal
  };

  const handleCompletePayment = (e) => {
    e.preventDefault();
    alert(`Monthly Membership Registered Successfully for ${formData.fullName || 'Member'}!`);
    navigate('/staff'); // Bumalik sa dashboard pagkatapos
  };

  // Monthly Rates
  const amountDue = membershipType === 'regular' ? '₱450.00' : '₱350.00';

  return (
    <div className="max-w-xl mx-auto py-8 select-none">
      {/* STEP 1: Register Member Form (Monthly) */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xl p-8 space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-extrabold text-[#0A5C36]">Register Member</h2>
          <p className="text-stone-500 text-xs mt-1">Please fill in the details below to create a new monthly member profile.</p>
        </div>

        <form onSubmit={handleOpenPayment} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Full Name</label>
            <input 
              type="text"
              name="fullName"
              placeholder="Julia Dizon"
              value={formData.fullName}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A5C36]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Username</label>
            <input 
              type="text"
              name="username"
              placeholder="juliadizon123"
              value={formData.username}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A5C36]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Contact Number</label>
            <input 
              type="text"
              name="contactNumber"
              placeholder="09XX XXX XXXX"
              value={formData.contactNumber}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A5C36]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Address</label>
            <input 
              type="text"
              name="address"
              placeholder="123 Fitness Ave, Apt 4"
              value={formData.address}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A5C36]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">PIN</label>
              <input 
                type="password"
                name="pin"
                placeholder="••••"
                maxLength={4}
                value={formData.pin}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A5C36]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Weight (KG, Optional)</label>
              <input 
                type="text"
                name="weight"
                placeholder="e.g. 75"
                value={formData.weight}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A5C36]"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4">
            <button 
              type="button"
              onClick={() => navigate('/staff')}
              className="text-xs font-bold text-[#0A5C36] hover:underline cursor-pointer"
            >
              Cancel
            </button>

            <button 
              type="submit"
              className="px-8 py-3.5 bg-[#0A5C36] hover:bg-[#074729] text-white rounded-xl text-sm font-bold shadow-md transition flex items-center space-x-2 cursor-pointer"
            >
              <span>Register</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
          </div>
        </form>
      </div>

      {/* STEP 2: Monthly Membership Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-md w-full overflow-hidden p-6 relative animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-4">
              <h3 className="text-lg font-extrabold text-stone-900">Complete Member Payment</h3>
              <button 
                onClick={() => setShowPaymentModal(false)}
                className="text-stone-400 hover:text-stone-600 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Member Info Summary */}
            <div className="bg-stone-50 rounded-2xl p-3 mb-4 border border-stone-200 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-stone-400 font-bold">Member Name</span>
                <span className="font-bold text-stone-800">{formData.fullName || 'Julia Dizon'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400 font-bold">Username</span>
                <span className="font-bold text-stone-800">@{formData.username || 'juliadizon123'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400 font-bold">Plan Term</span>
                <span className="font-bold text-stone-800">Monthly Membership (1 Month)</span>
              </div>
            </div>

            <form onSubmit={handleCompletePayment} className="space-y-4">
              {/* Select Membership Type */}
              <div>
                <label className="block text-[10px] font-extrabold text-stone-400 uppercase tracking-wider mb-2">Select Membership Type</label>
                <div className="space-y-2">
                  <div 
                    onClick={() => setMembershipType('regular')}
                    className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                      membershipType === 'regular' ? 'border-[#0A5C36] bg-emerald-50/40' : 'border-stone-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <input 
                        type="radio" 
                        name="membershipType" 
                        checked={membershipType === 'regular'}
                        onChange={() => setMembershipType('regular')}
                        className="accent-[#0A5C36]"
                      />
                      <div>
                        <p className="text-xs font-bold text-stone-800">Regular Rate</p>
                        <p className="text-[10px] text-stone-400">Standard full-access membership</p>
                      </div>
                    </div>
                    <span className="font-extrabold text-xs text-stone-900">₱450.00</span>
                  </div>

                  <div 
                    onClick={() => setMembershipType('student')}
                    className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                      membershipType === 'student' ? 'border-[#0A5C36] bg-emerald-50/40' : 'border-stone-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <input 
                        type="radio" 
                        name="membershipType" 
                        checked={membershipType === 'student'}
                        onChange={() => setMembershipType('student')}
                        className="accent-[#0A5C36]"
                      />
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <p className="text-xs font-bold text-stone-800">Student Rate</p>
                          <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[9px] font-extrabold rounded-md">Special</span>
                        </div>
                        <p className="text-[10px] text-stone-400">Requires valid student ID verification</p>
                      </div>
                    </div>
                    <span className="font-extrabold text-xs text-stone-900">₱350.00</span>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-[10px] font-extrabold text-stone-400 uppercase tracking-wider mb-2">Payment Method</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    className={`py-2.5 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center justify-center space-x-2 ${
                      paymentMethod === 'cash' ? 'border-[#0A5C36] bg-[#0A5C36] text-white' : 'border-stone-200 bg-white text-stone-700'
                    }`}
                  >
                    <span>💵 Cash</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('gcash')}
                    className={`py-2.5 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center justify-center space-x-2 ${
                      paymentMethod === 'gcash' ? 'border-[#0A5C36] bg-[#0A5C36] text-white' : 'border-stone-200 bg-white text-stone-700'
                    }`}
                  >
                    <span>📱 GCash</span>
                  </button>
                </div>
              </div>

              {/* GCash QR Section */}
              {paymentMethod === 'gcash' && (
                <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200 space-y-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-16 h-16 bg-stone-200 rounded-xl flex items-center justify-center text-[10px] text-stone-500 font-bold">
                      QR CODE
                    </div>
                    <div className="text-[11px] text-stone-600 space-y-0.5">
                      <p className="font-bold text-stone-900">ACCOUNT NAME: Gym ni Lucas</p>
                      <p>ACCOUNT NUMBER: 09XX-XXX-XXXX</p>
                      <p className="text-[10px] text-emerald-700">📷 Scan with GCash App</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 mb-1">Input Reference Number</label>
                    <input 
                      type="text"
                      placeholder="Enter 13-digit reference"
                      value={refNumber}
                      onChange={(e) => setRefNumber(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#0A5C36]"
                    />
                  </div>
                </div>
              )}

              {/* Amount Due Display */}
              <div className="flex items-center justify-between bg-stone-50 p-3 rounded-2xl border border-stone-200">
                <span className="text-xs font-bold text-stone-500">Amount Due</span>
                <span className="text-lg font-extrabold text-orange-600">{amountDue}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="w-1/3 py-3 border border-stone-200 hover:bg-stone-50 text-stone-700 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-3 bg-[#0A5C36] hover:bg-[#074729] text-white rounded-xl text-xs font-bold shadow-md transition cursor-pointer"
                >
                  {paymentMethod === 'gcash' ? `Confirm & Complete (${amountDue})` : `Complete Registration & Pay (${amountDue})`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}