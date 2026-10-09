import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage and verify with backend
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('campusfix_token');
      const storedUser = localStorage.getItem('campusfix_user');

      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          // Verify with /auth/me in background
          const res = await authService.getMe();
          if (res.success && res.user) {
            setUser(res.user);
            localStorage.setItem('campusfix_user', JSON.stringify(res.user));
          }
        } catch (err) {
          console.error('Session validation error:', err);
          authService.logout();
          setUser(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    setLoading(true);
    try {
      const data = await authService.login(credentials);
      setUser(data.user);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const data = await authService.register(userData);
      setUser(data.user);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  const updateUserState = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('campusfix_user', JSON.stringify(updatedUser));
  };

  const refreshUser = async () => {
    try {
      const res = await authService.getMe();
      if (res.success && res.user) {
        setUser(res.user);
        localStorage.setItem('campusfix_user', JSON.stringify(res.user));
      }
    } catch (e) {
      // ignore
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isStudent: user?.role === 'student',
    isStaff: user?.role === 'staff',
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
    updateUserState,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
