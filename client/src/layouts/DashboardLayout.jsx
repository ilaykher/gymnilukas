import React, { useState, useRef, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/staff/Sidebar';

// Pages that use the full width of the content area (no max-w cap)
const FULL_WIDTH_PATHS = ['/', '/realtime-activity', '/check-in', '/register-member', '/walk-in-registration'];

const CHECK_IN_PATH = '/check-in';
const BREAK_KEY = 'staffOnBreak';

// MOCK: matches the demo staff credentials in Login.jsx (staff / staff123).
// Replace with a real check against the logged-in staff account's password.
const STAFF_PASSWORD = 'staff123';

const readBreakFlag = () => {
  try {
    return localStorage.getItem(BREAK_KEY) === 'true';
  } catch {
    return false;
  }
};

export default function DashboardLayout() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isOnBreak, setIsOnBreak] = useState(readBreakFlag);
  const [isResumeOpen, setIsResumeOpen] = useState(false);
  const [resumePassword, setResumePassword] = useState('');
  const [resumeError, setResumeError] = useState('');
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // While on a break, only the check-in page is reachable (also covers typed URLs and the back button).
  useEffect(() => {
    if (isOnBreak && location.pathname !== CHECK_IN_PATH) {
      navigate(CHECK_IN_PATH, { replace: true });
    }
  }, [isOnBreak, location.pathname, navigate]);

  // Escape closes the password dialog
  useEffect(() => {
    if (!isResumeOpen) return undefined;
    const handleKey = (e) => {
      if (e.key === 'Escape') setIsResumeOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isResumeOpen]);

  const saveBreakFlag = (value) => {
    setIsOnBreak(value);
    try {
      localStorage.setItem(BREAK_KEY, String(value));
    } catch {
      // Storage unavailable: the break still applies until the page is reloaded.
    }
  };

  const startBreak = () => {
    setDropdownOpen(false);
    saveBreakFlag(true);
  };

  const openResume = () => {
    setDropdownOpen(false);
    setResumePassword('');
    setResumeError('');
    setIsResumeOpen(true);
  };

  const handleResumeSubmit = (e) => {
    e.preventDefault();
    if (resumePassword === STAFF_PASSWORD) {
      saveBreakFlag(false);
      setIsResumeOpen(false);
      setResumePassword('');
      setResumeError('');
    } else {
      setResumeError('Incorrect password. Please try again.');
      setResumePassword('');
    }
  };

  const handleLogout = () => {
    if (isOnBreak) return;
    setDropdownOpen(false);
    navigate('/login');
  };

  const getHeaderTitle = () => {
    if (location.pathname === '/members') return 'Member Directory';
    if (location.pathname === '/member-profile') return 'Member Profile';
    if (location.pathname === '/walk-in-registration') return 'Walk-In Registration';
    if (location.pathname === '/realtime-activity') return 'Real-time Activity';
    if (location.pathname === '/check-in') return 'Member Check-In';
    if (location.pathname === '/register-member' || location.pathname === '/') return 'Gym Management';
    if (location.pathname === '/settings') return 'Settings';
    return 'Gym Management';
  };

  const isFullWidth = FULL_WIDTH_PATHS.includes(location.pathname);

  return (
    <div className="min-h-screen bg-[#f4f5f0] dark:bg-neutral-950 flex font-sans transition-colors duration-200">
      <Sidebar isOnBreak={isOnBreak} />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white dark:bg-neutral-900 border-b border-stone-200 dark:border-neutral-800 h-16 flex items-center justify-between px-8 sticky top-0 z-20 transition-colors duration-200">
          <div className="flex items-center gap-3 min-w-0">
            <span className="font-semibold text-stone-800 dark:text-white text-sm">{getHeaderTitle()}</span>
            {isOnBreak && (
              <span
                role="status"
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-semibold"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400"></span>
                On break · only Check-in is available
              </span>
            )}
          </div>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              aria-label="Account menu"
              aria-haspopup="menu"
              aria-expanded={dropdownOpen}
              className="w-9 h-9 rounded-full bg-stone-200 dark:bg-neutral-800 flex items-center justify-center text-stone-600 dark:text-neutral-300 border border-stone-300 dark:border-neutral-700 hover:bg-stone-300 dark:hover:bg-neutral-700 transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A5C36]"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in duration-150">
                {/* Profile Header Details */}
                <div className="p-4 bg-[#f9faf8] dark:bg-neutral-800/50 space-y-1 border-b border-stone-100 dark:border-neutral-800">
                  <h4 className="font-bold text-stone-900 dark:text-white text-sm">Lucas Staff</h4>
                  <span className="inline-block px-2.5 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-semibold rounded-md">
                    Front-Desk
                  </span>
                </div>

                <div className="p-2 bg-white dark:bg-neutral-900 space-y-1">
                  {/* Take a break / End break */}
                  <button
                    onClick={isOnBreak ? openResume : startBreak}
                    className="w-full px-3 py-2.5 text-left font-bold text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-xl transition flex items-center space-x-2.5 cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      {isOnBreak ? (
                        <>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </>
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      )}
                    </svg>
                    <span className="text-sm">{isOnBreak ? 'End break' : 'Take a break'}</span>
                  </button>

                  {/* Divider & Logout Action */}
                  <button
                    onClick={handleLogout}
                    disabled={isOnBreak}
                    title={isOnBreak ? 'Unavailable while on a break' : undefined}
                    className="w-full px-3 py-2.5 text-left font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition flex items-center space-x-2.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                  >
                    <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="text-sm">Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* flex flex-col lets pages use flex-1 to fill the remaining height. */}
        <main className={`p-8 w-full flex-1 flex flex-col ${isFullWidth ? '' : 'max-w-7xl mx-auto'}`}>
          <Outlet />
        </main>
      </div>

      {/* Password dialog to end the break */}
      {isResumeOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setIsResumeOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="resume-title"
            className="bg-white dark:bg-neutral-900 rounded-3xl border border-stone-200 dark:border-neutral-800 shadow-2xl max-w-sm w-full p-8 animate-in fade-in zoom-in duration-200 motion-reduce:animate-none"
          >
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 flex items-center justify-center mx-auto mb-4 shadow-sm">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 id="resume-title" className="text-xl font-extrabold text-stone-900 dark:text-white">
                Resume Work
              </h3>
              <p className="text-sm text-stone-500 dark:text-neutral-400 mt-1">
                Enter your account password to unlock the sidebar.
              </p>
            </div>

            <form onSubmit={handleResumeSubmit} className="space-y-4">
              <div>
                <label htmlFor="resume-password" className="block text-xs font-semibold text-stone-700 dark:text-neutral-300 mb-1">
                  Password
                </label>
                <input
                  id="resume-password"
                  type="password"
                  autoFocus
                  value={resumePassword}
                  onChange={(e) => {
                    setResumePassword(e.target.value);
                    if (resumeError) setResumeError('');
                  }}
                  placeholder="Enter your password"
                  required
                  aria-invalid={resumeError ? 'true' : undefined}
                  aria-describedby={resumeError ? 'resume-error' : undefined}
                  className={`w-full px-4 py-3 bg-white dark:bg-neutral-800 border rounded-xl text-stone-800 dark:text-white placeholder-stone-400 dark:placeholder-neutral-500 text-sm focus:outline-none focus:ring-2 ${
                    resumeError
                      ? 'border-red-400 dark:border-red-500 focus:ring-red-500'
                      : 'border-stone-200 dark:border-neutral-700 focus:ring-[#0A5C36]'
                  }`}
                />
                {resumeError && (
                  <p id="resume-error" role="alert" className="text-xs font-medium text-red-600 dark:text-red-400 mt-1.5">
                    {resumeError}
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-3 pt-1">
                <button
                  type="button"
                  onClick={() => setIsResumeOpen(false)}
                  className="w-1/3 py-3 border border-stone-200 dark:border-neutral-700 hover:bg-stone-50 dark:hover:bg-neutral-800 text-stone-700 dark:text-neutral-300 rounded-xl text-sm font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-3 bg-[#0A5C36] hover:bg-[#074729] text-white rounded-xl text-sm font-bold shadow-md transition cursor-pointer"
                >
                  Unlock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
