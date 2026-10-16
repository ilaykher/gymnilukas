import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // ✨ [INUPDATE]: Idinagdag ang useNavigate para sa modal navigation

export default function Members() {
  const navigate = useNavigate(); // ✨ [IDINAGDAG]: Hook para sa paglipat ng route papunta sa register modal

  const [members, setMembers] = useState([
    { id: '#IP-8902', name: 'Jose Santos', contact: '09XX XXX 0001', status: 'Active', expiry: 'Oct 15, 2024' },
    { id: '#IP-8905', name: 'Maria Ramos', contact: '09XX XXX 0002', status: 'Expiring Soon', expiry: 'Nov 02, 2023' },
    { id: '#IP-8850', name: 'Diego Torres', contact: '09XX XXX 0003', status: 'Expired', expiry: 'Sep 10, 2023' },
    { id: '#IP-8912', name: 'Andrea Lim', contact: '09XX XXX 0004', status: 'Active', expiry: 'Jan 20, 2025' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredMembers = members.filter((member) => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          member.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || member.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 transition-colors duration-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-stone-900 dark:text-white">Member Directory</h2>
          <p className="text-stone-500 dark:text-neutral-400 text-sm mt-1">Search and manage all registered gym members.</p>
        </div>
        
        {/* ✨ [INUPDATE]: Inilagay ang onClick para pumunta sa /register-member route at lumabas ang modal */}
        <button 
          onClick={() => navigate('/register-member')}
          className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm shadow-md transition flex items-center space-x-2 cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>Register New Member</span>
        </button>
      </div>

      <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-stone-200 dark:border-neutral-800 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between transition-colors duration-200">
        <div className="relative w-full md:w-3/4">
          <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-stone-400 dark:text-neutral-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search by ID or Name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-neutral-800 border border-stone-300 dark:border-neutral-700 rounded-xl text-sm text-stone-800 dark:text-white placeholder-stone-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#0A5C36]"
          />
        </div>

        <div className="w-full md:w-1/4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full py-2.5 px-4 bg-white dark:bg-neutral-800 border border-stone-300 dark:border-neutral-700 rounded-xl text-sm text-stone-700 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#0A5C36]"
          >
            <option value="All" className="bg-white dark:bg-neutral-800">Status: All</option>
            <option value="Active" className="bg-white dark:bg-neutral-800">Active</option>
            <option value="Expiring Soon" className="bg-white dark:bg-neutral-800">Expiring Soon</option>
            <option value="Expired" className="bg-white dark:bg-neutral-800">Expired</option>
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-stone-200 dark:border-neutral-800 shadow-sm overflow-hidden transition-colors duration-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-200 dark:border-neutral-800 text-stone-400 dark:text-neutral-400 text-xs font-semibold tracking-wider bg-stone-50/50 dark:bg-neutral-800/40">
                <th className="py-3 px-6">ID</th>
                <th className="py-3 px-6">NAME</th>
                <th className="py-3 px-6">CONTACT</th>
                <th className="py-3 px-6">STATUS</th>
                <th className="py-3 px-6">EXPIRATION DATE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-neutral-800 text-sm">
              {filteredMembers.length > 0 ? (
                filteredMembers.map((member, index) => (
                  <tr key={index} className="hover:bg-stone-50/50 dark:hover:bg-neutral-800/50 transition">
                    <td className="py-4 px-6 font-medium text-stone-600 dark:text-neutral-400">{member.id}</td>
                    
                    <td className="py-4 px-6 flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-stone-200 dark:bg-neutral-800 text-stone-700 dark:text-neutral-300 font-bold text-xs flex items-center justify-center">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <Link 
                        to="/member-profile" 
                        className="font-semibold text-stone-900 dark:text-white hover:text-[#0A5C36] dark:hover:text-emerald-400 hover:underline transition"
                      >
                        {member.name}
                      </Link>
                    </td>

                    <td className="py-4 px-6 text-stone-600 dark:text-neutral-400">{member.contact}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                        member.status === 'Active' 
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300' 
                          : member.status === 'Expiring Soon'
                          ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                          : 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          member.status === 'Active' 
                            ? 'bg-emerald-600 dark:bg-emerald-400' 
                            : member.status === 'Expiring Soon'
                            ? 'bg-amber-600 dark:bg-amber-400'
                            : 'bg-red-600 dark:bg-red-400'
                        }`}></span>
                        <span>{member.status}</span>
                      </span>
                    </td>
                    <td className="py-4 px-6 text-stone-600 dark:text-neutral-400">{member.expiry}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-stone-400 dark:text-neutral-500">
                    Walang nakitang miyembro na tumutugma sa iyong paghahanap.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-stone-200 dark:border-neutral-800 flex items-center justify-between text-stone-500 dark:text-neutral-400 text-sm bg-stone-50/30 dark:bg-neutral-800/30">
          <span>Showing 1 to {filteredMembers.length} of 128 members</span>
          <div className="flex items-center space-x-2">
            <button className="w-8 h-8 rounded-lg border border-stone-300 dark:border-neutral-700 flex items-center justify-center hover:bg-white dark:hover:bg-neutral-800 transition text-stone-600 dark:text-neutral-300 disabled:opacity-50 cursor-pointer">
              &lt;
            </button>
            <button className="w-8 h-8 rounded-lg border border-stone-300 dark:border-neutral-700 flex items-center justify-center hover:bg-white dark:hover:bg-neutral-800 transition text-stone-600 dark:text-neutral-300 cursor-pointer">
              &gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}