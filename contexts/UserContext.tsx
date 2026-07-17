// User context provider for managing user data

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { userApi } from '../lib/api';
import { updateAvailability } from '../lib/auth';
import type { DonorData } from '../lib/types';
import { useDemoSandbox } from './DemoSandboxContext';

interface UserContextType {
  user: DonorData | null;
  updateUser: (data: Partial<DonorData>) => Promise<boolean>;
  updateUserAvailability: (isAvailable: boolean) => Promise<boolean>;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const demo = useDemoSandbox();
  const { user: authUser, refreshUser: refreshAuth } = useAuth();
  const [user, setUser] = useState<DonorData | null>(authUser);

  useEffect(() => {
    setUser(authUser);
  }, [authUser]);

  async function updateUser(data: Partial<DonorData>) {
    if (demo.active) return false;
    if (!user?.id) return false;

    try {
      const response = await userApi.updateProfile(user.id, data);
      if (response.success && response.data) {
        setUser(response.data);
        await refreshAuth();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating user:', error);
      return false;
    }
  }

  async function updateUserAvailability(isAvailable: boolean) {
    try {
      if (demo.active) {
        await demo.act({ type: 'DONOR_SET_AVAILABILITY', payload: { available: isAvailable } });
        return true;
      }
      const success = await updateAvailability(isAvailable);
      if (success) {
        setUser((prev) => (prev ? { ...prev, isAvailable } : null));
      }
      return success;
    } catch (error) {
      console.error('Error updating availability:', error);
      return false;
    }
  }

  async function refreshUser() {
    await refreshAuth();
  }

  return (
    <UserContext.Provider
      value={{
        user,
        updateUser,
        updateUserAvailability,
        refreshUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

