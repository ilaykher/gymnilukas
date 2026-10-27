const ApiError = require('./apiError');

const requiredString = (value, name, maxLength) => {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > maxLength) {
    throw new ApiError(400, `${name} is required and must be no more than ${maxLength} characters.`);
  }
  return value.trim();
};

const validEmail = (value) =>
  typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

const validPhone = (value) => typeof value === 'string' && /^09\d{9}$/.test(value);

const validPin = (value) => typeof value === 'string' && /^\d{4}$/.test(value);

const positiveAmount = (value, name = 'Amount') => {
  const amount = Number(value);
  if (
    !Number.isFinite(amount) ||
    amount <= 0 ||
    amount > 1000000 ||
    Math.abs(Math.round(amount * 100) - amount * 100) > 0.000001
  ) {
    throw new ApiError(400, `${name} must be a positive amount with no more than two decimal places.`);
  }
  return amount;
};

const paymentDetails = (method, reference) => {
  if (!['cash', 'gcash'].includes(method)) {
    throw new ApiError(400, 'Payment method must be cash or gcash.');
  }
  if (method === 'gcash' && (typeof reference !== 'string' || !/^\d{13}$/.test(reference))) {
    throw new ApiError(400, 'GCash payments require a 13-digit reference number.');
  }
  return { method, reference: method === 'gcash' ? reference : null };
};

module.exports = { requiredString, validEmail, validPhone, validPin, positiveAmount, paymentDetails };
