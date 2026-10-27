const operationsModel = require('../models/operations.model');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');
const { positiveAmount } = require('../utils/validation');

function validDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return year > 0 &&
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day;
}

function validateDateRange(from, to) {
  if ((from === null) !== (to === null) ||
      (from !== null && (!validDate(from) || !validDate(to) || from > to))) {
    throw new ApiError(400, 'A valid date range with the start on or before the end is required.');
  }
}

function validateGranularityRange(timeframe, from, to) {
  if (timeframe === 'Daily') return;
  const isMonthStart = (value) => value.endsWith('-01');
  const isMonthEnd = (value) => {
    const [year, month, day] = value.split('-').map(Number);
    const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
    return day === lastDay;
  };
  const valid = timeframe === 'Monthly'
    ? isMonthStart(from) && isMonthEnd(to)
    : from.endsWith('-01-01') && to.endsWith('-12-31');
  if (!valid) {
    throw new ApiError(400, 'Date range must include complete calendar months or years for the selected timeframe.');
  }
}

function defaultReportRange(timeframe) {
  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
  const [year, month, day] = today.split('-').map(Number);
  if (timeframe === 'Daily') {
    const start = new Date(Date.UTC(year, month - 1, day - 6));
    return { from: start.toISOString().slice(0, 10), to: today };
  }
  if (timeframe === 'Monthly') {
    const start = new Date(Date.UTC(year, month - 1 - 5, 1));
    const end = new Date(Date.UTC(year, month, 0)).getUTCDate();
    return {
      from: `${start.getUTCFullYear()}-${String(start.getUTCMonth() + 1).padStart(2, '0')}-01`,
      to: `${today.slice(0, 7)}-${String(end).padStart(2, '0')}`,
    };
  }
  return { from: `${year - 4}-01-01`, to: `${year}-12-31` };
}

const transactions = asyncHandler(async (req, res) => {
  const from = req.query.from || null;
  const to = req.query.to || null;
  validateDateRange(from, to);
  const rows = await operationsModel.listTransactions({ from, to });
  res.json({ success: true, count: rows.length, data: rows });
});

const dashboard = asyncHandler(async (req, res) => {
  const data = await operationsModel.getDashboard();
  res.json({ success: true, data });
});

const report = asyncHandler(async (req, res) => {
  const timeframe = req.query.timeframe || 'Monthly';
  if (!['Daily', 'Monthly', 'Yearly'].includes(timeframe)) {
    throw new ApiError(400, 'Timeframe must be Daily, Monthly, or Yearly.');
  }
  const range = req.query.from === undefined && req.query.to === undefined
    ? defaultReportRange(timeframe)
    : { from: req.query.from || null, to: req.query.to || null };
  validateDateRange(range.from, range.to);
  validateGranularityRange(timeframe, range.from, range.to);
  const data = await operationsModel.getReport(timeframe, range.from, range.to);
  res.json({ success: true, data });
});

const activity = asyncHandler(async (req, res) => {
  const limit = req.query.limit === undefined ? 200 : Number(req.query.limit);
  if (!Number.isInteger(limit) || limit < 1 || limit > 500) {
    throw new ApiError(400, 'Limit must be an integer from 1 to 500.');
  }
  const from = req.query.from || null;
  const to = req.query.to || null;
  const isDate = (value) => {
    if (value === null) return true;
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const [year, month, day] = value.split('-').map(Number);
    const parsed = new Date(0);
    parsed.setUTCHours(0, 0, 0, 0);
    parsed.setUTCFullYear(year, month - 1, day);
    return year > 0 &&
      parsed.getUTCFullYear() === year &&
      parsed.getUTCMonth() === month - 1 &&
      parsed.getUTCDate() === day;
  };
  if (!isDate(from) || !isDate(to)) throw new ApiError(400, 'Dates must use YYYY-MM-DD format.');
  const actions = req.user.role === 'employee'
    ? ['member.checked_in', 'walk_in.registered']
    : null;
  const rows = await operationsModel.listActivity({ from, to, limit, actions });
  res.json({ success: true, count: rows.length, data: rows });
});

const pricing = asyncHandler(async (req, res) => {
  const data = await operationsModel.getPricing();
  res.json({ success: true, data });
});

const updatePricing = asyncHandler(async (req, res) => {
  const prices = {
    regularMonthly: positiveAmount(req.body.regularMonthly, 'Regular monthly price'),
    studentMonthly: positiveAmount(req.body.studentMonthly, 'Student monthly price'),
    dayPass: positiveAmount(req.body.dayPass, 'Day pass price'),
  };
  if (Object.values(prices).some((amount) => !Number.isInteger(amount))) {
    throw new ApiError(400, 'Prices must be whole amounts in PHP.');
  }
  const data = await operationsModel.updatePricing(prices, req.user.empId);
  res.json({ success: true, data });
});

module.exports = { transactions, dashboard, report, activity, pricing, updatePricing };
