import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AlertModal from '../../components/AlertModal';
import FieldError from '../../components/FieldError';
import { getEmployees, resetEmployeePassword, updateEmployee } from '../../lib/api';
import {
  stripDigits,
  isBlank,
  isValidEmail,
  isValidPassword,
  PASSWORD_RULES,
} from '../../lib/validators';

const PAGE_SIZE = 6;

// Lowercase and drop "#", "-" and spaces so "emp 042", "#EMP-042", "042" and "markvalencia" all match.
const normalize = (value) => value.toLowerCase().replace(/[#\-\s]/g, '');

const modalInputClass =
  'w-full px-4 py-2.5 bg-white dark:bg-neutral-800 border border-stone-200 dark:border-neutral-700 rounded-xl text-stone-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0A5C36]';

export default function Employees() {
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [reload, setReload] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [alertState, setAlertState] = useState(null);

  // Edit modal: editDraft holds a copy of the employee being edited (null = closed)
  const [editDraft, setEditDraft] = useState(null);

  // Reset-password modal: resetTarget is the employee (null = closed)
  const [resetTarget, setResetTarget] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [requireChange, setRequireChange] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    getEmployees({ signal: controller.signal })
      .then((rows) => {
        setLoadError('');
        setEmployees(rows.map((employee) => ({
          id: `#EMP-${String(employee.emp_id).padStart(3, '0')}`,
          rawId: employee.emp_id,
          name: employee.emp_name,
          role: employee.emp_job_title || 'Front-Desk',
          username: employee.auth_username || employee.emp_email || '',
          email: employee.emp_email || '',
          phone: employee.emp_phone_num || '',
          status: employee.emp_status === 'active' ? 'Active' : 'Inactive',
        })));
      })
      .catch((error) => {
        if (!controller.signal.aborted) setLoadError(error.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [reload]);

  // Filters instantly on every keystroke by Employee ID or Name.
  const filteredEmployees = useMemo(() => {
    const q = normalize(searchQuery);
    return employees.filter(
      (emp) => !q || normalize(emp.id).includes(q) || normalize(emp.name).includes(q)
    );
  }, [employees, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageRows = filteredEmployees.slice(start, start + PAGE_SIZE);

  // ---- Edit staff ----
  const emailError =
    editDraft && editDraft.email && !isValidEmail(editDraft.email) ? 'Enter a valid email address.' : '';
  const isEditValid = editDraft &&
    !isBlank(editDraft.name) &&
    (/^[a-zA-Z0-9._-]{3,80}$/.test(editDraft.username.trim()) || isValidEmail(editDraft.username.trim())) &&
    isValidEmail(editDraft.email);

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!isEditValid) return;
    const saved = {
      ...editDraft,
      name: editDraft.name.trim(),
      username: editDraft.username.trim(),
      email: editDraft.email.trim(),
    };
    try {
      await updateEmployee(saved.rawId, {
        name: saved.name,
        username: saved.username,
        email: saved.email,
        jobTitle: saved.role,
        isActive: saved.status === 'Active',
      });
      setEditDraft(null);
      setReload((value) => value + 1);
      setAlertState({ type: 'success', title: 'Changes Saved', message: `${saved.name}'s details were updated.` });
    } catch (error) {
      setAlertState({ type: 'error', title: 'Update Failed', message: error.message });
    }
  };

  // ---- Reset password ----
  const openReset = () => {
    setResetTarget({ ...editDraft });
    setEditDraft(null);
    setNewPassword('');
    setShowPassword(false);
    setRequireChange(true);
  };

  const closeReset = () => {
    setResetTarget(null);
    setNewPassword('');
  };

  const isPasswordValid = isValidPassword(newPassword);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!isPasswordValid) return;
    const name = resetTarget.name;
    try {
      await resetEmployeePassword(resetTarget.rawId, newPassword, requireChange);
      closeReset();
      setAlertState({
        type: 'success',
        title: 'Password Updated',
        message: requireChange
          ? `${name}'s password was reset. They must change it at next login.`
          : `${name}'s password was reset successfully.`,
      });
    } catch (error) {
      setAlertState({ type: 'error', title: 'Password Reset Failed', message: error.message });
    }
  };

  return (
    <div className="w-full space-y-4 transition-colors duration-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-stone-900 dark:text-white">Manage Employees</h2>
          <p className="text-stone-500 dark:text-neutral-400 text-sm mt-0.5">View and manage staff accounts and roles.</p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 md:flex-1 md:justify-end">
          <div className="relative w-full md:max-w-sm">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400 dark:text-neutral-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search by Employee ID or Name"
              aria-label="Search employees by ID or name"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-9 py-2 bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-xl text-stone-800 dark:text-white placeholder-stone-400 dark:placeholder-neutral-500 text-xs focus:outline-none focus:ring-2 focus:ring-[#0A5C36] shadow-sm transition-colors duration-200"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setPage(1);
                }}
                aria-label="Clear search"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 dark:text-neutral-500 hover:text-stone-600 dark:hover:text-neutral-300 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => navigate('/admin/register-employee')}
            className="bg-[#0A5C36] hover:bg-[#074729] text-white font-semibold px-4 py-2 rounded-xl text-xs shadow-md transition flex items-center justify-center space-x-2 cursor-pointer shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            <span>Add Staff</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-stone-200 dark:border-neutral-800 shadow-sm overflow-hidden transition-colors duration-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-200 dark:border-neutral-800 text-stone-400 dark:text-neutral-400 text-xs font-semibold tracking-wider bg-stone-50/50 dark:bg-neutral-800/40">
                <th className="py-3 px-6">ID</th>
                <th className="py-3 px-6">NAME</th>
                <th className="py-3 px-6">ROLE</th>
                <th className="py-3 px-6">CONTACT</th>
                <th className="py-3 px-6">STATUS</th>
                <th className="py-3 px-6 text-right">ACTIONS</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-stone-100 dark:divide-neutral-800 text-sm">
              {pageRows.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-stone-500 dark:text-neutral-400">
                    {loading ? 'Loading employees…' : loadError || 'No employees match your search.'}
                  </td>
                </tr>
              )}
              {pageRows.map((emp) => (
                <tr key={emp.id} className="hover:bg-stone-50/50 dark:hover:bg-neutral-800/50 transition">
                  <td className="py-3.5 px-6 font-medium text-stone-600 dark:text-neutral-400">{emp.id}</td>
                  <td className="py-3.5 px-6 font-semibold text-stone-900 dark:text-white">{emp.name}</td>
                  <td className="py-3.5 px-6 text-stone-600 dark:text-neutral-400">{emp.role}</td>
                  <td className="py-3.5 px-6 text-stone-600 dark:text-neutral-400">{emp.phone || emp.email}</td>
                  <td className="py-3.5 px-6">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                      emp.status === 'Active'
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                        : 'bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300'
                    }`}>
                      {emp.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-right">
                    <button
                      type="button"
                      onClick={() => setEditDraft({ ...emp })}
                      aria-label={`Edit ${emp.name}`}
                      className="text-stone-400 dark:text-neutral-500 hover:text-[#0A5C36] dark:hover:text-emerald-400 transition cursor-pointer"
                    >
                      <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination footer (same pattern as Transactions.jsx) */}
        <div className="p-4 border-t border-stone-200 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500 dark:text-neutral-400 bg-stone-50/50 dark:bg-neutral-800/40">
          <span aria-live="polite">
            Showing {filteredEmployees.length === 0 ? 0 : start + 1} to {start + pageRows.length} of {filteredEmployees.length} entries
          </span>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setPage(currentPage - 1)}
              disabled={currentPage <= 1}
              className="px-3 py-1.5 border border-stone-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-stone-700 dark:text-neutral-300 hover:bg-stone-50 dark:hover:bg-neutral-800 cursor-pointer transition disabled:text-stone-400 dark:disabled:text-neutral-600 disabled:cursor-not-allowed disabled:hover:bg-white dark:disabled:hover:bg-neutral-900"
            >
              Previous
            </button>
            <span className="px-1 font-medium">Page {currentPage} of {totalPages}</span>
            <button
              type="button"
              onClick={() => setPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="px-3 py-1.5 border border-stone-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-stone-700 dark:text-neutral-300 hover:bg-stone-50 dark:hover:bg-neutral-800 cursor-pointer transition disabled:text-stone-400 dark:disabled:text-neutral-600 disabled:cursor-not-allowed disabled:hover:bg-white dark:disabled:hover:bg-neutral-900"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* EDIT STAFF MODAL */}
      {editDraft && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <form
            onSubmit={handleSaveEdit}
            className="bg-white dark:bg-neutral-900 rounded-3xl border border-stone-200 dark:border-neutral-800 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200 transition-colors"
          >
            <div className="p-6 border-b border-stone-200 dark:border-neutral-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-stone-900 dark:text-white">Edit Staff Member</h3>
                <p className="text-xs text-stone-400 dark:text-neutral-500 mt-0.5">{editDraft.id}</p>
              </div>
              <button
                type="button"
                onClick={() => setEditDraft(null)}
                aria-label="Close"
                className="text-stone-400 dark:text-neutral-500 hover:text-stone-600 dark:hover:text-neutral-300 transition cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label htmlFor="edit-name" className="block text-xs font-semibold text-stone-700 dark:text-neutral-300 mb-1.5">Full Name</label>
                <input
                  id="edit-name"
                  type="text"
                  value={editDraft.name}
                  onChange={(e) => setEditDraft({ ...editDraft, name: stripDigits(e.target.value) })}
                  required
                  className={modalInputClass}
                />
              </div>

              <div>
                <label htmlFor="edit-username" className="block text-xs font-semibold text-stone-700 dark:text-neutral-300 mb-1.5">Login Username</label>
                <input
                  id="edit-username"
                  type="text"
                  value={editDraft.username}
                  onChange={(e) => setEditDraft({ ...editDraft, username: e.target.value })}
                  required
                  minLength={3}
                  maxLength={254}
                  pattern="(?:[a-zA-Z0-9._-]{3,80}|[^@\s]+@[^@\s]+\.[^@\s]+)"
                  title="Use 3–80 letters, numbers, periods, underscores, or hyphens, or keep the existing email login."
                  className={modalInputClass}
                />
              </div>

              <div>
                <label htmlFor="edit-email" className="block text-xs font-semibold text-stone-700 dark:text-neutral-300 mb-1.5">Email Contact</label>
                <input
                  id="edit-email"
                  type="email"
                  value={editDraft.email}
                  onChange={(e) => setEditDraft({ ...editDraft, email: e.target.value })}
                  required
                  aria-invalid={emailError ? 'true' : undefined}
                  aria-describedby={emailError ? 'edit-email-error' : undefined}
                  className={modalInputClass}
                />
                <FieldError id="edit-email-error">{emailError}</FieldError>
              </div>

              <div>
                <label htmlFor="edit-role" className="block text-xs font-semibold text-stone-700 dark:text-neutral-300 mb-1.5">Role</label>
                <select
                  id="edit-role"
                  value={editDraft.role}
                  onChange={(e) => setEditDraft({ ...editDraft, role: e.target.value })}
                  className={modalInputClass}
                >
                  <option value="Manager" className="bg-white dark:bg-neutral-900">Manager</option>
                  <option value="Trainer" className="bg-white dark:bg-neutral-900">Trainer</option>
                  <option value="Front-Desk" className="bg-white dark:bg-neutral-900">Front-Desk</option>
                </select>
              </div>

              <div>
                <span className="block text-xs font-semibold text-stone-700 dark:text-neutral-300 mb-2">Account Status</span>
                <div className="flex items-center space-x-6">
                  {['Active', 'Inactive'].map((status) => (
                    <label key={status} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        checked={editDraft.status === status}
                        onChange={() => setEditDraft({ ...editDraft, status })}
                        className="accent-[#0A5C36]"
                      />
                      <span className="text-sm font-medium text-stone-800 dark:text-neutral-200">{status}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={openReset}
                  className="text-xs font-semibold text-[#0A5C36] dark:text-emerald-400 hover:underline flex items-center space-x-1.5 cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Reset Password for Staff</span>
                </button>
              </div>
            </div>

            <div className="p-6 bg-stone-50 dark:bg-neutral-800/60 border-t border-stone-200 dark:border-neutral-800 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => setEditDraft(null)}
                className="px-5 py-2.5 border border-stone-200 dark:border-neutral-700 rounded-xl text-stone-700 dark:text-neutral-300 text-sm font-semibold hover:bg-stone-100 dark:hover:bg-neutral-800 transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={!isEditValid}
                className="px-5 py-2.5 bg-[#0A5C36] hover:bg-[#074729] text-white rounded-xl text-sm font-semibold shadow-md transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#0A5C36]"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* RESET PASSWORD MODAL */}
      {resetTarget && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <form
            onSubmit={handleResetPassword}
            className="bg-white dark:bg-neutral-900 rounded-3xl border border-stone-200 dark:border-neutral-800 shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200 transition-colors"
          >
            <div className="p-6 border-b border-stone-200 dark:border-neutral-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-stone-900 dark:text-white">Reset Password</h3>
                <p className="text-xs text-stone-500 dark:text-neutral-400 mt-0.5">Set a new password for {resetTarget.name}.</p>
              </div>
              <button
                type="button"
                onClick={closeReset}
                aria-label="Close"
                className="text-stone-400 dark:text-neutral-500 hover:text-stone-600 dark:hover:text-neutral-300 transition cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label htmlFor="reset-password" className="block text-xs font-semibold text-stone-700 dark:text-neutral-300 mb-1.5">New Password</label>
                <div className="relative">
                  <input
                    id="reset-password"
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter a new password"
                    autoComplete="new-password"
                    aria-describedby="reset-password-checklist"
                    required
                    className={`${modalInputClass} pr-10 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden`}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 dark:text-neutral-500 hover:text-stone-600 dark:hover:text-neutral-300 cursor-pointer"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      {showPassword ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      )}
                    </svg>
                  </button>
                </div>

                {/* Live password checklist (same rules as Register Employee) */}
                <ul id="reset-password-checklist" aria-label="Password requirements" className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1">
                  {PASSWORD_RULES.map((rule) => {
                    const met = rule.test(newPassword);
                    return (
                      <li
                        key={rule.id}
                        className={`flex items-center gap-2 text-[11px] font-medium transition-colors ${
                          met ? 'text-emerald-700 dark:text-emerald-400' : 'text-stone-500 dark:text-neutral-400'
                        }`}
                      >
                        <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          {met ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                          ) : (
                            <circle cx="12" cy="12" r="8" strokeWidth="2" />
                          )}
                        </svg>
                        <span>{rule.label}</span>
                        <span className="sr-only">{met ? '(met)' : '(not met)'}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="flex items-center space-x-2.5 pt-1">
                <input
                  type="checkbox"
                  id="requireChange"
                  checked={requireChange}
                  onChange={(e) => setRequireChange(e.target.checked)}
                  className="w-4 h-4 accent-[#0A5C36] rounded cursor-pointer"
                />
                <label htmlFor="requireChange" className="text-xs font-medium text-stone-700 dark:text-neutral-300 cursor-pointer select-none">
                  Require employee to change password on next login
                </label>
              </div>
            </div>

            <div className="p-6 bg-stone-50 dark:bg-neutral-800/60 border-t border-stone-200 dark:border-neutral-800 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={closeReset}
                className="px-5 py-2.5 border border-stone-200 dark:border-neutral-700 rounded-xl text-stone-700 dark:text-neutral-300 text-sm font-semibold hover:bg-stone-100 dark:hover:bg-neutral-800 transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={!isPasswordValid}
                className="px-5 py-2.5 bg-[#0A5C36] hover:bg-[#074729] text-white rounded-xl text-sm font-semibold shadow-md transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#0A5C36]"
              >
                Update Password
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Themed alert (replaces window.alert) */}
      <AlertModal alert={alertState} onClose={() => setAlertState(null)} />
    </div>
  );
}