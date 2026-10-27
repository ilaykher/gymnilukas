
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { getActivityExpiryText } from '../../lib/activity';

const badgeStyles = {
  Active: {
    pill: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300',
    dot: 'bg-emerald-600 dark:bg-emerald-400',
  },
  'Expires Soon': {
    pill: 'bg-yellow-100 dark:bg-yellow-950/60 text-yellow-800 dark:text-yellow-300',
    dot: 'bg-yellow-500 dark:bg-yellow-400',
  },
  Expired: {
    pill: 'bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300',
    dot: 'bg-red-600 dark:bg-red-400',
  },
};

export default function ActivityTable({ rows, emptyMessage = 'No activity found.' }) {
  const [tooltip, setTooltip] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState(null);
  const tooltipRef = useRef(null);
  const hideTimer = useRef(null);

  const cancelHide = () => {
    clearTimeout(hideTimer.current);
  };

  const hideTooltip = () => {
    cancelHide();
    hideTimer.current = setTimeout(() => setTooltip((current) => (
      current?.pinned ? current : null
    )), 150);
  };

  const showTooltip = (id, text, anchor) => {
    cancelHide();
    setTooltip((current) => ({
      id,
      text,
      anchor,
      pinned: current?.id === id && current.pinned,
    }));
  };

  const toggleTooltip = (id, text, anchor) => {
    cancelHide();
    setTooltip((current) => (
      current?.id === id && current.pinned
        ? null
        : { id, text, anchor, pinned: true }
    ));
  };

  useLayoutEffect(() => {
    if (!tooltip) return undefined;

    const updatePosition = () => {
      const anchorRect = tooltip.anchor.getBoundingClientRect();
      const tooltipRect = tooltipRef.current?.getBoundingClientRect();
      if (!tooltipRect) return;

      const margin = 12;
      const gap = 8;
      const left = Math.min(
        Math.max(anchorRect.left + (anchorRect.width - tooltipRect.width) / 2, margin),
        window.innerWidth - tooltipRect.width - margin
      );
      const below = anchorRect.bottom + gap;
      const top = below + tooltipRect.height <= window.innerHeight - margin
        ? below
        : Math.max(margin, anchorRect.top - tooltipRect.height - gap);
      setTooltipPosition({ top, left });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [tooltip]);

  useEffect(() => () => clearTimeout(hideTimer.current), []);

  useEffect(() => {
    if (!tooltip) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setTooltip(null);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [tooltip]);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-stone-200 dark:border-neutral-800 text-stone-500 dark:text-neutral-400 text-xs font-semibold tracking-wider bg-stone-50/50 dark:bg-neutral-800/40">
            <th className="py-3 px-6">MEMBER NAME</th>
            <th className="py-3 px-6">TIME</th>
            <th className="py-3 px-6">TYPE</th>
            <th className="py-3 px-6">SUBSCRIPTION STATUS</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100 dark:divide-neutral-800 text-sm">
          {rows.length === 0 && (
            <tr>
              <td colSpan={4} className="py-12 text-center text-stone-500 dark:text-neutral-400">
                {emptyMessage}
              </td>
            </tr>
          )}
          {rows.map((row, index) => {
            const style = badgeStyles[row.status] || badgeStyles.Active;
            const disclosureId = `activity-expiry-${index}`;
            const isDisclosed = tooltip?.id === disclosureId;
            const expiryText = getActivityExpiryText(row);
            return (
              <tr
                key={`${row.name}-${index}`}
                className="hover:bg-stone-50 dark:hover:bg-neutral-800/50 focus:bg-stone-50 dark:focus:bg-neutral-800/50 focus:outline-none"
              >
                <td className="py-4 px-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-stone-200 dark:bg-neutral-800 text-stone-700 dark:text-neutral-300 font-bold text-xs flex items-center justify-center shrink-0">
                      {row.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <span className="font-semibold text-stone-900 dark:text-white">{row.name}</span>
                  </div>
                </td>
                <td className="py-4 px-6 text-stone-600 dark:text-neutral-400">{row.time}</td>
                <td className="py-4 px-6">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      row.type === 'Monthly Member'
                        ? 'bg-stone-100 dark:bg-neutral-800 text-stone-700 dark:text-neutral-300'
                        : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                    }`}
                  >
                    {row.type}
                  </span>
                </td>
                <td className="py-4 px-6 relative">
                  <div className="relative inline-flex items-center gap-2">
                    <span
                      className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium ${style.pill}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`}></span>
                      <span>{row.status}</span>
                    </span>
                    <button
                      type="button"
                      aria-label={`Show membership expiration for ${row.name}`}
                      aria-expanded={isDisclosed}
                      aria-describedby={isDisclosed ? disclosureId : undefined}
                      onMouseEnter={(event) => showTooltip(disclosureId, expiryText, event.currentTarget)}
                      onMouseLeave={hideTooltip}
                      onFocus={(event) => showTooltip(disclosureId, expiryText, event.currentTarget)}
                      onBlur={hideTooltip}
                      onClick={(event) => toggleTooltip(disclosureId, expiryText, event.currentTarget)}
                      className="rounded-full px-1.5 text-xs font-bold text-stone-500 hover:text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A5C36] dark:text-neutral-300 dark:hover:text-white"
                    >
                      i
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {tooltip && createPortal(
        <span
          ref={tooltipRef}
          id={tooltip.id}
          role="tooltip"
          onMouseEnter={cancelHide}
          onMouseLeave={hideTooltip}
          className="fixed z-[100] max-w-[min(16rem,calc(100vw-1.5rem))] rounded-lg bg-stone-900 dark:bg-neutral-700 px-3 py-2 text-xs font-medium text-white shadow-lg"
          style={{
            top: tooltipPosition?.top ?? 0,
            left: tooltipPosition?.left ?? 0,
            visibility: tooltipPosition ? 'visible' : 'hidden',
          }}
        >
          {tooltip.text}
        </span>,
        document.body
      )}
    </div>
  );
}
