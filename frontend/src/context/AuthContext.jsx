import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { authApi, setUnauthorizedHandler } from '../api/client';
import { decodeJwtPayload } from '../utils/format';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('poscore_token'));
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('poscore_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(Boolean(localStorage.getItem('poscore_token')));

  const logout = useCallback(() => {
    localStorage.removeItem('poscore_token');
    localStorage.removeItem('poscore_user');
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      logout();
    });
  }, [logout]);

  useEffect(() => {
    let active = true;
    async function verifySession() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await authApi.me();
        if (active) {
          setUser(res.data.data);
          localStorage.setItem('poscore_user', JSON.stringify(res.data.data));
        }
      } catch {
        if (active) logout();
      } finally {
        if (active) setLoading(false);
      }
    }
    verifySession();
    return () => {
      active = false;
    };
  }, [token, logout]);

  const persistSession = (newToken, newUser) => {
    localStorage.setItem('poscore_token', newToken);
    localStorage.setItem('poscore_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const login = async (credentials) => {
    const res = await authApi.login(credentials);
    persistSession(res.data.data.token, res.data.data.user);
    return res.data;
  };

  const register = async (payload) => {
    const res = await authApi.register(payload);
    persistSession(res.data.data.token, res.data.data.user);
    return res.data;
  };

  const tokenPayload = decodeJwtPayload(token);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        tokenPayload,
        isAuthenticated: Boolean(token && user),
        loading,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe utilizarse dentro de AuthProvider');
  }
  return ctx;
}
