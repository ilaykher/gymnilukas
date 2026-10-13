import React from 'react';

export default function Employees() {
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

          <button className="bg-[#0A5C36] hover:bg-[#074729] text-white font-semibold px-4 py-2 rounded-xl text-xs shadow-md transition flex items-center space-x-2 cursor-pointer">
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
                    <button className="text-stone-400 hover:text-[#0A5C36] transition cursor-pointer">
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
    </div>
  );
}