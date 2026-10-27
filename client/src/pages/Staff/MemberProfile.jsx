import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import AlertModal from '../../components/AlertModal';
import FieldError from '../../components/FieldError';
import { addMemberWeight, getMember, getPricing, renewMember, resetMemberPin } from '../../lib/api';
import { digitsOnly, sanitizeAmount, isValidPin, isValidReference } from '../../lib/validators';

// Password-style input with an eye button to show / hide the value.
function PinInput({ id, label, value, onChange, placeholder, error, errorId }) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold text-stone-600 dark:text-neutral-300 uppercase tracking-wider mb-1.5">{label}</label>
      <div className="relative">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(digitsOnly(e.target.value, 4))}
          inputMode="numeric"
          maxLength={4}
          autoComplete="off"
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? errorId : undefined}
          className="w-full px-4 py-2.5 pr-11 bg-white dark:bg-neutral-800 border border-stone-300 dark:border-neutral-700 rounded-xl text-stone-800 dark:text-white placeholder-stone-400 dark:placeholder-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A5C36] [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
          required
        />
        <button
          type="button"
          onClick={() => setVisible((prev) => !prev)}
          aria-label={visible ? 'Hide PIN' : 'Show PIN'}
          aria-pressed={visible}
          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 dark:text-neutral-500 hover:text-stone-600 dark:hover:text-neutral-300 cursor-pointer focus-visible:outline-none focus-visible:text-[#0A5C36]"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            {visible ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            )}
          </svg>
        </button>
      </div>
      <FieldError id={errorId}>{error}</FieldError>
    </div>
  );
}

