import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function Employees() {
  const location = useLocation();
  const [currentView, setCurrentView] = useState('list');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState({
    name: 'Sara Jimenez',
    email: 'sara.j@gymnilucas.com',
    role: 'Manager',
    status: 'Active'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [tempPassword, setTempPassword] = useState('TempPass123!');
  const [requireChange, setRequireChange] = useState(true);

  const [newStaff, setNewStaff] = useState({
    fullName: '',
    role: '',
    email: '',
    phone: '',
    pin: '',
    isActive: true
  });

  useEffect(() => {
    if (location.state && location.state.openAddStaff) {
      setCurrentView('add');
    }
  }, [location.state]);

  const handleOpenEdit = (staff) => {
    setSelectedStaff(staff);
    setIsEditModalOpen(true);
  };

  if (currentView === 'add') {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <button 
            onClick={() => setCurrentView('list')}
            className="text-xs font-semibold text-stone-500 hover:text-stone-800 flex items-center space-x-1 mb-4 cursor-pointer transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to Employees</span>
          </button>
          <h2 className="text-2xl font-bold text-stone-900">Register New Employee</h2>
          <p className="text-stone-500 text-sm mt-1">Fill in the details below to add a new staff member to the system.</p>
        </div>

        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">Full Name</label>
              <input 
                type="text" 
                placeholder="e.g. Julia Dizon"
                value={newStaff.fullName}
                onChange={(e) => setNewStaff({...newStaff, fullName: e.target.value})}
                className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A5C36]" 
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">Role Selection</label>
              <select 
                value={newStaff.role}
                onChange={(e) => setNewStaff({...newStaff, role: e.target.value})}
                className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A5C36]"
              >
                <option value="">Select a role...</option>
                <option value="Manager">Manager</option>
                <option value="Trainer">Trainer</option>
                <option value="Front Desk">Front Desk</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">Email Address</label>
              <input 
                type="email" 
                placeholder="miranda.kielljanrowynbscs2024@gmail.com"
                value={newStaff.email}
                onChange={(e) => setNewStaff({...newStaff, email: e.target.value})}
                className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A5C36]" 
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">Phone Number</label>
              <input 
                type="text" 
                placeholder="09XX XXX XXXX"
                value={newStaff.phone}
                onChange={(e) => setNewStaff({...newStaff, phone: e.target.value})}
                className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A5C36]" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-stone-100">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">System PIN (4 digits)</label>
              <div className="relative">
                <input 
                  type="password" 
                  maxLength="4"
                  placeholder="••••"
                  value={newStaff.pin}
                  onChange={(e) => setNewStaff({...newStaff, pin: e.target.value})}
                  className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A5C36]" 
                />
              </div>
              <p className="text-[11px] text-stone-400 mt-1">Used for terminal login.</p>
            </div>

            <div className="flex items-center justify-between bg-stone-50/80 border border-stone-200 px-5 py-4 rounded-2xl">
              <div>
                <span className="block text-xs font-semibold text-stone-800">Account Status</span>
                <span className="text-[11px] text-stone-500">Activate employee immediately</span>
              </div>
              <button 
                type="button"
                onClick={() => setNewStaff({...newStaff, isActive: !newStaff.isActive})}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition cursor-pointer ${
                  newStaff.isActive ? 'bg-[#0A5C36]' : 'bg-stone-300'
                }`}
              >
                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${
                  newStaff.isActive ? 'translate-x-6' : 'translate-x-0'
                }`} />
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-stone-200 flex items-center justify-end space-x-3">
            <button 
              onClick={() => setCurrentView('list')}
              className="px-6 py-3 border border-stone-200 rounded-xl text-stone-700 text-sm font-semibold hover:bg-stone-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button 
              onClick={() => {
                alert('Staff member registered successfully!');
                setCurrentView('list');
              }}
              className="px-6 py-3 bg-[#0A5C36] hover:bg-[#074729] text-white rounded-xl text-sm font-semibold shadow-md transition flex items-center space-x-2 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>Save Staff Member</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-stone-900">Manage Employees</h2>
          <p className="text-stone-500 text-sm mt-1">View and manage staff accounts and roles.</p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input 
              type="text" 
              placeholder="Search employees..." 
              className="pl-10 pr-4 py-2 bg-white border border-stone-200 rounded-xl text-stone-800 text-xs focus:outline-none focus:ring-2 focus:ring-[#0A5C36] w-64 shadow-sm"
            />
          </div>

          <button 
            onClick={() => setCurrentView('add')}
            className="bg-[#0A5C36] hover:bg-[#074729] text-white font-semibold px-4 py-2 rounded-xl text-xs shadow-md transition flex items-center space-x-2 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            <span>Add Staff</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-200 text-stone-400 text-xs font-semibold tracking-wider bg-stone-50/50">
                <th className="py-3.5 px-6">ID</th>
                <th className="py-3.5 px-6">NAME</th>
                <th className="py-3.5 px-6">ROLE</th>
                <th className="py-3.5 px-6">CONTACT</th>
                <th className="py-3.5 px-6">STATUS</th>
                <th className="py-3.5 px-6 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-sm">
              {[
                { id: '#EMP-001', name: 'Sara Jimenez', role: 'Manager', email: 'sara.j@gymnilucas.com', status: 'Active' },
                { id: '#EMP-042', name: 'Mark Valencia', role: 'Trainer', email: 'm.valencia@gymnilucas.com', status: 'Active' },
                { id: '#EMP-088', name: 'Elena Reyes', role: 'Front Desk', email: 'elena.r@gymnilucas.com', status: 'Inactive' },
                { id: '#EMP-102', name: 'Daniel Katigbak', role: 'Trainer', email: 'daniel.k@gymnilucas.com', status: 'Active' },
              ].map((emp, index) => (
                <tr key={index} className="hover:bg-stone-50/50 transition">
                  <td className="py-4 px-6 font-medium text-stone-600">{emp.id}</td>
                  <td className="py-4 px-6 font-semibold text-stone-900">{emp.name}</td>
                  <td className="py-4 px-6 text-stone-600">{emp.role}</td>
                  <td className="py-4 px-6 text-stone-600">{emp.email}</td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                      emp.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {emp.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button 
                      onClick={() => handleOpenEdit(emp)}
                      className="text-stone-400 hover:text-[#0A5C36] transition cursor-pointer"
                    >
                      <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500 bg-stone-50/50">
          <span>Showing 1 to 4 of 24 entries</span>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1.5 border border-stone-200 rounded-lg bg-white text-stone-400 cursor-not-allowed">Previous</button>
            <button className="px-3 py-1.5 border border-stone-200 rounded-lg bg-white text-stone-700 hover:bg-stone-50 cursor-pointer">Next</button>
          </div>
        </div>
      </div>

      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-stone-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-stone-900">Edit Staff Member</h3>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 transition cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">Full Name</label>
                <input 
                  type="text" 
                  value={selectedStaff.name} 
                  onChange={(e) => setSelectedStaff({...selectedStaff, name: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white border border-stone-200 rounded-xl text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A5C36]" 
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">Email Contact</label>
                <input 
                  type="email" 
                  value={selectedStaff.email} 
                  onChange={(e) => setSelectedStaff({...selectedStaff, email: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white border border-stone-200 rounded-xl text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A5C36]" 
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">Role</label>
                <select 
                  value={selectedStaff.role}
                  onChange={(e) => setSelectedStaff({...selectedStaff, role: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white border border-stone-200 rounded-xl text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A5C36]"
                >
                  <option value="Manager">Manager</option>
                  <option value="Trainer">Trainer</option>
                  <option value="Front Desk">Front Desk</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-2">Account Status</label>
                <div className="flex items-center space-x-6">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="status" 
                      checked={selectedStaff.status === 'Active'} 
                      onChange={() => setSelectedStaff({...selectedStaff, status: 'Active'})}
                      className="text-[#0A5C36] focus:ring-[#0A5C36]" 
                    />
                    <span className="text-sm font-medium text-stone-800">Active</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="status" 
                      checked={selectedStaff.status === 'Inactive'} 
                      onChange={() => setSelectedStaff({...selectedStaff, status: 'Inactive'})}
                      className="text-[#0A5C36] focus:ring-[#0A5C36]" 
                    />
                    <span className="text-sm font-medium text-stone-800">Inactive</span>
                  </label>
                </div>
              </div>

              <div className="pt-2">
                <button 
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setIsResetModalOpen(true);
                  }}
                  className="text-xs font-semibold text-[#0A5C36] hover:underline flex items-center space-x-1.5 cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Reset Password for Staff</span>
                </button>
              </div>
            </div>

            <div className="p-6 bg-stone-50 border-t border-stone-200 flex items-center justify-end space-x-3">
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="px-5 py-2.5 border border-stone-200 rounded-xl text-stone-700 text-sm font-semibold hover:bg-stone-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="px-5 py-2.5 bg-[#0A5C36] hover:bg-[#074729] text-white rounded-xl text-sm font-semibold shadow-md transition flex items-center space-x-2 cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {isResetModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-stone-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-stone-900">Reset Password</h3>
              <button 
                onClick={() => setIsResetModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 transition cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">New Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={tempPassword} 
                    onChange={(e) => setTempPassword(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-stone-200 rounded-xl text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A5C36] pr-10" 
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
              </div>

              <div className="flex items-center space-x-2.5 pt-1">
                <input 
                  type="checkbox" 
                  id="requireChange"
                  checked={requireChange}
                  onChange={(e) => setRequireChange(e.target.checked)}
                  className="w-4 h-4 text-[#0A5C36] focus:ring-[#0A5C36] rounded border-stone-300 cursor-pointer" 
                />
                <label htmlFor="requireChange" className="text-xs font-medium text-stone-700 cursor-pointer select-none">
                  Require employee to change password on next login
                </label>
              </div>
            </div>

            <div className="p-6 bg-stone-50 border-t border-stone-200 flex items-center justify-end space-x-3">
              <button 
                onClick={() => setIsResetModalOpen(false)}
                className="px-5 py-2.5 border border-stone-200 rounded-xl text-stone-700 text-sm font-semibold hover:bg-stone-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  alert('Password updated successfully!');
                  setIsResetModalOpen(false);
                }}
                className="px-5 py-2.5 bg-[#0A5C36] hover:bg-[#074729] text-white rounded-xl text-sm font-semibold shadow-md transition cursor-pointer"
              >
                Update Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}