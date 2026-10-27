import { useEffect, useMemo, useState } from 'react';
import { AuthContext } from './auth-context';
import { changePassword as changePasswordRequest, getCurrentUser, login as requestLogin, readSession, writeSession } from '../lib/api';

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readSession);
  const [loading, setLoading] = useState(Boolean(readSession()?.token));
  const token = session?.token;

  useEffect(() => {
    if (!token) return undefined;

    let active = true;
    getCurrentUser()
      .then((user) => {
        if (!active) return;
        const currentSession = readSession();
        if (currentSession?.token !== token) return;
        const next = { ...currentSession, user };
        writeSession(next);
        setSession(next);
      })
      .catch(() => {
        if (!active) return;
        writeSession(null);
        setSession(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [token]);

  useEffect(() => {
    const handleUnauthorized = () => {
      writeSession(null);
      setSession(null);
      setLoading(false);
    };
    window.addEventListener('fitnexx:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('fitnexx:unauthorized', handleUnauthorized);
  }, []);

  const value = useMemo(() => ({
    user: session?.user || null,
    loading,
    async signIn(credentials) {
      const result = await requestLogin(credentials);
      const next = { token: result.token, user: result.user };
      writeSession(next);
      setSession(next);
      return result.user;
    },
    signOut() {
      writeSession(null);
      setSession(null);
    },
    async changePassword(currentPassword, newPassword) {
      const result = await changePasswordRequest(currentPassword, newPassword);
      const next = { token: result.data.token, user: result.data.user };
      writeSession(next);
      setSession(next);
      return next.user;
    },
  }), [session, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