export default function MemberProfile() {
  const [searchParams] = useSearchParams();
  const memberId = searchParams.get('id');
  const [member, setMember] = useState(null);
  const [pageError, setPageError] = useState('');
  const [prices, setPrices] = useState(null);
  const [loadedMemberId, setLoadedMemberId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  // Reset PIN modal
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  // Add body weight modal
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
  const [bodyWeight, setBodyWeight] = useState('');

  // Renew monthly membership modal
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [membershipType, setMembershipType] = useState('Student'); // 'Student' or 'Regular'
  const [paymentMethod, setPaymentMethod] = useState('Cash'); // 'Cash' or 'GCash'
  const [gcashRef, setGcashRef] = useState(''); // exactly 13 digits for GCash

  // Themed replacement for window.alert()
  const [alertState, setAlertState] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    if (!memberId) {
      return () => controller.abort();
    }

    Promise.all([getMember(memberId, { signal: controller.signal }), getPricing({ signal: controller.signal })])
      .then(([profile, configuredPrices]) => {
        setMember(profile);
        setPrices(configuredPrices);
        setPageError('');
      })
      .catch((error) => {
        if (!controller.signal.aborted) setPageError(error.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadedMemberId(memberId);
      });
    return () => controller.abort();
  }, [memberId]);

  // Current date, auto-generated for the weight entry
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  // ---- Validation ----
  const isPinValid = isValidPin(newPin);
  const isPinMatch = newPin === confirmPin;
  const isResetFormValid = isPinValid && isValidPin(confirmPin) && isPinMatch;

  const newPinError = newPin && !isPinValid ? `PIN must be exactly 4 digits (${newPin.length}/4).` : '';
  const confirmPinError =
    confirmPin && !isPinMatch && confirmPin.length === 4 ? 'PINs do not match.' : '';

  const weightValue = parseFloat(bodyWeight);
  const isWeightValid = bodyWeight !== '' && !Number.isNaN(weightValue) && weightValue > 0;

  const isReferenceValid = paymentMethod === 'Cash' || isValidReference(gcashRef);
  const refError =
    gcashRef && !isValidReference(gcashRef)
      ? `Reference number must be exactly 13 digits (${gcashRef.length}/13).`
      : '';

  // ---- Handlers ----
  const closeResetModal = () => {
    setIsResetModalOpen(false);
    setNewPin('');
    setConfirmPin('');
  };

  const handleResetPinSubmit = async (e) => {
    e.preventDefault();
    if (!isResetFormValid || isSaving) return;
    setIsSaving(true);
    try {
      await resetMemberPin(memberId, newPin);
      closeResetModal();
      setAlertState({ type: 'success', title: 'PIN Reset', message: `${member.mem_fullname}'s PIN has been reset.` });
    } catch (error) {
      setAlertState({ type: 'error', title: 'PIN Reset Failed', message: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  const closeWeightModal = () => {
    setIsWeightModalOpen(false);
    setBodyWeight('');
  };

  const handleAddWeightSubmit = async (e) => {
    e.preventDefault();
    if (!isWeightValid || isSaving) return;
    setIsSaving(true);
    try {
      const weightKg = Number((weightValue * 0.45359237).toFixed(2));
      await addMemberWeight(memberId, weightKg);
      setMember(await getMember(memberId));
      closeWeightModal();
      setAlertState({ type: 'success', title: 'Weight Saved', message: `Body weight of ${bodyWeight} lbs was recorded.` });
    } catch (error) {
      setAlertState({ type: 'error', title: 'Weight Save Failed', message: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  const closeRenewModal = () => {
    setIsRenewModalOpen(false);
    setGcashRef('');
  };

  const handleRenewSubmit = async (e) => {
    e.preventDefault();
    if (!isReferenceValid || isSaving) return;
    setIsSaving(true);
    try {
      const renewed = await renewMember(memberId, {
        membershipType: membershipType.toLowerCase(),
        paymentMethod: paymentMethod.toLowerCase(),
        paymentReference: gcashRef,
      });
      setMember(await getMember(memberId));
      closeRenewModal();
      setAlertState({
        type: 'success',
        title: 'Membership Renewed',
        message: `Membership renewed for ${renewed.member_name}. New expiry: ${new Date(`${renewed.mbs_expiration_date}T00:00:00`).toLocaleDateString()}.`,
      });
    } catch (error) {
      setAlertState({ type: 'error', title: 'Renewal Failed', message: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  const isAnyModalOpen = isResetModalOpen || isWeightModalOpen || isRenewModalOpen;

  // Dynamic price computation
  const currentPrice = prices
    ? `₱${Number(membershipType === 'Student' ? prices.studentMonthly : prices.regularMonthly).toFixed(2)}`
    : 'Loading…';

  if (!memberId) {
    return <div className="py-12 text-center text-red-600" role="alert">Select a member from the directory to view their profile.</div>;
  }
  const isLoading = Boolean(memberId && loadedMemberId !== memberId);
  if (isLoading) {
    return <div className="py-12 text-center text-stone-500" role="status">Loading member profile…</div>;
  }
  if (pageError || !member) {
    return <div className="py-12 text-center text-red-600" role="alert">{pageError || 'Member not found.'}</div>;
  }

  const latestWeight = member.weights?.[0];
  const formatDate = (value) => value ? new Date(`${String(value).slice(0, 10)}T00:00:00`).toLocaleDateString() : '—';
  const membershipStatus = String(member.membership_status || 'expired').toLowerCase();

  return (
    <div className="relative min-h-screen transition-colors duration-200">
      {/* Blur the whole page while any modal is open */}
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
                alt={member.mem_fullname}
                className="w-24 h-24 rounded-full object-cover border-4 border-stone-100 dark:border-neutral-800 shadow-sm"
              />
            </div>

            <div>
              <h3 className="text-xl font-bold text-stone-900 dark:text-white">{member.mem_fullname}</h3>
              <p className="text-xs text-stone-500 dark:text-neutral-400 mt-0.5 flex items-center justify-center space-x-1">
                <span>Username: {member.mem_username || '—'}</span>
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
                <span>{member.mem_status}</span>
              </span>
            </div>

            {/* Contact & Address Details */}
            <div className="w-full text-left space-y-3 pt-2 border-t border-stone-100 dark:border-neutral-800 text-sm">
              <div>
                <span className="text-xs font-bold text-stone-400 dark:text-neutral-500 uppercase tracking-wider block">Phone</span>
                <p className="text-stone-800 dark:text-neutral-200 font-medium mt-0.5">{member.mem_contact_num || '—'}</p>
              </div>
              <div>
                <span className="text-xs font-bold text-stone-400 dark:text-neutral-500 uppercase tracking-wider block">Address</span>
                <p className="text-stone-800 dark:text-neutral-200 font-medium mt-0.5">{member.mem_address || '—'}</p>
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
                <span>Reset PIN</span>
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
                  <h3 className="text-lg font-bold">
                    {member.membership_type ? `${member.membership_type} Monthly Membership` : 'No membership'}
                  </h3>
                  <p className="text-emerald-200 text-xs mt-0.5">
                    {member.mbs_expiration_date
                      ? `${membershipStatus === 'expired' ? 'Expired' : 'Expires'} ${formatDate(member.mbs_expiration_date)}`
                      : 'No membership on record'}
                  </p>
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
                    {(member.attendance || []).map((row) => (
                      <tr key={row.attendance_id} className="hover:bg-stone-50/50 dark:hover:bg-neutral-800/50 transition">
                        <td className="py-4 px-6 text-stone-800 dark:text-neutral-200 font-medium">{formatDate(row.atd_time_in)}</td>
                        <td className="py-4 px-6 text-stone-600 dark:text-neutral-400 text-right">{new Date(row.atd_time_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                      </tr>
                    ))}
                    {!member.attendance?.length && (
                      <tr><td colSpan="2" className="py-6 text-center text-stone-500">No check-ins recorded.</td></tr>
                    )}
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
                  <p className="text-sm font-medium text-stone-700 dark:text-neutral-300">Weight (kg stored; enter lbs)</p>
                </div>
                <div className="text-right">
                  <p className="text-base font-bold text-stone-900 dark:text-white">
                    {latestWeight ? `${(Number(latestWeight.weight_kg) * 2.20462).toFixed(1)} lbs` : 'No record'}
                  </p>
                  <p className="text-xs text-stone-400 dark:text-neutral-500">
                    {latestWeight ? formatDate(latestWeight.weight_recorded_date) : 'Add a weight record'}
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* MODAL 1: RESET PIN (each field has its own eye toggle) */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-stone-200 dark:border-neutral-800 shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 space-y-6 relative animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-stone-900 dark:text-white">Reset Member PIN</h3>
                <p className="text-xs text-stone-500 dark:text-neutral-400 mt-1">Enter a new 4-digit PIN for {member.mem_fullname}.</p>
              </div>
              <button 
                onClick={closeResetModal}
                aria-label="Close"
                className="w-8 h-8 rounded-full bg-stone-100 dark:bg-neutral-800 text-stone-500 dark:text-neutral-400 hover:bg-stone-200 dark:hover:bg-neutral-700 flex items-center justify-center transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleResetPinSubmit} className="space-y-4">
              <PinInput
                id="new-pin"
                label="New PIN"
                placeholder="Enter new 4-digit PIN"
                value={newPin}
                onChange={setNewPin}
                error={newPinError}
                errorId="new-pin-error"
              />
              <PinInput
                id="confirm-pin"
                label="Confirm PIN"
                placeholder="Confirm new PIN"
                value={confirmPin}
                onChange={setConfirmPin}
                error={confirmPinError}
                errorId="confirm-pin-error"
              />
              <div className="flex items-center space-x-3 pt-2">
                <button type="button" onClick={closeResetModal} className="w-1/2 border border-stone-300 dark:border-neutral-700 hover:bg-stone-50 dark:hover:bg-neutral-800 text-stone-700 dark:text-neutral-300 font-semibold py-2.5 rounded-xl text-sm transition cursor-pointer">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isResetFormValid || isSaving}
                  className="w-1/2 bg-[#0A5C36] hover:bg-[#074729] text-white font-semibold py-2.5 rounded-xl text-sm shadow-md transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#0A5C36]"
                >
                  {isSaving ? 'Saving…' : 'Save PIN'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD BODY WEIGHT */}
      {isWeightModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-stone-200 dark:border-neutral-800 shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 space-y-6 relative animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-stone-900 dark:text-white">Add Body Weight</h3>
              <button 
                onClick={closeWeightModal}
                aria-label="Close"
                className="w-8 h-8 rounded-full bg-stone-100 dark:bg-neutral-800 text-stone-500 dark:text-neutral-400 hover:bg-stone-200 dark:hover:bg-neutral-700 flex items-center justify-center transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddWeightSubmit} className="space-y-5">
              <div>
                <label htmlFor="bodyWeight" className="block text-sm font-medium text-stone-700 dark:text-neutral-300 mb-2">Body Weight (lbs)</label>
                <input
                  id="bodyWeight"
                  type="text"
                  value={bodyWeight}
                  onChange={(e) => setBodyWeight(sanitizeAmount(e.target.value))}
                  placeholder="e.g. 176"
                  inputMode="decimal"
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
                  onClick={closeWeightModal}
                  className="w-1/2 bg-stone-100 dark:bg-neutral-800 hover:bg-stone-200 dark:hover:bg-neutral-700 text-stone-800 dark:text-neutral-200 font-semibold py-3 rounded-xl text-sm transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isWeightValid || isSaving}
                  className="w-1/2 bg-[#0A5C36] hover:bg-[#074729] text-white font-semibold py-3 rounded-xl text-sm shadow-md transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#0A5C36]"
                >
                  {isSaving ? 'Saving…' : 'Save Weight'}
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
                onClick={closeRenewModal}
                aria-label="Close"
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
                  <span className="font-semibold text-stone-900 dark:text-white">{formatDate(member.mbs_expiration_date)}</span>
                </div>
                <div className="flex justify-between text-stone-700 dark:text-neutral-300">
                  <span>Renewal Term:</span>
                  <span className="font-semibold text-stone-900 dark:text-white">1 Month</span>
                </div>
                <div className="flex justify-between text-stone-700 dark:text-neutral-300">
                  <span>New Expiry Date:</span>
                  <span className="font-semibold text-[#0A5C36] dark:text-emerald-400">Updated after successful payment</span>
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
                    <span className="font-extrabold text-stone-900 dark:text-white text-sm">₱{Number(prices?.regularMonthly ?? 0).toFixed(2)}</span>
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
                    <span className="font-extrabold text-stone-900 dark:text-white text-sm">₱{Number(prices?.studentMonthly ?? 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-bold text-stone-400 dark:text-neutral-400 uppercase tracking-wider">
                    Payment Method
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

                {/* GCash QR & Reference Number */}
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

                    <div className="flex items-start space-x-4 pt-2 border-t border-stone-200 dark:border-neutral-700">
                      <div className="w-20 h-20 bg-stone-200 dark:bg-neutral-700 rounded-xl flex items-center justify-center text-stone-500 dark:text-neutral-300 text-[10px] font-semibold shrink-0 border border-stone-300 dark:border-neutral-600">
                        [ QR CODE ]
                      </div>
                      <div className="flex-1 space-y-1">
                        <label htmlFor="gcash-ref" className="block text-[10px] font-bold text-stone-500 dark:text-neutral-400 uppercase">Input Reference Number</label>
                        <input 
                          id="gcash-ref"
                          type="text"
                          placeholder="Enter 13-digit Reference"
                          value={gcashRef}
                          onChange={(e) => setGcashRef(digitsOnly(e.target.value, 13))}
                          inputMode="numeric"
                          maxLength={13}
                          required
                          aria-invalid={refError ? 'true' : undefined}
                          aria-describedby={refError ? 'gcash-ref-error' : undefined}
                          className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-stone-300 dark:border-neutral-700 rounded-xl text-xs text-stone-800 dark:text-white placeholder-stone-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#0A5C36]"
                        />
                        <FieldError id="gcash-ref-error">{refError}</FieldError>
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
                  onClick={closeRenewModal}
                  className="w-1/2 border border-stone-300 dark:border-neutral-700 hover:bg-stone-50 dark:hover:bg-neutral-800 text-stone-700 dark:text-neutral-300 font-semibold py-3 rounded-xl text-sm transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isReferenceValid || isSaving || !prices}
                  className="w-1/2 bg-[#0A5C36] hover:bg-[#074729] text-white font-semibold py-3 rounded-xl text-sm shadow-md transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#0A5C36]"
                >
                  {isSaving ? 'Saving…' : 'Confirm & Pay'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Themed alert (replaces window.alert) */}
      <AlertModal alert={alertState} onClose={() => setAlertState(null)} />
    </div>
  );
}