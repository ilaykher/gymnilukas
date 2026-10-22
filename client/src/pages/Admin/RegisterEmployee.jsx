import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AlertModal from '../../components/AlertModal';

export default function RegisterEmployee() {
  const navigate = useNavigate();
  const [alertState, setAlertState] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    role: '',
    email: '',
    phone: '',
    pin: '',
    isActive: true
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setAlertState({
      type: 'success',
      title: 'Staff Registered',
      message: `Staff member ${formData.fullName} successfully registered!`,
    });
  };

  const closeAlert = () => {
    setAlertState(null);
    navigate('/admin/employees');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 select-none py-4 transition-colors duration-200">
      {/* Header Title + Back button (right side, in line with the title) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-stone-900 dark:text-white">Register New Employee</h2>
          <p className="text-stone-500 dark:text-neutral-400 text-xs mt-0.5">Fill in the details below to add a new staff member to the system.</p>
        </div>

        <Link
          to="/admin/employees"
          className="self-start sm:self-auto inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl border border-stone-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-stone-700 dark:text-neutral-200 hover:bg-stone-50 dark:hover:bg-neutral-800 text-sm font-semibold shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A5C36]"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back to Employees</span>
        </Link>
      </div>

      {/* Form Card Container */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-stone-200 dark:border-neutral-800 shadow-sm p-8 transition-colors duration-200">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-neutral-300 mb-1.5">Full Name</label>
              <input 
                type="text"
                name="fullName"
                placeholder="e.g. Julia Dizon"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white dark:bg-neutral-800 border border-stone-200 dark:border-neutral-700 rounded-xl text-stone-800 dark:text-white placeholder-stone-400 dark:placeholder-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A5C36]"
              />
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-neutral-300 mb-1.5">Role Selection</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white dark:bg-neutral-800 border border-stone-200 dark:border-neutral-700 rounded-xl text-stone-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0A5C36]"
              >
                <option value="" disabled className="bg-white dark:bg-neutral-900">Select a role...</option>
                <option value="Front-Desk" className="bg-white dark:bg-neutral-900">Front-Desk</option>
                <option value="Manager" className="bg-white dark:bg-neutral-900">Manager</option>
                <option value="Trainer" className="bg-white dark:bg-neutral-900">Trainer</option>
              </select>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-neutral-300 mb-1.5">Email Address</label>
              <input 
                type="email"
                name="email"
                placeholder="miranda.kielljanrowynbscs2024@gmail.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white dark:bg-neutral-800 border border-stone-200 dark:border-neutral-700 rounded-xl text-stone-800 dark:text-white placeholder-stone-400 dark:placeholder-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A5C36]"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-neutral-300 mb-1.5">Phone Number</label>
              <input 
                type="text"
                name="phone"
                placeholder="09XX XXX XXXX"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white dark:bg-neutral-800 border border-stone-200 dark:border-neutral-700 rounded-xl text-stone-800 dark:text-white placeholder-stone-400 dark:placeholder-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A5C36]"
              />
            </div>

            {/* System PIN */}
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-neutral-300 mb-1.5">System PIN (4 digits)</label>
              <input 
                type="password"
                name="pin"
                maxLength={4}
                placeholder="••••"
                value={formData.pin}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white dark:bg-neutral-800 border border-stone-200 dark:border-neutral-700 rounded-xl text-stone-800 dark:text-white placeholder-stone-400 dark:placeholder-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A5C36]"
              />
              <p className="text-[11px] text-stone-400 dark:text-neutral-500 mt-1">Used for terminal login.</p>
            </div>

            {/* Account Status Toggle */}
            <div className="flex flex-col justify-center">
              <label className="block text-xs font-bold text-stone-700 dark:text-neutral-300 mb-2">Account Status</label>
              <div className="flex items-center justify-between p-3 bg-stone-50 dark:bg-neutral-800/60 border border-stone-200 dark:border-neutral-700 rounded-xl">
                <div>
                  <p className="text-xs text-stone-800 dark:text-white font-semibold">Account Status</p>
                  <p className="text-[11px] text-stone-400 dark:text-neutral-400">Activate employee immediately</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-stone-300 dark:bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0A5C36]"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-stone-100 dark:border-neutral-800">
            <button 
              type="button"
              onClick={() => navigate('/admin/employees')}
              className="px-6 py-2.5 border border-stone-200 dark:border-neutral-700 hover:bg-stone-50 dark:hover:bg-neutral-800 text-stone-700 dark:text-neutral-300 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-6 py-2.5 bg-[#0A5C36] hover:bg-[#074729] text-white rounded-xl text-xs font-bold shadow-md transition flex items-center space-x-2 cursor-pointer"
            >
              <span>✓ Save Staff Member</span>
            </button>
          </div>
        </form>
      </div>

      <AlertModal alert={alertState} onClose={closeAlert} />
    </div>
  );
}