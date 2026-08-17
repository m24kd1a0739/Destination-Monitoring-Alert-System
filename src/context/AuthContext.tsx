import React, { createContext, useContext, useEffect, useState } from 'react';
import { storage } from '../services/storage';
import { UserProfile } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isOnboardingCompleted: boolean;
  login: (name: string, phone: string) => void;
  updateProfile: (name: string, phone: string) => void;
  completeOnboarding: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => storage.getUserProfile());

  useEffect(() => {
    const saved = storage.getUserProfile();
    if (saved) {
      setUser(saved);
    }
  }, []);

  const login = (name: string, phone: string) => {
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    const newUser: UserProfile = {
      name: trimmedName,
      phone: trimmedPhone,
      onboardingCompleted: user ? user.onboardingCompleted : false,
      createdAt: new Date().toISOString()
    };
    storage.saveUserProfile(newUser);
    setUser(newUser);
  };

  const updateProfile = (name: string, phone: string) => {
    if (!user) return;
    const updated: UserProfile = {
      ...user,
      name: name.trim(),
      phone: phone.trim()
    };
    storage.saveUserProfile(updated);
    setUser(updated);
  };

  const completeOnboarding = () => {
    if (!user) return;
    const updated: UserProfile = {
      ...user,
      onboardingCompleted: true
    };
    storage.saveUserProfile(updated);
    setUser(updated);
  };

  const logout = () => {
    storage.clearUserProfile();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isOnboardingCompleted: !!user?.onboardingCompleted,
        login,
        updateProfile,
        completeOnboarding,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
