import React, { useState, useRef, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/staff/Sidebar';

export default function DashboardLayout() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
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

  const handleLogout = () => {
    setDropdownOpen(false);
    navigate('/login');
  };

  const getHeaderTitle = () => {
    if (location.pathname === '/members') return 'Member Directory';
    if (location.pathname === '/member-profile') return 'Member Profile';
    if (location.pathname === '/walk-in-registration') return 'Walk-In Registration';
    if (location.pathname === '/register-member' || location.pathname === '/') return 'Gym Management';
    if (location.pathname === '/settings') return 'Settings';
    return 'Gym Management';
  };

  return (
    <div className="min-h-screen bg-[#f4f5f0] dark:bg-neutral-950 flex font-sans select-none transition-colors duration-200">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white dark:bg-neutral-900 border-b border-stone-200 dark:border-neutral-800 h-16 flex items-center justify-between px-8 relative z-20 transition-colors duration-200">
          <span className="font-semibold text-stone-800 dark:text-white text-sm">{getHeaderTitle()}</span>
          
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-9 h-9 rounded-full bg-stone-200 dark:bg-neutral-800 flex items-center justify-center text-stone-600 dark:text-neutral-300 border border-stone-300 dark:border-neutral-700 hover:bg-stone-300 dark:hover:bg-neutral-700 transition cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

                {/* Divider & Logout Action */}
                <div className="p-2 bg-white dark:bg-neutral-900">
                  <button 
                    onClick={handleLogout}
                    className="w-full px-3 py-2.5 text-left font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition flex items-center space-x-2.5 cursor-pointer"
                  >
                    <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="text-sm">Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        <main className="p-8 max-w-7xl w-full mx-auto flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}