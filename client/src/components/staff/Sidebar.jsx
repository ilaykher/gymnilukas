import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logoImage from '../../assets/logo.jpg';
import { useAuth } from '../../context/useAuth';
import { logout as logoutRequest } from '../../lib/api';

const CHECK_IN_PATH = '/check-in';

const navItems = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  },
  {
    to: '/register-member',
    label: 'Register Member',
    icon: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z',
  },
  {
    to: CHECK_IN_PATH,
    label: 'Check-in',
    // circled check mark
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  {
    to: '/walk-in-registration',
    label: 'Walk-in',
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
  },
  {
    to: '/members',
    label: 'Members',
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
  },
];

const settingsItem = {
  to: '/settings',
  label: 'Settings',
  icon: [
    'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
    'M15 12a3 3 0 11-6 0 3 3 0 016 0z',
  ],
};

const logoutItem = {
  label: 'Logout',
  icon: 'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1',
};

const linkBase =
  'flex items-center space-x-3 px-4 py-3 rounded-xl transition text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70';
const activeClass = 'bg-orange-600 text-white font-semibold shadow-md';
const idleClass = 'text-emerald-100 hover:bg-white/10 dark:hover:bg-neutral-800';
const disabledClass = 'w-full text-left text-emerald-100/35 dark:text-neutral-600 cursor-not-allowed';

const Icon = ({ paths }) => (
  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    {[].concat(paths).map((d, i) => (
      <path key={i} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={d} />
    ))}
  </svg>
);

// A nav entry is either a link (item.to), or an action button when onClick is passed (e.g. Logout).
function NavItem({ item, active, disabled, onClick }) {
  if (disabled) {
    return (
      <button
        type="button"
        disabled
        title="Unavailable while the staff is on a break"
        className={`${linkBase} ${disabledClass}`}
      >
        <Icon paths={item.icon} />
        <span>{item.label}</span>
      </button>
    );
  }

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-haspopup="dialog"
        className={`${linkBase} ${idleClass} w-full text-left cursor-pointer`}
      >
        <Icon paths={item.icon} />
        <span>{item.label}</span>
      </button>
    );
  }

  return (
    <Link
      to={item.to}
      aria-current={active ? 'page' : undefined}
      className={`${linkBase} ${active ? activeClass : idleClass}`}
    >
      <Icon paths={item.icon} />
      <span>{item.label}</span>
    </Link>
  );
}

// Confirmation dialog shown before logging out.
// Rendered in a portal so it sits above the sticky header (the sidebar creates its own stacking context).
function LogoutConfirmModal({ onCancel, onConfirm, isLoggingOut, error }) {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onCancel]);

  return createPortal(
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="logout-title"
        aria-describedby="logout-message"
        className="bg-white dark:bg-neutral-900 rounded-3xl border border-stone-200 dark:border-neutral-800 shadow-2xl max-w-sm w-full p-8 text-center animate-in fade-in zoom-in duration-200 motion-reduce:animate-none"
      >
        <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-4 shadow-sm">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={logoutItem.icon} />
          </svg>
        </div>

        <h3 id="logout-title" className="text-xl font-extrabold text-stone-900 dark:text-white">
          Log out?
        </h3>
        <p id="logout-message" className="text-sm text-stone-500 dark:text-neutral-400 mt-2 mb-6">
          Are you sure you want to log out? You will be returned to the login screen.
        </p>
        {error && <p role="alert" className="mb-4 text-sm text-red-600 dark:text-red-400">{error}</p>}

        <div className="flex items-center space-x-3">
          <button
            type="button"
            autoFocus
            onClick={onCancel}
            disabled={isLoggingOut}
            className="w-1/2 py-3 border border-stone-200 dark:border-neutral-700 hover:bg-stone-50 dark:hover:bg-neutral-800 text-stone-700 dark:text-neutral-300 rounded-xl text-sm font-bold transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoggingOut}
            className="w-1/2 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-60 disabled:cursor-wait text-white rounded-xl text-sm font-bold shadow-md transition cursor-pointer"
          >
            {isLoggingOut ? 'Recording...' : 'Yes, log out'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// isOnBreak: when true, every button except Check-in is disabled (set by DashboardLayout's "Take a break").
export default function Sidebar({ isOnBreak = false }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState('');
  const isActive = (path) => location.pathname === path;
  const isDisabled = (item) => isOnBreak && item.to !== CHECK_IN_PATH;

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    setLogoutError('');
    try {
      await logoutRequest();
      signOut();
      setIsLogoutOpen(false);
      navigate('/login', { replace: true });
    } catch (error) {
      setLogoutError(error.message || 'Unable to record shift end. Please try again.');
      setIsLoggingOut(false);
    }
  };

  return (
    // sticky + h-screen keeps the sidebar locked in place while the page content scrolls
    <aside className="w-64 sticky top-0 h-screen self-start bg-[#0A5C36] dark:bg-neutral-900 text-white flex flex-col justify-between select-none shrink-0 border-r border-transparent dark:border-neutral-800 transition-colors duration-200">
      <div className="min-h-0 overflow-y-auto">
        <div className="p-6 flex items-center space-x-3 border-b border-[#0f7a4a] dark:border-neutral-800">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/10 flex items-center justify-center shrink-0 border border-white/20 shadow-sm">
            <img src={logoImage} alt="Gym ni Lucas Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="font-bold text-base leading-tight">Gym ni Lucas</h1>
            <p className="text-xs text-emerald-200/80">Staff</p>
          </div>
        </div>

        <nav className="p-4 space-y-1" aria-label="Main navigation">
          {navItems.map((item) => (
            <NavItem key={item.to} item={item} active={isActive(item.to)} disabled={isDisabled(item)} />
          ))}
        </nav>
      </div>

      <div className="p-4 space-y-1 border-t border-[#0f7a4a] dark:border-neutral-800">
        <NavItem
          item={settingsItem}
          active={isActive(settingsItem.to)}
          disabled={isDisabled(settingsItem)}
        />

        {/* Opens a confirmation dialog instead of logging out immediately (still disabled during a break) */}
        <NavItem
          item={logoutItem}
          disabled={isOnBreak}
          onClick={() => setIsLogoutOpen(true)}
        />
      </div>

      {isLogoutOpen && (
        <LogoutConfirmModal
          onCancel={() => setIsLogoutOpen(false)}
          onConfirm={handleLogout}
          isLoggingOut={isLoggingOut}
          error={logoutError}
        />
      )}
    </aside>
  );
}