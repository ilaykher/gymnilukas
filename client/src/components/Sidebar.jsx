import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Sidebar() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <aside className="w-64 bg-[#0A5C36] text-white flex flex-col justify-between hidden md:flex select-none shrink-0">
      <div>
        {/* Logo / Header */}
        <div className="p-6 flex items-center space-x-3 border-b border-[#0f7a4a]">
          <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
          </div>
          <div>
            <h1 className="font-bold text-base leading-tight">Gym ni Lucas</h1>
            <p className="text-xs text-emerald-200/80">Gym Management v1.2</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-1">
          <Link 
            to="/" 
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition text-sm font-medium ${
              isActive('/') ? 'bg-white/10 text-white font-semibold' : 'text-emerald-100 hover:bg-white/10'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            <span>Check-in</span>
          </Link>

          <Link 
            to="/members" 
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition text-sm font-medium ${
              isActive('/members') ? 'bg-white/10 text-white font-semibold' : 'text-emerald-100 hover:bg-white/10'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>Members</span>
          </Link>
        </nav>
      </div>

      {/* Bottom Section: Register Button + Settings & Logout */}
      <div className="p-4 space-y-4 border-t border-[#0f7a4a]">
        {/* Register Member CTA Button */}
        <Link 
          to="/register-member"
          className={`flex items-center justify-center space-x-2 w-full py-3 px-4 rounded-xl font-semibold text-sm shadow-lg transition ${
            isActive('/register-member') ? 'bg-orange-700 text-white ring-2 ring-white/30' : 'bg-orange-600 hover:bg-orange-700 text-white'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          <span>Register Member</span>
        </Link>

        <div className="space-y-1">
          <Link 
            to="/settings" 
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition text-sm font-semibold ${
              isActive('/settings') ? 'bg-orange-600 text-white shadow-lg' : 'text-emerald-100 hover:bg-white/10'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Settings</span>
          </Link>

          <Link 
            to="/login" 
            className="flex items-center space-x-3 px-4 py-3 rounded-xl text-emerald-100 hover:bg-white/10 transition text-sm font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Logout</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}