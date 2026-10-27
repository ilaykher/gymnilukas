import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { logout as logoutRequest } from '../lib/api';
import { PASSWORD_RULES, isValidPassword } from '../lib/validators';

export default function ChangePassword() {
  const { user, changePassword, signOut } = useAuth();
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const valid = currentPassword.length > 0 &&
    isValidPassword(newPassword) &&
    newPassword === confirmPassword &&
    newPassword !== currentPassword;

  const submit = async (event) => {
    event.preventDefault();
    if (!valid || saving) return;
    setSaving(true);
    setError('');
    try {
      const nextUser = await changePassword(currentPassword, newPassword);
      navigate(nextUser.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
    } catch (requestError) {
      setError(requestError.message || 'Unable to change password.');
    } finally {
      setSaving(false);
    }
  };

  const cancel = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    setError('');
    try {
      await logoutRequest();
      signOut();
      navigate('/login', { replace: true });
    } catch (requestError) {
      setError(requestError.message || 'Unable to record shift end. Please try again.');
      setLoggingOut(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-stone-100 dark:bg-neutral-950 p-4">
      <form onSubmit={submit} className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl border border-stone-200 dark:border-neutral-800 shadow-xl p-8 space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-white">Change your password</h1>
          <p className="text-sm text-stone-500 dark:text-neutral-400 mt-2">
            {user?.mustChangePassword ? 'An administrator reset your password. Set a new password to continue.' : 'Update your account password.'}
          </p>
        </div>

        <label className="block text-sm font-medium text-stone-700 dark:text-neutral-300">
          Current password
          <input
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            className="mt-1 w-full px-4 py-3 border border-stone-300 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800"
            required
          />
        </label>
        <label className="block text-sm font-medium text-stone-700 dark:text-neutral-300">
          New password
          <input
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            className="mt-1 w-full px-4 py-3 border border-stone-300 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800"
            required
          />
        </label>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-stone-500 dark:text-neutral-400">
          {PASSWORD_RULES.map((rule) => (
            <li key={rule.id} className={rule.test(newPassword) ? 'text-emerald-700 dark:text-emerald-400' : ''}>
              {rule.test(newPassword) ? '✓' : '•'} {rule.label}
            </li>
          ))}
        </ul>
        <label className="block text-sm font-medium text-stone-700 dark:text-neutral-300">
          Confirm new password
          <input
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className="mt-1 w-full px-4 py-3 border border-stone-300 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800"
            required
          />
        </label>
        {newPassword && confirmPassword && newPassword !== confirmPassword && (
          <p className="text-sm text-red-600" role="alert">The passwords do not match.</p>
        )}
        {newPassword === currentPassword && newPassword && (
          <p className="text-sm text-red-600" role="alert">Choose a password different from your current password.</p>
        )}
        {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
        <div className="flex gap-3">
          {!user?.mustChangePassword && (
            <button
              type="button"
              onClick={cancel}
              disabled={loggingOut}
              className="w-1/2 py-3 border border-stone-300 dark:border-neutral-700 rounded-xl font-semibold"
            >
              {loggingOut ? 'Logging out…' : 'Cancel'}
            </button>
          )}
          <button
            type="submit"
            disabled={!valid || saving}
            className="w-full py-3 bg-[#0A5C36] text-white rounded-xl font-semibold disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save password'}
          </button>
        </div>
      </form>
    </main>
  );
}
