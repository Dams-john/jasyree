import React, { createContext, useContext, useState } from 'react';
import { CURRENT_USER, User } from '../data/users';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  updateCoins: (amount: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(CURRENT_USER);

  const login = async (_email: string, _password: string): Promise<boolean> => {
    await new Promise(r => setTimeout(r, 800));
    setUser(CURRENT_USER);
    return true;
  };

  const logout = () => setUser(null);

  const signup = async (_name: string, _email: string, _password: string): Promise<boolean> => {
    await new Promise(r => setTimeout(r, 800));
    setUser({ ...CURRENT_USER, name: _name, email: _email });
    return true;
  };

  const updateCoins = (amount: number) => {
    if (user) setUser({ ...user, coins: user.coins + amount });
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, signup, updateCoins }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
