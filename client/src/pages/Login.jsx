
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLoginSubmit = (e) => {
    e.preventDefault();

    if (username === 'admin' && password === 'admin123') {
      navigate('/admin');
    } else if (username === 'staff' && password === 'staff123') {
      navigate('/');
    } else {
      alert('Invalid username or password! (Use admin/admin123 or staff/staff123)');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 font-sans bg-gradient-to-br from-[#fdfcf8] via-white to-[#e6f1ee]">
      <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-md w-full p-8 space-y-6 relative">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 bg-[#0A5C36] rounded-full mx-auto flex items-center justify-center text-white shadow-md">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-stone-900">Gym ni Lucas</h2>
            <p className="text-xs text-stone-500 mt-0.5">Sign in to your account</p>
          </div>
        </div>

        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="ID / Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3.5 bg-white border border-stone-200 rounded-2xl text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A5C36]"
              required
            />
          </div>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3.5 bg-white border border-stone-200 rounded-2xl text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A5C36] pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-600 cursor-pointer"
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
            <a
              href="#forgot"
              onClick={(e) => {
                e.preventDefault();
                alert('Password reset link sent.');
              }}
              className="text-xs font-medium text-[#0A5C36] hover:underline"
            >
              Forgot password?
            </a>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-[#0A5C36] hover:bg-[#074729] text-white font-semibold py-3.5 rounded-2xl text-sm shadow-md transition flex items-center justify-center space-x-2 cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              <span>Sign In</span>
            </button>
          </div>
        </form>

        <div className="text-center text-xs text-stone-500 pt-2">
          Need an account? <span className="text-[#0A5C36] font-semibold cursor-pointer hover:underline">Register here</span>
        </div>
      </div>
    </div>
  );
}
