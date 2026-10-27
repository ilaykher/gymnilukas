import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AlertModal from '../../components/AlertModal';
import FieldError from '../../components/FieldError';
import { createEmployee } from '../../lib/api';
import {
  stripDigits,
  digitsOnly,
  isBlank,
  isValidPhone,
  getPhoneError,
  isValidEmail,
  isValidPassword,
  PASSWORD_RULES,
} from '../../lib/validators';

const inputClass =
  'w-full px-4 py-3 bg-white dark:bg-neutral-800 border border-stone-200 dark:border-neutral-700 rounded-xl text-stone-800 dark:text-white placeholder-stone-400 dark:placeholder-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A5C36]';
const labelClass = 'block text-xs font-bold text-stone-700 dark:text-neutral-300 mb-1.5';

export default function RegisterEmployee() {
  const navigate = useNavigate();
  const [alertState, setAlertState] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    role: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    isActive: true
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let next = type === 'checkbox' ? checked : value;
    if (name === 'fullName') next = stripDigits(value); // no numbers in names
    if (name === 'phone') next = digitsOnly(value, 11); // numbers only, 11 digits
    setFormData(prev => ({
      ...prev,
      [name]: next
    }));
  };

  // All fields are required before the staff member can be saved.
  const isFormValid =
    !isBlank(formData.fullName) &&
    formData.role !== '' &&
    /^[a-zA-Z0-9._-]{3,80}$/.test(formData.username.trim()) &&
    isValidEmail(formData.email) &&
    isValidPhone(formData.phone) &&
    isValidPassword(formData.password);

  const phoneError = getPhoneError(formData.phone);
  const emailError =
    formData.email && !isValidEmail(formData.email) ? 'Enter a valid email address.' : '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await createEmployee({
        name: formData.fullName,
        jobTitle: formData.role,
        username: formData.username.trim(),
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        isActive: formData.isActive,
      });
      setAlertState({
        type: 'success',
        title: 'Staff Registered',
        message: `Staff member ${formData.fullName} was registered. They can sign in with their username or email and password.`,
        onClose: () => navigate('/admin/employees'),
      });
    } catch (error) {
      setAlertState({ type: 'error', title: 'Staff Registration Failed', message: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeAlert = () => {
    const afterClose = alertState?.onClose;
    setAlertState(null);
    if (afterClose) afterClose();
  };

  return (
    // No max-width, centering or outer padding: the page uses the full content area.
    <div className="w-full space-y-4 transition-colors duration-200">
      {/* Header Title + Back button (right side, in line with the title) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold text-stone-900 dark:text-white">Register New Employee</h2>
          <p className="text-stone-500 dark:text-neutral-400 text-xs mt-0.5">Fill in the details below to add a new staff member to the system.</p>
        </div>

        <Link
          to="/admin/employees"
          className="self-start sm:self-auto inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl border border-stone-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-stone-700 dark:text-neutral-200 hover:bg-stone-50 dark:hover:bg-neutral-800 text-sm font-semibold shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A5C36]"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back to Employees</span>
        </Link>
      </div>

      {/* Form Card Container */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-stone-200 dark:border-neutral-800 shadow-sm p-6 transition-colors duration-200">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-4">
            {/* Full Name */}
            <div>
              <label htmlFor="employee-name" className={labelClass}>Full Name</label>
              <input
                id="employee-name"
                type="text"
                name="fullName"
                placeholder="e.g. Julia Dizon"
                value={formData.fullName}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>

            {/* Role Selection */}
            <div>
              <label htmlFor="employee-role" className={labelClass}>Role Selection</label>
              <select
                id="employee-role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                className={inputClass}
              >
                <option value="" disabled className="bg-white dark:bg-neutral-900">Select a role...</option>
                <option value="Front-Desk" className="bg-white dark:bg-neutral-900">Front-Desk</option>
                <option value="Manager" className="bg-white dark:bg-neutral-900">Manager</option>
                <option value="Trainer" className="bg-white dark:bg-neutral-900">Trainer</option>
              </select>
            </div>

            {/* Email Address */}
            <div>
              <label htmlFor="employee-username" className={labelClass}>Login Username</label>
              <input
                id="employee-username"
                type="text"
                name="username"
                placeholder="e.g. julia.dizon"
                value={formData.username}
                onChange={handleChange}
                required
                minLength={3}
                maxLength={80}
                pattern="[a-zA-Z0-9._-]{3,80}"
                title="Use 3–80 letters, numbers, periods, underscores, or hyphens."
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="employee-email" className={labelClass}>Email Address</label>
              <input
                id="employee-email"
                type="email"
                name="email"
                placeholder="miranda.kielljanrowynbscs2024@gmail.com"
                value={formData.email}
                onChange={handleChange}
                required
                className={inputClass}
                aria-invalid={emailError ? 'true' : undefined}
                aria-describedby={emailError ? 'employee-email-error' : undefined}
              />
              <FieldError id="employee-email-error">{emailError}</FieldError>
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="employee-phone" className={labelClass}>Phone Number</label>
              <input
                id="employee-phone"
                type="text"
                name="phone"
                placeholder="09XXXXXXXXX"
                value={formData.phone}
                onChange={handleChange}
                required
                className={inputClass}
                inputMode="numeric"
                maxLength={11}
                aria-invalid={phoneError ? 'true' : undefined}
                aria-describedby={phoneError ? 'employee-phone-error' : undefined}
              />
              <FieldError id="employee-phone-error">{phoneError}</FieldError>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="employee-password" className={labelClass}>Password</label>
              <div className="relative">
                <input
                  id="employee-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Create a password"
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  aria-describedby="password-checklist"
                  className={`${inputClass} pr-11 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 dark:text-neutral-500 hover:text-stone-600 dark:hover:text-neutral-300 cursor-pointer focus-visible:outline-none focus-visible:text-[#0A5C36]"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    {showPassword ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    )}
                  </svg>
                </button>
              </div>

              {/* Live password checklist (two columns to save vertical space) */}
              <ul id="password-checklist" aria-label="Password requirements" className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1">
                {PASSWORD_RULES.map((rule) => {
                  const met = rule.test(formData.password);
                  return (
                    <li
                      key={rule.id}
                      className={`flex items-center gap-2 text-[11px] font-medium transition-colors ${
                        met ? 'text-emerald-700 dark:text-emerald-400' : 'text-stone-500 dark:text-neutral-400'
                      }`}
                    >
                      <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        {met ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        ) : (
                          <circle cx="12" cy="12" r="8" strokeWidth="2" />
                        )}
                      </svg>
                      <span>{rule.label}</span>
                      <span className="sr-only">{met ? '(met)' : '(not met)'}</span>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Account Status Toggle */}
            <div>
              <span className={labelClass}>Account Status</span>
              <div className="flex items-center justify-between p-3 bg-stone-50 dark:bg-neutral-800/60 border border-stone-200 dark:border-neutral-700 rounded-xl">
                <p className="text-[11px] text-stone-500 dark:text-neutral-400">Activate employee immediately</p>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="isActive"
                    aria-label="Activate employee immediately"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-stone-300 dark:bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0A5C36]"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Footer: helper text on the left, actions on the right */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-stone-100 dark:border-neutral-800">
            <p className="text-xs text-stone-500 dark:text-neutral-400">
              {isFormValid ? '' : 'All fields are required. Complete the form and password checklist to save.'}
            </p>

            <div className="flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate('/admin/employees')}
                className="px-6 py-2.5 border border-stone-200 dark:border-neutral-700 hover:bg-stone-50 dark:hover:bg-neutral-800 text-stone-700 dark:text-neutral-300 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!isFormValid || isSubmitting}
                className="px-8 py-2.5 bg-[#0A5C36] hover:bg-[#074729] text-white rounded-xl text-xs font-bold shadow-md transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#0A5C36]"
              >
                {isSubmitting ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </form>
      </div>

      <AlertModal alert={alertState} onClose={closeAlert} />
    </div>
  );
}