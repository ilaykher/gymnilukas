import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMembers } from '../../lib/api';

export default function Members() {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    const controller = new AbortController();

    getMembers({ signal: controller.signal })
      .then(setMembers)
      .catch((requestError) => {
        if (!controller.signal.aborted) {
          setError(requestError.message || 'Unable to load members.');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [retryCount]);

  const handleRetry = () => {
    setLoading(true);
    setError('');
    setRetryCount((count) => count + 1);
  };

  const statuses = [...new Set(members.map((member) => member.mem_status).filter(Boolean))];
  const filteredMembers = members.filter((member) => {
    const search = searchTerm.trim().toLowerCase();
    const matchesSearch =
      String(member.member_id).includes(search) ||
      (member.mem_fullname || '').toLowerCase().includes(search) ||
      (member.mem_contact_num || '').toLowerCase().includes(search);
    const matchesStatus = statusFilter === 'All' || member.mem_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 transition-colors duration-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-stone-900 dark:text-white">Member Directory</h2>
          <p className="text-stone-500 dark:text-neutral-400 text-sm mt-1">Search and manage all registered gym members.</p>
        </div>
        
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
            {statuses.map((status) => (
              <option key={status} value={status} className="bg-white dark:bg-neutral-800">{status}</option>
            ))}
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
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-neutral-800 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-stone-400 dark:text-neutral-500" role="status">
                    Loading members...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-red-600 dark:text-red-400">
                    <p>Could not load members: {error}</p>
                    <button
                      type="button"
                      onClick={handleRetry}
                      className="mt-2 font-semibold underline"
                    >
                      Try again
                    </button>
                  </td>
                </tr>
              ) : filteredMembers.length > 0 ? (
                filteredMembers.map((member) => (
                  <tr key={member.member_id} className="hover:bg-stone-50/50 dark:hover:bg-neutral-800/50 transition">
                    <td className="py-4 px-6 font-medium text-stone-600 dark:text-neutral-400">#{member.member_id}</td>
                    
                    <td className="py-4 px-6 flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-stone-200 dark:bg-neutral-800 text-stone-700 dark:text-neutral-300 font-bold text-xs flex items-center justify-center">
                        {(member.mem_fullname || '?').split(' ').map((name) => name[0]).join('')}
                      </div>
                      <button
                        type="button"
                        onClick={() => navigate(`/member-profile?id=${encodeURIComponent(member.member_id)}`)}
                        className="font-semibold text-[#0A5C36] dark:text-emerald-400 hover:underline text-left"
                      >
                        {member.mem_fullname}
                      </button>
                    </td>

                    <td className="py-4 px-6 text-stone-600 dark:text-neutral-400">{member.mem_contact_num || '—'}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        String(member.mem_status).toLowerCase() === 'active'
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                          : 'bg-stone-100 dark:bg-neutral-800 text-stone-700 dark:text-neutral-300'
                      }`}>
                        {member.mem_status || 'Unknown'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-stone-400 dark:text-neutral-500">
                    No members found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-stone-200 dark:border-neutral-800 flex items-center justify-between text-stone-500 dark:text-neutral-400 text-sm bg-stone-50/30 dark:bg-neutral-800/30">
          <span>
            {loading || error ? '—' : `Showing ${filteredMembers.length} of ${members.length} members`}
          </span>
        </div>
      </div>
    </div>
  );
}