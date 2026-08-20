import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../data/users';
import { authApi } from '../lib/resources';
import { tokenStorage, decodeRole, ApiError } from '../lib/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  signup: (name: string, email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  updateCoins: (amount: number) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!tokenStorage.accessToken) {
        setLoading(false);
        return;
      }
      try {
        const me = await authApi.me();
        setUser(me);
        setRole(decodeRole(tokenStorage.accessToken));
      } catch {
        tokenStorage.clear();
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { user: loggedInUser, tokens } = await authApi.login(email, password);
      tokenStorage.set(tokens.access_token, tokens.refresh_token);
      setUser(loggedInUser);
      setRole(decodeRole(tokens.access_token));
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e instanceof ApiError ? e.message : 'Something went wrong. Please try again.' };
    }
  };

  const logout = () => {
    const refreshToken = tokenStorage.refreshToken;
    if (refreshToken) authApi.logout(refreshToken).catch(() => {});
    tokenStorage.clear();
    setUser(null);
    setRole(null);
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      const { user: newUser, tokens } = await authApi.register(name, email, password);
      tokenStorage.set(tokens.access_token, tokens.refresh_token);
      setUser(newUser);
      setRole(decodeRole(tokens.access_token));
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e instanceof ApiError ? e.message : 'Something went wrong. Please try again.' };
    }
  };

  // Optimistic, local-only: the backend has no coin wallet/purchase endpoint yet.
  const updateCoins = (amount: number) => {
    if (user) setUser({ ...user, coins: user.coins + amount });
  };

  const refreshUser = async () => {
    if (!tokenStorage.accessToken) return;
    try {
      setUser(await authApi.me());
    } catch {
      // ignore — keep last known user
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isAdmin: role === 'author' || role === 'admin',
      loading,
      login,
      logout,
      signup,
      updateCoins,
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
