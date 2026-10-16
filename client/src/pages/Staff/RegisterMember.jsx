import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function RegisterMember() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    contactNumber: '',
    address: '',
    pin: '',
    weight: ''
  });

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [membershipType, setMembershipType] = useState('regular');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [refNumber, setRefNumber] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleOpenPayment = (e) => {
    e.preventDefault();
    setShowPaymentModal(true);
  };

  const handleCompletePayment = (e) => {
    e.preventDefault();
    alert(`Monthly Membership Registered Successfully for ${formData.fullName || 'Member'}!`);
    navigate(-1);
  };

  const amountDue = membershipType === 'regular' ? '₱450.00' : '₱350.00';

  return (
    <div className="max-w-xl mx-auto py-8 select-none transition-colors duration-200">
      <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-stone-200 dark:border-neutral-800 shadow-xl p-8 space-y-6 transition-colors duration-200">
        <div className="text-center">
          <h2 className="text-2xl font-extrabold text-[#0A5C36] dark:text-emerald-400">Register Member</h2>
          <p className="text-stone-500 dark:text-neutral-400 text-xs mt-1">
            Please fill in the details below to create a new monthly member profile.
          </p>
        </div>

        <form onSubmit={handleOpenPayment} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-neutral-300 mb-1">Full Name</label>
            <input
              type="text"
              name="fullName"
              placeholder="Julia Dizon"
              value={formData.fullName}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 bg-white dark:bg-neutral-800 border border-stone-200 dark:border-neutral-700 rounded-xl text-stone-800 dark:text-white placeholder-stone-400 dark:placeholder-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A5C36]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-neutral-300 mb-1">Username</label>
            <input
              type="text"
              name="username"
              placeholder="juliadizon123"
              value={formData.username}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 bg-white dark:bg-neutral-800 border border-stone-200 dark:border-neutral-700 rounded-xl text-stone-800 dark:text-white placeholder-stone-400 dark:placeholder-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A5C36]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-neutral-300 mb-1">Contact Number</label>
            <input
              type="text"
              name="contactNumber"
              placeholder="09XX XXX XXXX"
              value={formData.contactNumber}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 bg-white dark:bg-neutral-800 border border-stone-200 dark:border-neutral-700 rounded-xl text-stone-800 dark:text-white placeholder-stone-400 dark:placeholder-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A5C36]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-neutral-300 mb-1">Address</label>
            <input
              type="text"
              name="address"
              placeholder="123 Fitness Ave, Apt 4"
              value={formData.address}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 bg-white dark:bg-neutral-800 border border-stone-200 dark:border-neutral-700 rounded-xl text-stone-800 dark:text-white placeholder-stone-400 dark:placeholder-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A5C36]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-neutral-300 mb-1">PIN</label>
              <input
                type="password"
                name="pin"
                placeholder="••••"
                maxLength={4}
                value={formData.pin}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-white dark:bg-neutral-800 border border-stone-200 dark:border-neutral-700 rounded-xl text-stone-800 dark:text-white placeholder-stone-400 dark:placeholder-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A5C36]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-neutral-300 mb-1">Weight (KG, Optional)</label>
              <input
                type="text"
                name="weight"
                placeholder="e.g. 75"
                value={formData.weight}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white dark:bg-neutral-800 border border-stone-200 dark:border-neutral-700 rounded-xl text-stone-800 dark:text-white placeholder-stone-400 dark:placeholder-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A5C36]"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="text-xs font-bold text-[#0A5C36] dark:text-emerald-400 hover:underline cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-8 py-3.5 bg-[#0A5C36] hover:bg-[#074729] text-white rounded-xl text-sm font-bold shadow-md transition flex items-center space-x-2 cursor-pointer"
            >
              <span>Register</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a3 3 0 00-3-3m-3-3l2 2 4-4" />
              </svg>
            </button>
          </div>
        </form>
      </div>

      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-stone-200 dark:border-neutral-800 shadow-2xl max-w-md w-full overflow-hidden p-6 relative animate-in fade-in zoom-in duration-200 transition-colors duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-neutral-800 mb-4">
              <h3 className="text-lg font-extrabold text-stone-900 dark:text-white">Complete Member Payment</h3>
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="text-stone-400 dark:text-neutral-500 hover:text-stone-600 dark:hover:text-neutral-300 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-stone-50 dark:bg-neutral-800/60 rounded-2xl p-3 mb-4 border border-stone-200 dark:border-neutral-700 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-stone-400 dark:text-neutral-400 font-bold">Member Name</span>
                <span className="font-bold text-stone-800 dark:text-white">{formData.fullName || 'Julia Dizon'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400 dark:text-neutral-400 font-bold">Username</span>
                <span className="font-bold text-stone-800 dark:text-white">@{formData.username || 'juliadizon123'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400 dark:text-neutral-400 font-bold">Plan Term</span>
                <span className="font-bold text-stone-800 dark:text-white">Monthly Membership (1 Month)</span>
              </div>
            </div>

            <form onSubmit={handleCompletePayment} className="space-y-4">
              <div>
                <label className="block text-[10px] font-extrabold text-stone-400 dark:text-neutral-400 uppercase tracking-wider mb-2">
                  Select Membership Type
                </label>

                <div className="space-y-2">
                  <div
                    onClick={() => setMembershipType('regular')}
                    className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                      membershipType === 'regular'
                        ? 'border-[#0A5C36] bg-emerald-50/40 dark:bg-emerald-950/40'
                        : 'border-stone-200 dark:border-neutral-700 bg-white dark:bg-neutral-800'
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
                        <p className="text-xs font-bold text-stone-800 dark:text-white">Regular Rate</p>
                        <p className="text-[10px] text-stone-400 dark:text-neutral-400">Standard full-access membership</p>
                      </div>
                    </div>
                    <span className="font-extrabold text-xs text-stone-900 dark:text-white">₱450.00</span>
                  </div>

                  <div
                    onClick={() => setMembershipType('student')}
                    className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                      membershipType === 'student'
                        ? 'border-[#0A5C36] bg-emerald-50/40 dark:bg-emerald-950/40'
                        : 'border-stone-200 dark:border-neutral-700 bg-white dark:bg-neutral-800'
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
                          <p className="text-xs font-bold text-stone-800 dark:text-white">Student Rate</p>
                          <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[9px] font-extrabold rounded-md">
                            Special
                          </span>
                        </div>
                        <p className="text-[10px] text-stone-400 dark:text-neutral-400">Requires valid student ID verification</p>
                      </div>
                    </div>
                    <span className="font-extrabold text-xs text-stone-900 dark:text-white">₱350.00</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-stone-400 dark:text-neutral-400 uppercase tracking-wider mb-2">
                  Payment Method
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    className={`py-2.5 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center justify-center space-x-2 ${
                      paymentMethod === 'cash'
                        ? 'border-[#0A5C36] bg-[#0A5C36] text-white'
                        : 'border-stone-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-stone-700 dark:text-neutral-300'
                    }`}
                  >
                    <span>💵 Cash</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('gcash')}
                    className={`py-2.5 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center justify-center space-x-2 ${
                      paymentMethod === 'gcash'
                        ? 'border-[#0A5C36] bg-[#0A5C36] text-white'
                        : 'border-stone-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-stone-700 dark:text-neutral-300'
                    }`}
                  >
                    <span>📱 GCash</span>
                  </button>
                </div>
              </div>

              {paymentMethod === 'gcash' && (
                <div className="bg-stone-50 dark:bg-neutral-800/60 p-3 rounded-2xl border border-stone-200 dark:border-neutral-700 space-y-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-16 h-16 bg-stone-200 dark:bg-neutral-700 rounded-xl flex items-center justify-center text-[10px] text-stone-500 dark:text-neutral-300 font-bold">
                      QR CODE
                    </div>
                    <div className="text-[11px] text-stone-600 dark:text-neutral-300 space-y-0.5">
                      <p className="font-bold text-stone-900 dark:text-white">ACCOUNT NAME: Gym ni Lucas</p>
                      <p>ACCOUNT NUMBER: 09XX-XXX-XXXX</p>
                      <p className="text-[10px] text-emerald-700 dark:text-emerald-400">📷 Scan with GCash App</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 dark:text-neutral-400 mb-1">
                      Input Reference Number
                    </label>
                    <input
                      type="text"
                      placeholder="Enter 13-digit reference"
                      value={refNumber}
                      onChange={(e) => setRefNumber(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-stone-200 dark:border-neutral-700 rounded-xl text-xs text-stone-800 dark:text-white placeholder-stone-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-[#0A5C36]"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between bg-stone-50 dark:bg-neutral-800/60 p-3 rounded-2xl border border-stone-200 dark:border-neutral-700">
                <span className="text-xs font-bold text-stone-500 dark:text-neutral-400">Amount Due</span>
                <span className="text-lg font-extrabold text-orange-600 dark:text-orange-400">{amountDue}</span>
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="w-1/3 py-3 border border-stone-200 dark:border-neutral-700 hover:bg-stone-50 dark:hover:bg-neutral-800 text-stone-700 dark:text-neutral-300 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="w-2/3 py-3 bg-[#0A5C36] hover:bg-[#074729] text-white rounded-xl text-xs font-bold shadow-md transition cursor-pointer"
                >
                  {paymentMethod === 'gcash'
                    ? `Confirm & Complete (${amountDue})`
                    : `Complete Registration & Pay (${amountDue})`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}