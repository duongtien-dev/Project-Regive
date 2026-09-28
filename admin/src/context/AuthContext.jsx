import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authApi, setToken as persistToken } from '../api/client';
import { STAFF_ROLES } from '../lib/constants';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(() => localStorage.getItem('regive_admin_token'));
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function boot() {
      if (!token) {
        setUser(null);
        setBooting(false);
        return;
      }
      try {
        const res = await authApi.me();
        if (!cancelled) setUser(res.data.user);
      } catch {
        persistToken(null);
        if (!cancelled) {
          setTokenState(null);
          setUser(null);
        }
      } finally {
        if (!cancelled) setBooting(false);
      }
    }
    boot();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const value = useMemo(
    () => ({
      user,
      token,
      booting,
      isStaff: Boolean(user && STAFF_ROLES.includes(user.role)),
      isAdmin: user?.role === 'ADMIN',
      async login(email, password) {
        const res = await authApi.login(email, password);
        const nextUser = res.data.user;
        if (!STAFF_ROLES.includes(nextUser.role)) {
          const err = new Error('Tài khoản này không có quyền vào trang quản trị.');
          err.status = 403;
          throw err;
        }
        persistToken(res.data.token);
        setTokenState(res.data.token);
        setUser(nextUser);
        return nextUser;
      },
      logout() {
        persistToken(null);
        setTokenState(null);
        setUser(null);
      },
      setUser,
    }),
    [user, token, booting]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
