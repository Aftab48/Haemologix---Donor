// Authentication context provider

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getCurrentUser, signIn, signOut, isAuthenticated } from '../lib/auth';
import type { DonorData } from '../lib/types';
import { useDemoSandbox } from './DemoSandboxContext';

interface AuthContextType {
  user: DonorData | null;
  loading: boolean;
  isAuth: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const demo = useDemoSandbox();
  const [user, setUser] = useState<DonorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    initializeAuth();
  }, []);

  async function initializeAuth() {
    try {
      const authenticated = await isAuthenticated();
      if (authenticated) {
        const userData = await getCurrentUser(false);
        setUser(userData);
        setIsAuth(!!userData);
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
    } finally {
      setLoading(false);
    }
  }

  async function login(email: string, password: string) {
    try {
      setLoading(true);
      const result = await signIn(email, password);
      if (result.success && result.user) {
        setUser(result.user);
        setIsAuth(true);
        return { success: true };
      }
      return { success: false, error: result.error };
    } catch (error: any) {
      return { success: false, error: error.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    try {
      if (demo.active) {
        await demo.exitDemo();
        return;
      }
      await signOut();
      setUser(null);
      setIsAuth(false);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  }

  async function refreshUser() {
    try {
      if (demo.active) {
        await demo.refresh(true);
        return;
      }
      const userData = await getCurrentUser(true);
      setUser(userData);
      setIsAuth(!!userData);
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user: demo.active ? demo.donor : user,
        loading: loading || demo.initializing || demo.loading,
        isAuth: demo.active || isAuth,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

