import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AlertModal from '../../components/AlertModal';
import FieldError from '../../components/FieldError';
import { createMember, getPricing } from '../../lib/api';
import {
  stripDigits,
  digitsOnly,
  sanitizeAmount,
  isBlank,
  isValidPhone,
  getPhoneError,
  isValidPin,
  isValidReference,
} from '../../lib/validators';

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
  const [alertState, setAlertState] = useState(null);
  const [prices, setPrices] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    getPricing({ signal: controller.signal })
      .then(setPrices)
      .catch((error) => {
        if (!controller.signal.aborted) {
          setAlertState({ type: 'error', title: 'Unable to load prices', message: error.message });
        }
      });
    return () => controller.abort();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let next = value;
    if (name === 'fullName') next = stripDigits(value); // no numbers in names
    if (name === 'contactNumber') next = digitsOnly(value, 11); // numbers only, 11 digits
    if (name === 'pin') next = digitsOnly(value, 4); // numbers only, 4 digits
    if (name === 'weight') next = sanitizeAmount(value); // numbers only (one decimal point allowed)
    setFormData(prev => ({ ...prev, [name]: next }));
  };

  const handleOpenPayment = (e) => {
    e.preventDefault();
    if (!isFormValid) return;
    setShowPaymentModal(true);
  };

  const handleCompletePayment = async (e) => {
    e.preventDefault();
    if (!isReferenceValid || isSubmitting || !prices) return;
    setIsSubmitting(true);
    try {
      await createMember({
        fullName: formData.fullName,
        username: formData.username,
        contactNumber: formData.contactNumber,
        address: formData.address,
        pin: formData.pin,
        weight: formData.weight,
        membershipType,
        paymentMethod,
        paymentReference: refNumber,
      });
      setShowPaymentModal(false);
      setAlertState({
        type: 'success',
        title: 'Registration Successful',
        message: `Monthly membership registered for ${formData.fullName}.`,
        onClose: () => navigate(-1),
      });
    } catch (error) {
      setAlertState({ type: 'error', title: 'Registration Failed', message: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeAlert = () => {
    const afterClose = alertState?.onClose;
    setAlertState(null);
    if (afterClose) afterClose();
  };

  const amountDue = prices
    ? `₱${Number(membershipType === 'regular' ? prices.regularMonthly : prices.studentMonthly).toFixed(2)}`
    : 'Loading…';

  // All fields are required except weight.
  const isFormValid =
    !isBlank(formData.fullName) &&
    !isBlank(formData.username) &&
    isValidPhone(formData.contactNumber) &&
    !isBlank(formData.address) &&
    isValidPin(formData.pin);

  // GCash needs a 13-digit reference number; cash needs nothing extra.
  const isReferenceValid = paymentMethod === 'cash' || isValidReference(refNumber);

  const contactError = getPhoneError(formData.contactNumber);
  const pinError =
    formData.pin && !isValidPin(formData.pin) ? `PIN must be exactly 4 digits (${formData.pin.length}/4).` : '';
  const refError =
    refNumber && !isValidReference(refNumber)
      ? `Reference number must be exactly 13 digits (${refNumber.length}/13).`
      : '';

  return (
    <div className="w-full py-2 select-none transition-colors duration-200">
      <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-stone-200 dark:border-neutral-800 shadow-xl p-8 space-y-6 transition-colors duration-200">
        <div className="text-center">
          <h2 className="text-2xl font-extrabold text-[#0A5C36] dark:text-emerald-400">Register Member</h2>
          <p className="text-stone-500 dark:text-neutral-400 text-xs mt-1">
            Please fill in the details below to create a new monthly member profile.
          </p>
        </div>

        <form onSubmit={handleOpenPayment} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
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
              placeholder="09XXXXXXXXX"
              value={formData.contactNumber}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 bg-white dark:bg-neutral-800 border border-stone-200 dark:border-neutral-700 rounded-xl text-stone-800 dark:text-white placeholder-stone-400 dark:placeholder-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A5C36]"
              inputMode="numeric"
              maxLength={11}
              aria-invalid={contactError ? 'true' : undefined}
              aria-describedby={contactError ? 'contact-error' : undefined}
            />
            <FieldError id="contact-error">{contactError}</FieldError>
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

          <div className="contents">
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
                inputMode="numeric"
                aria-invalid={pinError ? 'true' : undefined}
                aria-describedby={pinError ? 'pin-error' : undefined}
              />
              <FieldError id="pin-error">{pinError}</FieldError>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-neutral-300 mb-1">Weight (KG, Optional)</label>
              <input
                type="text"
                name="weight"
                placeholder="e.g. 75"
                value={formData.weight}
                onChange={handleInputChange}
                inputMode="decimal"
                className="w-full px-4 py-3 bg-white dark:bg-neutral-800 border border-stone-200 dark:border-neutral-700 rounded-xl text-stone-800 dark:text-white placeholder-stone-400 dark:placeholder-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A5C36]"
              />
            </div>
          </div>

          </div>

          {!isFormValid && (
            <p className="text-xs text-stone-500 dark:text-neutral-400">All fields are required except weight.</p>
          )}

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
              disabled={!isFormValid || !prices}
              className="px-8 py-3.5 bg-[#0A5C36] hover:bg-[#074729] text-white rounded-xl text-sm font-bold shadow-md transition flex items-center space-x-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#0A5C36]"
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
          {/* max-h + overflow-y-auto keeps Cancel / Complete visible by scrolling inside the card (same as the renewal flow) */}
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-stone-200 dark:border-neutral-800 shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 relative animate-in fade-in zoom-in transition-colors duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-neutral-800 mb-4">
              <h3 className="text-lg font-extrabold text-stone-900 dark:text-white">Complete Member Payment</h3>
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                aria-label="Close"
                className="text-stone-400 dark:text-neutral-500 hover:text-stone-600 dark:hover:text-neutral-300 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-stone-50 dark:bg-neutral-800/60 rounded-2xl p-3 mb-4 border border-stone-200 dark:border-neutral-700 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-stone-400 dark:text-neutral-400 font-bold">Member Name</span>
                <span className="font-bold text-stone-800 dark:text-white">{formData.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400 dark:text-neutral-400 font-bold">Username</span>
                <span className="font-bold text-stone-800 dark:text-white">@{formData.username}</span>
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
                    <span className="font-extrabold text-xs text-stone-900 dark:text-white">₱{Number(prices?.regularMonthly || 0).toFixed(2)}</span>
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
                    <span className="font-extrabold text-xs text-stone-900 dark:text-white">₱{Number(prices?.studentMonthly || 0).toFixed(2)}</span>
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
                    <div className="w-16 h-16 bg-stone-200 dark:bg-neutral-700 rounded-xl flex items-center justify-center text-[10px] text-stone-500 dark:text-neutral-300 font-bold shrink-0">
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
                      onChange={(e) => setRefNumber(digitsOnly(e.target.value, 13))}
                      required
                      className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-stone-200 dark:border-neutral-700 rounded-xl text-xs text-stone-800 dark:text-white placeholder-stone-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-[#0A5C36]"
                      inputMode="numeric"
                      maxLength={13}
                      aria-invalid={refError ? 'true' : undefined}
                      aria-describedby={refError ? 'ref-error' : undefined}
                    />
                    <FieldError id="ref-error">{refError}</FieldError>
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
                  disabled={!isReferenceValid || isSubmitting}
                  className="w-2/3 py-3 bg-[#0A5C36] hover:bg-[#074729] text-white rounded-xl text-xs font-bold shadow-md transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#0A5C36]"
                >
                  {isSubmitting ? 'Saving…' : paymentMethod === 'gcash' ? 'Confirm & Complete' : 'Complete Registration & Pay'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <AlertModal alert={alertState} onClose={closeAlert} />
    </div>
  );
}