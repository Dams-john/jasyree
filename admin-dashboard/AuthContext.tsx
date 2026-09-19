import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../data/users';
import { authApi } from '../lib/authApi';
import { setAccessToken, ApiError } from '../lib/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User | null>;
  logout: () => void;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  updateCoins: (amount: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On first load: if we have a refresh token, try to restore the session.
  useEffect(() => {
    const refreshToken = localStorage.getItem('jnovel_refresh_token');
    if (!refreshToken) {
      setIsLoading(false);
      return;
    }

    (async () => {
      try {
        // /auth/me triggers the api client's built-in refresh-on-401 flow,
        // which reads the stored refresh token and mints a fresh access token.
        const me = await authApi.me();
        setUser(me);
      } catch {
        setAccessToken(null);
        localStorage.removeItem('jnovel_refresh_token');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = async (email: string, password: string): Promise<User | null> => {
    try {
      const loggedInUser = await authApi.login(email, password);
      setUser(loggedInUser);
      return loggedInUser;
    } catch (err) {
      console.error('Login failed:', err instanceof ApiError ? err.message : err);
      return null;
    }
  };

  const logout = () => {
    authApi.logout().catch(() => {});
    setUser(null);
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const newUser = await authApi.register(name, email, password);
      setUser(newUser);
      return true;
    } catch (err) {
      console.error('Signup failed:', err instanceof ApiError ? err.message : err);
      return false;
    }
  };

  // Optimistic local update; the real balance is authoritative server-side
  // and will resync next time /auth/me or any coin-affecting endpoint runs.
  const updateCoins = (amount: number) => {
    if (user) setUser({ ...user, coins: user.coins + amount });
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout, signup, updateCoins }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
