import React, { useState } from 'react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    alert(`UI Test: Naka-log in gamit ang username na "${username}"`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-stone-50 rounded-2xl shadow-2xl overflow-hidden border border-stone-200">
        {/* Top Branding Accent */}
        <div className="h-2 bg-[#0A5C36]"></div>

        <div className="p-8 sm:p-10 flex flex-col items-center">
          {/* Logo Icon */}
          <div className="w-14 h-14 bg-[#0A5C36] rounded-full flex items-center justify-center text-white mb-4 shadow-md">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
          </div>

          {/* Title & Subtitle */}
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Gym ni Lucas</h1>
          <p className="text-sm text-stone-500 mt-1 mb-8">Sign in to your account</p>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="w-full space-y-4">
            <div>
              <input
                type="text"
                placeholder="ID / Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#0A5C36] focus:border-transparent text-sm bg-white"
              />
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#0A5C36] focus:border-transparent text-sm bg-white pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-600 focus:outline-none"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {showPassword ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  )}
                </svg>
              </button>
            </div>

            <div className="flex justify-end">
              <a href="#forgot" onClick={(e) => e.preventDefault()} className="text-xs text-[#0A5C36] hover:underline font-medium">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#0A5C36] hover:bg-[#074729] text-white font-medium rounded-lg transition duration-200 flex items-center justify-center space-x-2 shadow-md text-sm cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              <span>Sign In</span>
            </button>
          </form>

          {/* Footer text */}
          <p className="text-xs text-stone-500 mt-6">
            Need an account? <span className="text-[#0A5C36] font-medium cursor-pointer hover:underline">Register here</span>
          </p>
        </div>
      </div>
    </div>
  );
}