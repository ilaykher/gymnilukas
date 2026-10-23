// Shared input rules + sanitizers used by the registration, check-in and settings forms.

// ---- Sanitizers (used in onChange to block characters that are not allowed) ----

// Full names: numbers are not allowed.
export const stripDigits = (value) => value.replace(/\d/g, '');

// Numeric-only fields (contact number, PIN, reference number). Optionally capped at maxLength.
export const digitsOnly = (value, maxLength) => {
  const digits = value.replace(/\D/g, '');
  return maxLength ? digits.slice(0, maxLength) : digits;
};

// Money amounts: digits plus a single decimal point with at most 2 decimals.
export const sanitizeAmount = (value) => {
  let cleaned = value.replace(/[^\d.]/g, '');
  const firstDot = cleaned.indexOf('.');
  if (firstDot !== -1) {
    cleaned = cleaned.slice(0, firstDot + 1) + cleaned.slice(firstDot + 1).replace(/\./g, '').slice(0, 2);
  }
  return cleaned;
};

// ---- Validators ----

export const isBlank = (value) => value.trim().length === 0;
export const isValidName = (value) => !isBlank(value) && !/\d/.test(value);
export const isValidPhone = (value) => /^09\d{9}$/.test(value); // starts with 09, exactly 11 digits

// Inline message for a contact number field ('' when empty or valid).
export const getPhoneError = (value) => {
  if (!value || isValidPhone(value)) return '';
  if (value[0] !== '0' || (value.length > 1 && value[1] !== '9')) return 'Contact number must start with 09.';
  return `Contact number must be exactly 11 digits (${value.length}/11).`;
};
export const isValidPin = (value) => /^\d{4}$/.test(value); // exactly 4 digits
export const isValidReference = (value) => /^\d{13}$/.test(value); // exactly 13 digits
export const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

// Password checklist shown while creating an employee account.
export const PASSWORD_RULES = [
  { id: 'length', label: 'At least 8 characters', test: (v) => v.length >= 8 },
  { id: 'upper', label: 'One uppercase letter (A-Z)', test: (v) => /[A-Z]/.test(v) },
  { id: 'lower', label: 'One lowercase letter (a-z)', test: (v) => /[a-z]/.test(v) },
  { id: 'number', label: 'One number (0-9)', test: (v) => /\d/.test(v) },
  { id: 'special', label: 'One special character (e.g. ! @ # $ %)', test: (v) => /[^A-Za-z0-9\s]/.test(v) },
];

export const isValidPassword = (value) => PASSWORD_RULES.every((rule) => rule.test(value));
