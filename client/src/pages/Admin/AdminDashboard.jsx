import { useState, useRef, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/admin/AdminSidebar';
import Employees from './Employees';
import RegisterEmployee from './RegisterEmployee';
import ActivityLog from './ActivityLog';
import Transactions from './Transactions';
import Settings from '../Settings';
import { useAuth } from '../../context/useAuth';
import { getReport, getTransactions } from '../../lib/api';
import { escapeCsvCell } from '../../lib/csv';
import {
  defaultReportRange,
  formatReportRange,
  pickerValuesToRange,
  rangeToPickerValues,
  sumReportBuckets,
} from '../../lib/reportRange';

const TIMEFRAMES = ['Daily', 'Monthly', 'Yearly'];

const REVENUE_FILTERS = [
  { value: 'All Revenues', label: 'All Revenues' },
  { value: 'Membership', label: 'Membership Revenue' },
  { value: 'Walk-in', label: 'Daily / Walk-in Revenue' },
];

// Which transaction category belongs to which revenue filter.
const FILTER_CATEGORY = {
  Membership: 'Membership Renewal',
  'Walk-in': 'Daily Pass',
};

const SERIES = [
  {
    key: 'membership',
    label: 'Membership',
    line: 'stroke-[#0A5C36] dark:stroke-emerald-500',
    swatch: 'bg-[#0A5C36] dark:bg-emerald-500',
  },
  {
    key: 'walkIn',
    label: 'Walk-In',
    line: 'stroke-orange-500',
    swatch: 'bg-orange-500',
  },
];

const logoutIcon = 'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1';

const peso = (n) => `₱${n.toLocaleString('en-US')}`;

const compactPeso = (n) => {
  if (n >= 1_000_000) return `₱${+(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1000) return `₱${+(n / 1000).toFixed(1)}k`;
  return `₱${n}`;
};

// Rounds the top of the y-axis up to a "nice" value so grid lines land on clean numbers.
const NICE_STEPS = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10];
const GRID_INTERVALS = 4;
function niceScale(max) {
  const rough = (max || 1) / GRID_INTERVALS;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const normalized = rough / magnitude;
  const step = (NICE_STEPS.find((s) => s >= normalized) ?? 10) * magnitude;
  return { step, top: step * GRID_INTERVALS };
}

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

// ---------------------------------------------------------------------------
// Chart geometry. Points, labels, grid lines and hover zones all use the same
// xAt()/yAt() helpers, so everything lines up by construction.
// ---------------------------------------------------------------------------
const W = 900;
const H = 300;
const MARGIN = { left: 64, right: 24, top: 16, bottom: 36 };
const PLOT_W = W - MARGIN.left - MARGIN.right;
const PLOT_H = H - MARGIN.top - MARGIN.bottom;

function RevenueChart({ data, visibleKeys }) {
  const [hover, setHover] = useState(null);

  const series = SERIES.filter((s) => visibleKeys.includes(s.key));
  const count = data.labels.length;
  if (!count) {
    return <p className="py-10 text-center text-stone-500 dark:text-neutral-400">No revenue recorded for this period.</p>;
  }
  const maxValue = Math.max(...series.flatMap((s) => data[s.key]));
  const { step, top } = niceScale(maxValue);
  const ticks = Array.from({ length: GRID_INTERVALS + 1 }, (_, i) => step * i);

  const bandWidth = PLOT_W / count;
  const xAt = (i) => MARGIN.left + bandWidth * (i + 0.5);
  const yAt = (v) => MARGIN.top + PLOT_H - (v / top) * PLOT_H;

  const hoverTotal = hover === null ? 0 : series.reduce((sum, s) => sum + data[s.key][hover], 0);

  return (
    <div className="overflow-x-auto">
      <div className="relative min-w-140">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-auto"
          role="img"
          aria-label="Revenue breakdown over time"
          onMouseLeave={() => setHover(null)}
        >
          {/* Grid lines + y-axis labels */}
          {ticks.map((tick, i) => (
            <g key={tick}>
              <line
                x1={MARGIN.left}
                x2={W - MARGIN.right}
                y1={yAt(tick)}
                y2={yAt(tick)}
                strokeWidth="1"
                strokeDasharray={i === 0 ? undefined : '4 4'}
                className={i === 0 ? 'stroke-stone-300 dark:stroke-neutral-700' : 'stroke-stone-200 dark:stroke-neutral-800'}
              />
              <text
                x={MARGIN.left - 10}
                y={yAt(tick) + 4}
                textAnchor="end"
                className="fill-stone-500 dark:fill-neutral-400 text-[11px] font-medium"
              >
                {compactPeso(tick)}
              </text>
            </g>
          ))}

          {/* Month / day / year labels, centered under each data point */}
          {data.labels.map((label, i) => (
            <text
              key={label}
              x={xAt(i)}
              y={H - 12}
              textAnchor="middle"
              className={`text-[12px] font-semibold ${
                i === count - 1 ? 'fill-[#0A5C36] dark:fill-emerald-400' : 'fill-stone-500 dark:fill-neutral-400'
              }`}
            >
              {label}
            </text>
          ))}

          {/* Hover guide */}
          {hover !== null && (
            <line
              x1={xAt(hover)}
              x2={xAt(hover)}
              y1={MARGIN.top}
              y2={MARGIN.top + PLOT_H}
              strokeWidth="1"
              strokeDasharray="3 3"
              className="stroke-stone-400 dark:stroke-neutral-500"
            />
          )}

          {/* Lines + points */}
          {series.map((s) => (
            <g key={s.key}>
              <path
                d={data[s.key].map((v, i) => `${i === 0 ? 'M' : 'L'} ${xAt(i)} ${yAt(v)}`).join(' ')}
                fill="none"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={s.line}
              />
              {data[s.key].map((v, i) => (
                <circle
                  key={i}
                  cx={xAt(i)}
                  cy={yAt(v)}
                  r={hover === i ? 6 : 4}
                  strokeWidth="3"
                  className={`fill-white dark:fill-neutral-900 transition-all ${s.line}`}
                />
              ))}
            </g>
          ))}

          {/* Hover / focus / tap zones: one full-height band per data point */}
          {data.labels.map((label, i) => (
            <rect
              key={label}
              x={MARGIN.left + bandWidth * i}
              y={MARGIN.top}
              width={bandWidth}
              height={PLOT_H}
              fill="transparent"
              tabIndex={0}
              role="img"
              aria-label={`${data.fullLabels[i]}: ${series.map((s) => `${s.label} ${peso(data[s.key][i])}`).join(', ')}`}
              onMouseEnter={() => setHover(i)}
              onClick={() => setHover(i)}
              onFocus={() => setHover(i)}
              onBlur={() => setHover(null)}
              className="focus:outline-none cursor-pointer"
            />
          ))}
        </svg>

        {/* Tooltip */}
        {hover !== null && (
          <div
            className="pointer-events-none absolute top-2 z-10 -translate-x-1/2 whitespace-nowrap rounded-xl bg-stone-900 dark:bg-neutral-700 px-3.5 py-2.5 text-xs text-white shadow-lg"
            style={{ left: `${clamp((xAt(hover) / W) * 100, 14, 86)}%` }}
          >
            <p className="font-semibold mb-1.5">{data.fullLabels[hover]}</p>
            <div className="space-y-1">
              {series.map((s) => (
                <div key={s.key} className="flex items-center justify-between gap-6">
                  <span className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${s.swatch}`}></span>
                    {s.label}
                  </span>
                  <span className="font-bold">{peso(data[s.key][hover])}</span>
                </div>
              ))}
              {series.length > 1 && (
                <div className="flex items-center justify-between gap-6 pt-1.5 mt-1.5 border-t border-white/20">
                  <span>Total</span>
                  <span className="font-bold">{peso(hoverTotal)}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AdminReportsView() {
  const navigate = useNavigate();
  const [timeframe, setTimeframe] = useState('Monthly');
  const [dateRange, setDateRange] = useState(() => defaultReportRange('Monthly'));
  const [draftRange, setDraftRange] = useState(() => rangeToPickerValues(
    'Monthly',
    defaultReportRange('Monthly')
  ));
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [revenueFilter, setRevenueFilter] = useState('All Revenues');
  const reportKey = `${timeframe}:${dateRange.from}:${dateRange.to}`;
  const transactionsKey = `${dateRange.from}:${dateRange.to}`;
  const [reportResult, setReportResult] = useState({ key: '', data: null, error: '' });
  const [transactionResult, setTransactionResult] = useState({ key: '', data: [], error: '' });

  useEffect(() => {
    const controller = new AbortController();
    getReport(timeframe, {
      from: dateRange.from,
      to: dateRange.to,
      signal: controller.signal,
    })
      .then((report) => setReportResult({ key: reportKey, data: report, error: '' }))
      .catch((error) => {
        if (error.name !== 'AbortError') setReportResult({ key: reportKey, data: null, error: error.message });
      });
    return () => controller.abort();
  }, [timeframe, dateRange.from, dateRange.to, reportKey]);

  useEffect(() => {
    const controller = new AbortController();
    getTransactions({
      from: dateRange.from,
      to: dateRange.to,
      signal: controller.signal,
    })
      .then((transactions) => setTransactionResult({ key: transactionsKey, data: transactions, error: '' }))
      .catch((error) => {
        if (error.name !== 'AbortError') setTransactionResult({ key: transactionsKey, data: [], error: error.message });
      });
    return () => controller.abort();
  }, [dateRange.from, dateRange.to, transactionsKey]);

  const chartData = reportResult.key === reportKey && reportResult.data ? reportResult.data : {
    periodLabel: '',
    cardPeriod: '',
    labels: [],
    fullLabels: [],
    membership: [],
    walkIn: [],
  };
  const reportError = reportResult.key === reportKey ? reportResult.error : '';
  const showMembership = revenueFilter !== 'Walk-in';
  const showWalkIn = revenueFilter !== 'Membership';
  const visibleKeys = [showMembership && 'membership', showWalkIn && 'walkIn'].filter(Boolean);

  const totalMembership = sumReportBuckets(chartData.membership);
  const totalWalkIn = sumReportBuckets(chartData.walkIn);
  const totalEarnings = (showMembership ? totalMembership : 0) + (showWalkIn ? totalWalkIn : 0);

  const filterNote = revenueFilter === 'All Revenues' ? '' : ` · ${revenueFilter === 'Walk-in' ? 'Walk-in' : 'Membership'} only`;

  const category = FILTER_CATEGORY[revenueFilter];
  const transactions = transactionResult.key === transactionsKey ? transactionResult.data : [];
  const transactionsError = transactionResult.key === transactionsKey ? transactionResult.error : '';
  const transactionsLoading = transactionResult.key !== transactionsKey;
  const filteredTransactions = transactions.filter((trx) => !category || trx.category === category);
  const toTransactionRow = (trx) => ({
      id: trx.transaction_id,
      date: new Date(trx.transaction_date_created).toLocaleString('en-PH', { timeZone: 'Asia/Manila' }),
      name: trx.customer_name || 'Walk-in customer',
      cat: trx.category,
      method: trx.payment_method || '—',
      amount: peso(Number(trx.amount)),
    });
  const recentRows = filteredTransactions.slice(0, 5).map(toTransactionRow);
  const normalizedDraft = pickerValuesToRange(timeframe, draftRange);
  const draftIsValid = normalizedDraft && normalizedDraft.from <= normalizedDraft.to;

  const switchTimeframe = (nextTimeframe) => {
    const nextRange = defaultReportRange(nextTimeframe);
    setTimeframe(nextTimeframe);
    setDateRange(nextRange);
    setDraftRange(rangeToPickerValues(nextTimeframe, nextRange));
    setIsDatePickerOpen(false);
  };

  const updateDraft = (field, value) => {
    setDraftRange((current) => ({ ...current, [field]: value }));
  };

  const applyDateRange = (event) => {
    event.preventDefault();
    if (!draftIsValid) return;
    setDateRange(normalizedDraft);
    setIsDatePickerOpen(false);
  };

  const resetDateRange = () => {
    const nextRange = defaultReportRange(timeframe);
    setDraftRange(rangeToPickerValues(timeframe, nextRange));
    setDateRange(nextRange);
    setIsDatePickerOpen(false);
  };

  const exportCsv = () => {
    const headers = ['Transaction ID', 'Date', 'Customer', 'Category', 'Payment Method', 'Amount'];
    const rows = filteredTransactions.map(toTransactionRow)
      .map((trx) => [trx.id, trx.date, trx.name, trx.cat, trx.method, trx.amount]);
    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCsvCell).join(','))
      .join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'fitnexx-transactions.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 transition-colors duration-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-stone-900 dark:text-white">Sales Dashboard</h2>
          <p className="text-stone-500 dark:text-neutral-400 text-sm mt-1">Overview of facility revenue and membership growth.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 p-1 rounded-xl flex items-center shadow-sm text-xs font-semibold transition-colors duration-200">
            {TIMEFRAMES.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => switchTimeframe(item)}
                aria-pressed={timeframe === item}
                className={`px-3.5 py-1.5 rounded-lg transition cursor-pointer ${
                  timeframe === item ? 'bg-[#0A5C36] text-white' : 'text-stone-600 dark:text-neutral-400 hover:bg-stone-100 dark:hover:bg-neutral-800'
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setDraftRange(rangeToPickerValues(timeframe, dateRange));
                setIsDatePickerOpen((open) => !open);
              }}
              aria-haspopup="dialog"
              aria-expanded={isDatePickerOpen}
              className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 px-3.5 py-2 rounded-xl text-xs font-semibold text-stone-700 dark:text-neutral-300 shadow-sm flex items-center space-x-2 transition-colors duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0A5C36]"
            >
              <svg className="w-4 h-4 text-stone-500 dark:text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{formatReportRange(timeframe, dateRange)}</span>
            </button>
            {isDatePickerOpen && (
              <form
                role="dialog"
                aria-label={`${timeframe} date range`}
                onSubmit={applyDateRange}
                className="absolute right-0 top-full z-30 mt-2 w-72 rounded-2xl border border-stone-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4 shadow-xl"
              >
                <div className="grid grid-cols-2 gap-3">
                  {['start', 'end'].map((field) => (
                    <label key={field} className="space-y-1 text-xs font-semibold text-stone-600 dark:text-neutral-300">
                      <span>{field === 'start' ? 'Start' : 'End'}</span>
                      <input
                        type={timeframe === 'Daily' ? 'date' : timeframe === 'Monthly' ? 'month' : 'number'}
                        min={timeframe === 'Yearly' ? '1' : undefined}
                        max={timeframe === 'Yearly' ? '9999' : undefined}
                        step={timeframe === 'Yearly' ? '1' : undefined}
                        value={draftRange[field]}
                        onChange={(event) => updateDraft(field, event.target.value)}
                        aria-label={`${field === 'start' ? 'Start' : 'End'} ${timeframe === 'Daily' ? 'date' : timeframe === 'Monthly' ? 'month' : 'year'}`}
                        className="w-full rounded-lg border border-stone-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-2 py-2 text-stone-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0A5C36]"
                      />
                    </label>
                  ))}
                </div>
                {!draftIsValid && (
                  <p role="alert" className="mt-2 text-xs text-red-600 dark:text-red-400">
                    Choose a valid range with the start on or before the end.
                  </p>
                )}
                <div className="mt-4 flex justify-between gap-2 text-xs font-semibold">
                  <button type="button" onClick={resetDateRange} className="text-stone-600 dark:text-neutral-300 hover:underline">
                    Reset
                  </button>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setDraftRange(rangeToPickerValues(timeframe, dateRange));
                        setIsDatePickerOpen(false);
                      }}
                      className="rounded-lg px-3 py-2 text-stone-600 dark:text-neutral-300 hover:bg-stone-100 dark:hover:bg-neutral-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!draftIsValid}
                      className="rounded-lg bg-[#0A5C36] px-3 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <select
          value={revenueFilter}
          onChange={(e) => setRevenueFilter(e.target.value)}
          aria-label="Filter by revenue type"
          className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 px-4 py-2 rounded-xl text-xs font-semibold text-stone-700 dark:text-neutral-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0A5C36] transition-colors duration-200 cursor-pointer"
        >
          {REVENUE_FILTERS.map((option) => (
            <option key={option.value} value={option.value} className="bg-white dark:bg-neutral-900">
              {option.label}
            </option>
          ))}
        </select>

        <button type="button" onClick={exportCsv} disabled={filteredTransactions.length === 0} className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 hover:bg-stone-50 dark:hover:bg-neutral-800 px-4 py-2 rounded-xl text-xs font-semibold text-stone-700 dark:text-neutral-300 shadow-sm flex items-center space-x-2 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
          <svg className="w-4 h-4 text-stone-500 dark:text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span>Export CSV</span>
        </button>
      </div>

      {/* Metric cards: the card for a hidden revenue type is dimmed */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-stone-200 dark:border-neutral-800 shadow-sm relative overflow-hidden transition-colors duration-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-stone-400 dark:text-neutral-500 uppercase tracking-wider">Total Earnings</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-[#0A5C36] dark:text-emerald-400 flex items-center justify-center font-bold">₱</div>
          </div>
          <h3 className="text-3xl font-extrabold text-stone-900 dark:text-white mt-1">{peso(totalEarnings)}</h3>
          <p className="text-xs text-stone-400 dark:text-neutral-500 mt-1">{formatReportRange(timeframe, dateRange)}{filterNote}</p>
        </div>

        <div className={`bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-stone-200 dark:border-neutral-800 shadow-sm relative overflow-hidden transition duration-200 ${showMembership ? '' : 'opacity-50'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-stone-400 dark:text-neutral-500 uppercase tracking-wider">Membership Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-[#0A5C36] dark:text-emerald-400 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
          <h3 className="text-3xl font-extrabold text-stone-900 dark:text-white mt-1">{peso(totalMembership)}</h3>
          <p className="text-xs text-stone-400 dark:text-neutral-500 mt-1">{formatReportRange(timeframe, dateRange)}</p>
        </div>

        <div className={`bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-stone-200 dark:border-neutral-800 shadow-sm relative overflow-hidden transition duration-200 ${showWalkIn ? '' : 'opacity-50'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-stone-400 dark:text-neutral-500 uppercase tracking-wider">Daily / Walk-in Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
          </div>
          <h3 className="text-3xl font-extrabold text-stone-900 dark:text-white mt-1">{peso(totalWalkIn)}</h3>
          <p className="text-xs text-stone-400 dark:text-neutral-500 mt-1">{formatReportRange(timeframe, dateRange)}</p>
        </div>
      </div>

      {/* Revenue chart */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-stone-200 dark:border-neutral-800 shadow-sm p-6 space-y-4 transition-colors duration-200">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-stone-900 dark:text-white text-base">Revenue Breakdown Over Time</h3>
          <div className="flex items-center space-x-4 text-xs font-semibold">
            {SERIES.filter((s) => visibleKeys.includes(s.key)).map((s) => (
              <div key={s.key} className="flex items-center space-x-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${s.swatch}`}></span>
                <span className="text-stone-600 dark:text-neutral-400">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* key resets the hover state whenever the timeframe or filter changes */}
        {reportError ? (
          <p role="alert" className="py-10 text-center text-red-600 dark:text-red-400">{reportError}</p>
        ) : reportResult.key !== reportKey ? (
          <p className="py-10 text-center text-stone-500 dark:text-neutral-400" role="status">Loading report…</p>
        ) : (
          <RevenueChart key={`${timeframe}-${dateRange.from}-${dateRange.to}-${revenueFilter}`} data={chartData} visibleKeys={visibleKeys} />
        )}
      </div>

      {/* Recent transactions */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-stone-200 dark:border-neutral-800 shadow-sm overflow-hidden transition-colors duration-200">
        <div className="p-6 border-b border-stone-200 dark:border-neutral-800 flex items-center justify-between">
          <h3 className="font-bold text-stone-900 dark:text-white text-base">Recent Transactions</h3>
          <button
            type="button"
            onClick={() => navigate('/admin/transaction')}
            className="text-xs font-bold text-[#0A5C36] dark:text-emerald-400 hover:underline cursor-pointer"
          >
            View All →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-200 dark:border-neutral-800 text-stone-400 dark:text-neutral-400 text-xs font-semibold tracking-wider bg-stone-50/50 dark:bg-neutral-800/40">
                <th className="py-3 px-6">TRANSACTION ID</th>
                <th className="py-3 px-6">DATE &amp; TIME</th>
                <th className="py-3 px-6">CUSTOMER NAME</th>
                <th className="py-3 px-6">REVENUE CATEGORY</th>
                <th className="py-3 px-6">PAYMENT METHOD</th>
                <th className="py-3 px-6 text-right">AMOUNT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-neutral-800 text-sm">
              {transactionsError ? (
                <tr><td colSpan={6} role="alert" className="py-10 text-center text-red-600 dark:text-red-400">{transactionsError}</td></tr>
              ) : transactionsLoading ? (
                <tr><td colSpan={6} role="status" className="py-10 text-center text-stone-500 dark:text-neutral-400">Loading transactions…</td></tr>
              ) : recentRows.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-stone-500 dark:text-neutral-400">
                    No recent transactions for this revenue type.
                  </td>
                </tr>
              )}
              {recentRows.map((trx) => (
                <tr key={trx.id} className="hover:bg-stone-50/50 dark:hover:bg-neutral-800/50 transition">
                  <td className="py-4 px-6 font-medium text-stone-600 dark:text-neutral-400">{trx.id}</td>
                  <td className="py-4 px-6 text-stone-600 dark:text-neutral-400">{trx.date}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-stone-200 dark:bg-neutral-800 text-stone-700 dark:text-neutral-300 font-bold text-xs flex items-center justify-center">
                        {trx.name.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <span className="font-semibold text-stone-900 dark:text-white">{trx.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                      trx.cat === 'Membership Renewal'
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                        : 'bg-orange-100 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300'
                    }`}>
                      {trx.cat}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-stone-600 dark:text-neutral-400">{trx.method}</td>
                  <td className="py-4 px-6 text-right font-bold text-stone-900 dark:text-white">{trx.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Escape closes the logout confirmation
  useEffect(() => {
    if (!isLogoutOpen) return undefined;
    const handleKey = (e) => {
      if (e.key === 'Escape') setIsLogoutOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isLogoutOpen]);

  // Header menu "Log Out" only asks first; the confirm button does the actual logout.
  const requestLogout = () => {
    setDropdownOpen(false);
    setIsLogoutOpen(true);
  };

  const handleLogout = () => {
    setIsLogoutOpen(false);
    signOut();
    navigate('/login', { replace: true });
  };

  return (
    <div className="dashboard-shell min-h-screen bg-stone-100 dark:bg-neutral-950 flex font-sans transition-colors duration-200">
      <AdminSidebar />

      <div className="dashboard-content flex-1 flex flex-col min-w-0">
        <header className="dashboard-header bg-white dark:bg-neutral-900 border-b border-stone-200 dark:border-neutral-800 h-16 flex items-center justify-between px-8 relative z-20 transition-colors duration-200">
          <span className="font-semibold text-stone-800 dark:text-neutral-200 text-sm">Gym Management</span>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              aria-label="Account menu"
              aria-haspopup="menu"
              aria-expanded={dropdownOpen}
              className="w-10 h-10 rounded-full bg-stone-200 dark:bg-neutral-800 flex items-center justify-center text-stone-600 dark:text-neutral-300 border border-stone-300 dark:border-neutral-700 hover:bg-stone-300 dark:hover:bg-neutral-700 transition cursor-pointer shadow-xs"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-2xl shadow-xl py-3 px-4 z-50 animate-in fade-in zoom-in-95 transition-colors duration-200">
                <div className="pb-3 border-b border-stone-100 dark:border-neutral-800">
                  <h4 className="font-bold text-stone-900 dark:text-white text-sm">{user?.name || user?.username}</h4>
                  <span className="inline-block mt-1 px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[11px] font-semibold rounded-md">
                    {user?.role === 'admin' ? 'System Administrator' : 'Staff'}
                  </span>
                </div>

                <div className="pt-2">
                  <button
                    onClick={requestLogout}
                    aria-haspopup="dialog"
                    className="w-full px-3 py-2 text-left text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition flex items-center space-x-2.5 cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={logoutIcon} />
                    </svg>
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        <main className="dashboard-main p-8 max-w-6xl w-full min-w-0 mx-auto flex-1">
          <Routes>
            <Route index element={<AdminReportsView />} />
            <Route path="employees" element={<Employees />} />
            <Route path="register-employee" element={<RegisterEmployee />} />
            <Route path="activity-log" element={<ActivityLog />} />
            <Route path="transaction" element={<Transactions />} />
            <Route path="settings" element={<Settings />} />
          </Routes>
        </main>
      </div>

      {/* Logout confirmation (same dialog as the sidebar) */}
      {isLogoutOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setIsLogoutOpen(false);
          }}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="header-logout-title"
            aria-describedby="header-logout-message"
            className="bg-white dark:bg-neutral-900 rounded-3xl border border-stone-200 dark:border-neutral-800 shadow-2xl max-w-sm w-full p-8 text-center animate-in fade-in zoom-in duration-200 motion-reduce:animate-none"
          >
            <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-4 shadow-sm">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={logoutIcon} />
              </svg>
            </div>

            <h3 id="header-logout-title" className="text-xl font-extrabold text-stone-900 dark:text-white">
              Log out?
            </h3>
            <p id="header-logout-message" className="text-sm text-stone-500 dark:text-neutral-400 mt-2 mb-6">
              Are you sure you want to log out? You will be returned to the login screen.
            </p>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                autoFocus
                onClick={() => setIsLogoutOpen(false)}
                className="w-1/2 py-3 border border-stone-200 dark:border-neutral-700 hover:bg-stone-50 dark:hover:bg-neutral-800 text-stone-700 dark:text-neutral-300 rounded-xl text-sm font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="w-1/2 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold shadow-md transition cursor-pointer"
              >
                Yes, log out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
