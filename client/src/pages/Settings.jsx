
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

export default function Settings() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const { isDarkMode, toggleDarkMode } = useTheme();

  const [plans, setPlans] = useState([
    {
      id: 1,
      name: 'Monthly Membership',
      type: 'Recurring',
      rate: '49.99',
      unit: '/mo',
      badgeStyle: 'bg-emerald-100 text-emerald-800'
    },
    {
      id: 2,
      name: 'Day Pass',
      type: 'One-Time',
      rate: '15.00',
      unit: '/visit',
      badgeStyle: 'bg-orange-100 text-orange-800'
    }
  ]);

  const handleRateChange = (id, newRate) => {
    if (!isAdmin) return;

    setPlans((previousPlans) =>
      previousPlans.map((plan) =>
        plan.id === id ? { ...plan, rate: newRate } : plan
      )
    );
  };

  const handleSave = (planName) => {
    if (!isAdmin) return;
    alert(`Successfully saved changes for ${planName}!`);
  };

  const cardClass = isDarkMode
    ? 'bg-neutral-900 border-neutral-800'
    : 'bg-white border-stone-200';

  const headingClass = isDarkMode
    ? 'text-white'
    : 'text-stone-900';

  const mutedClass = isDarkMode
    ? 'text-neutral-400'
    : 'text-stone-500';

  const sectionHeaderClass = isDarkMode
    ? 'border-neutral-800 bg-neutral-800/40'
    : 'border-stone-200 bg-stone-50/50';

  const tableHeaderClass = isDarkMode
    ? 'border-neutral-800 bg-neutral-800/30 text-neutral-400'
    : 'border-stone-200 bg-stone-50/30 text-stone-400';

  const tableRowClass = isDarkMode
    ? 'divide-neutral-800 text-neutral-300'
    : 'divide-stone-100 text-stone-700';

  const inputClass = isDarkMode
    ? 'border-neutral-700 bg-neutral-800 text-white placeholder-neutral-500'
    : 'border-stone-200 bg-white text-stone-800 placeholder-stone-400';

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h2 className={`text-2xl font-bold ${headingClass}`}>
              Settings
            </h2>

            {!isAdmin && (
              <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2.5 py-0.5 rounded-md tracking-wider">
                STAFF VIEW ONLY
              </span>
            )}
          </div>

          <p className={`text-sm mt-1 ${mutedClass}`}>
            Manage your appearance preferences and subscription plan settings.
          </p>
        </div>
      </div>

      {/* Appearance Settings */}
      <section className={`rounded-2xl border shadow-sm overflow-hidden ${cardClass}`}>
        <div className={`p-6 border-b flex items-center gap-3 ${sectionHeaderClass}`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            isDarkMode
              ? 'bg-neutral-700 text-white'
              : 'bg-stone-200 text-stone-700'
          }`}>
            {isDarkMode ? (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="4" strokeWidth="2" />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"
                />
              </svg>
            )}
          </div>

          <div>
            <h3 className={`font-bold text-base ${headingClass}`}>
              Appearance
            </h3>
            <p className={`text-xs mt-1 ${mutedClass}`}>
              Customize how FITNEXX looks on your device.
            </p>
          </div>
        </div>

        <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div>
            <p className={`font-semibold text-sm ${headingClass}`}>
              Dark Mode
            </p>
            <p className={`text-sm mt-1 ${mutedClass}`}>
              {isDarkMode
                ? 'Dark appearance is currently enabled.'
                : 'Use a darker appearance to reduce screen brightness.'}
            </p>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={isDarkMode}
            aria-label="Toggle Dark Mode"
            onClick={toggleDarkMode}
            className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#0A5C36] focus:ring-offset-2 ${
              isDarkMode ? 'bg-[#0A5C36]' : 'bg-stone-300'
            } ${isDarkMode ? 'focus:ring-offset-neutral-900' : 'focus:ring-offset-white'}`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                isDarkMode ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </section>

      {/* Subscription Plans */}
      <section className={`rounded-2xl border shadow-sm overflow-hidden ${cardClass}`}>
        <div className={`p-6 border-b flex items-center justify-between ${sectionHeaderClass}`}>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
            </div>

            <div>
              <h3 className={`font-bold text-base ${headingClass}`}>
                Subscription Plans
              </h3>
              <p className={`text-xs ${mutedClass}`}>
                {plans.length} plans - {plans.length} active
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b text-xs font-semibold tracking-wider ${tableHeaderClass}`}>
                <th className="py-3.5 px-6">PLAN NAME</th>
                <th className="py-3.5 px-6">TYPE</th>
                <th className="py-3.5 px-6">RATE (PHP)</th>
                <th className="py-3.5 px-6 text-right">ACTIONS</th>
              </tr>
            </thead>

            <tbody className={`divide-y text-sm ${tableRowClass}`}>
              {plans.map((plan) => (
                <tr
                  key={plan.id}
                  className={`transition ${
                    isDarkMode
                      ? 'hover:bg-neutral-800/70'
                      : 'hover:bg-stone-50/50'
                  }`}
                >
                  <td className={`py-4 px-6 font-semibold ${headingClass}`}>
                    {plan.name}
                  </td>

                  <td className="py-4 px-6">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${plan.badgeStyle}`}>
                      {plan.type}
                    </span>
                  </td>

                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <span className={`font-medium ${mutedClass}`}>₱</span>

                      <input
                        type="text"
                        value={plan.rate}
                        onChange={(e) => handleRateChange(plan.id, e.target.value)}
                        disabled={!isAdmin}
                        className={`w-28 px-3 py-1.5 border rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0A5C36] ${
                          inputClass
                        } ${
                          !isAdmin
                            ? 'opacity-70 cursor-not-allowed'
                            : ''
                        }`}
                      />

                      <span className={`text-xs font-medium ${mutedClass}`}>
                        {plan.unit}
                      </span>
                    </div>
                  </td>

                  <td className="py-4 px-6 text-right">
                    <button
                      type="button"
                      disabled={!isAdmin}
                      onClick={() => handleSave(plan.name)}
                      className={`px-4 py-1.5 border rounded-xl text-xs font-semibold transition ${
                        isAdmin
                          ? isDarkMode
                            ? 'border-neutral-600 text-neutral-200 hover:bg-neutral-800 cursor-pointer'
                            : 'border-stone-300 text-stone-700 hover:bg-stone-50 cursor-pointer'
                          : isDarkMode
                            ? 'border-neutral-700 text-neutral-600 bg-neutral-800 cursor-not-allowed'
                            : 'border-stone-200 text-stone-300 bg-stone-50 cursor-not-allowed'
                      }`}
                    >
                      Save
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
