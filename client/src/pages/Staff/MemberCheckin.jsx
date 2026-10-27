import { useState, useEffect } from 'react';
import AlertModal from '../../components/AlertModal';
import FieldError from '../../components/FieldError';
import { getCheckInExpiryText } from '../../lib/activity';
import { checkInMember } from '../../lib/api';
import { digitsOnly, isBlank, isValidPin } from '../../lib/validators';

const inputClass =
  'w-full pl-10 pr-4 py-3 bg-white dark:bg-neutral-800 border border-stone-200 dark:border-neutral-700 rounded-xl text-stone-800 dark:text-white placeholder-stone-400 dark:placeholder-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A5C36] dark:focus:ring-emerald-500';
const labelClass = 'block text-xs font-bold text-stone-700 dark:text-neutral-300 mb-1';
const iconWrapClass =
  'absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400 dark:text-neutral-500';

const AUTO_CLOSE_SECONDS = 5;

export default function MemberCheckIn() {
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(AUTO_CLOSE_SECONDS);
  const [checkedInMember, setCheckedInMember] = useState(null);
  const [alertState, setAlertState] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Both fields are required; the PIN must be exactly 4 digits.
  const isFormValid = !isBlank(username) && isValidPin(pin);
  const pinError = pin && !isValidPin(pin) ? `PIN must be exactly 4 digits (${pin.length}/4).` : '';

  // Auto-close the success window after a short countdown. Stays on this page and clears the form
  // so the next member can check in right away.
  useEffect(() => {
    if (!isSuccessModalOpen) return undefined;
    const timer = setTimeout(() => {
      if (secondsLeft <= 1) {
        setIsSuccessModalOpen(false);
        setUsername('');
        setPin('');
      } else {
        setSecondsLeft(secondsLeft - 1);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [isSuccessModalOpen, secondsLeft]);

  const handleCheckIn = async (e) => {
    e.preventDefault();
    if (!isFormValid || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const result = await checkInMember({ username, pin });
      setCheckedInMember(result);
      setSecondsLeft(AUTO_CLOSE_SECONDS);
      setIsSuccessModalOpen(true);
    } catch (error) {
      setAlertState({ type: 'error', title: 'Check-In Failed', message: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeSuccess = () => {
    setIsSuccessModalOpen(false);
    setUsername('');
    setPin('');
    setCheckedInMember(null);
  };

  return (
    // Centers a compact card in the content area instead of stretching it edge to edge.
    <div className="w-full flex-1 flex items-center justify-center py-2 transition-colors duration-200">
      <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl border border-stone-200 dark:border-neutral-800 shadow-xl p-8 space-y-6 relative transition-colors duration-200">
        <div className="text-center">
          <h2 className="text-2xl font-extrabold text-[#0A5C36] dark:text-emerald-400">Member Check-In</h2>
          <p className="text-stone-500 dark:text-neutral-400 text-xs mt-1">
            Please enter your username and PIN to check-in
          </p>
        </div>

        <form onSubmit={handleCheckIn} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="checkin-username" className={labelClass}>Username:</label>
              <div className="relative">
                <span className={iconWrapClass}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </span>
                <input
                  id="checkin-username"
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label htmlFor="checkin-pin" className={labelClass}>PIN:</label>
              <div className="relative">
                <span className={iconWrapClass}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <input
                  id="checkin-pin"
                  type="password"
                  placeholder="Enter PIN"
                  value={pin}
                  onChange={(e) => setPin(digitsOnly(e.target.value, 4))}
                  required
                  className={inputClass}
                  inputMode="numeric"
                  maxLength={4}
                  aria-invalid={pinError ? 'true' : undefined}
                  aria-describedby={pinError ? 'checkin-pin-error' : undefined}
                />
              </div>
              <FieldError id="checkin-pin-error">{pinError}</FieldError>
            </div>
          </div>

          {!isFormValid && (
            <p className="text-xs text-stone-500 dark:text-neutral-400 text-center">
              Enter your username and 4-digit PIN to check in.
            </p>
          )}

          <button
            type="submit"
            disabled={!isFormValid || isSubmitting}
            className="w-full py-3.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#004D40] bg-[#004D40] hover:bg-[#00382E] text-white rounded-xl text-sm font-bold shadow-md transition flex items-center justify-center space-x-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0A5C36] dark:focus-visible:ring-offset-neutral-900"
          >
            <span>{isSubmitting ? 'Checking…' : 'Check-In'}</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </form>
      </div>

      {isSuccessModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-stone-200 dark:border-neutral-800 shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200 p-8 text-center relative">
            <button
              onClick={closeSuccess}
              aria-label="Close"
              className="absolute top-5 right-5 text-stone-400 dark:text-neutral-500 hover:text-stone-600 dark:hover:text-neutral-300 transition cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950 text-[#0A5C36] dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h3 className="text-xl font-extrabold text-[#0A5C36] dark:text-emerald-400">Check-In Successful</h3>

            <div className="my-5">
              <div className="w-16 h-16 bg-stone-200 dark:bg-neutral-800 rounded-2xl mx-auto mb-2 flex items-center justify-center text-stone-600 dark:text-neutral-300 font-bold text-lg shadow-inner">
                MJ
              </div>
              <h4 className="font-bold text-stone-900 dark:text-white text-base">{checkedInMember?.name}</h4>
              <p className="text-xs text-stone-400 dark:text-neutral-500">{checkedInMember?.username}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-left mb-6">
              <div className="bg-stone-50 dark:bg-neutral-800/60 p-4 rounded-2xl border border-stone-200 dark:border-neutral-700">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-stone-400 dark:text-neutral-500 uppercase">Membership Status</span>
                  <svg className="w-4 h-4 text-stone-500 dark:text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="font-bold text-stone-900 dark:text-white text-xs">
                  {checkedInMember?.membershipType === 'student' ? 'Student' : 'Regular'} Monthly Membership
                </p>
                <p className="text-[10px] text-stone-500 dark:text-neutral-400 mt-0.5">
                  {getCheckInExpiryText(checkedInMember?.expiresOn)}
                </p>
                <span className="inline-block mt-2 px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-semibold rounded-full">
                  ● {checkedInMember?.membershipStatus === 'expiring' ? 'Expiring soon' : 'Active'}
                </span>
              </div>

              <div className="bg-stone-50 dark:bg-neutral-800/60 p-4 rounded-2xl border border-stone-200 dark:border-neutral-700">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-stone-400 dark:text-neutral-500 uppercase">Current Weight</span>
                  <svg className="w-4 h-4 text-stone-500 dark:text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                  </svg>
                </div>
                <p className="font-bold text-stone-900 dark:text-white text-xs mt-1">Check-in recorded</p>
                <p className="text-[10px] text-stone-500 dark:text-neutral-400 mt-6">
                  {checkedInMember?.atd_time_in ? new Date(checkedInMember.atd_time_in).toLocaleString() : ''}
                </p>
              </div>
            </div>

            {/* Stays on the check-in page: just closes the window and clears the form */}
            <button
              onClick={closeSuccess}
              className="w-full py-3.5 bg-[#004D40] hover:bg-[#00382E] text-white rounded-xl text-sm font-bold shadow-md transition cursor-pointer mb-2"
            >
              Done
            </button>
            <p className="text-[11px] text-stone-400 dark:text-neutral-500" aria-live="polite">
              This window will automatically close in {secondsLeft} second{secondsLeft === 1 ? '' : 's'}.
            </p>
          </div>
        </div>
      )}
      <AlertModal alert={alertState} onClose={() => setAlertState(null)} />
    </div>
  );
}