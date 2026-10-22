import React, { useEffect, useRef } from 'react';

// Themed replacement for window.alert().
// Usage: <AlertModal alert={{ type: 'success' | 'error' | 'info', title, message, confirmLabel? }} onClose={fn} />
// Pass alert={null} to hide it.

const STYLES = {
  success: {
    badge: 'bg-emerald-100 dark:bg-emerald-950 text-[#0A5C36] dark:text-emerald-400',
    title: 'text-[#0A5C36] dark:text-emerald-400',
    button: 'bg-[#0A5C36] hover:bg-[#074729]',
    path: 'M5 13l4 4L19 7',
  },
  error: {
    badge: 'bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400',
    title: 'text-red-600 dark:text-red-400',
    button: 'bg-red-600 hover:bg-red-700',
    path: 'M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z',
  },
  info: {
    badge: 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400',
    title: 'text-stone-900 dark:text-white',
    button: 'bg-[#0A5C36] hover:bg-[#074729]',
    path: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  },
};

export default function AlertModal({ alert, onClose }) {
  const buttonRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!alert) return undefined;
    buttonRef.current?.focus();

    const handleKey = (e) => {
      if (e.key === 'Escape') onCloseRef.current();
      // The OK button is the only control, so keep focus on it while the dialog is open.
      if (e.key === 'Tab') {
        e.preventDefault();
        buttonRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [alert]);

  if (!alert) return null;

  const style = STYLES[alert.type] || STYLES.info;

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-60 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="alert-title"
        aria-describedby="alert-message"
        className="bg-white dark:bg-neutral-900 rounded-3xl border border-stone-200 dark:border-neutral-800 shadow-2xl max-w-sm w-full p-8 text-center animate-in fade-in zoom-in duration-200 motion-reduce:animate-none"
      >
        <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm ${style.badge}`}>
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={style.path} />
          </svg>
        </div>

        <h3 id="alert-title" className={`text-xl font-extrabold ${style.title}`}>
          {alert.title}
        </h3>
        <p id="alert-message" className="text-sm text-stone-500 dark:text-neutral-400 mt-2 mb-6">
          {alert.message}
        </p>

        <button
          ref={buttonRef}
          type="button"
          onClick={onClose}
          className={`w-full py-3 text-white rounded-xl text-sm font-bold shadow-md transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0A5C36] dark:focus-visible:ring-offset-neutral-900 ${style.button}`}
        >
          {alert.confirmLabel || 'OK'}
        </button>
      </div>
    </div>
  );
}
