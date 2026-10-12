import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => authService.getCurrentUser());
  const [workerProfile, setWorkerProfile] = useState(null);
  const [token, setToken] = useState(() => authService.getToken());
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      if (authService.getToken()) {
        const res = await authService.getProfile();
        setUser(res.user);
        if (res.workerProfile) {
          setWorkerProfile(res.workerProfile);
        }
      } else {
        setUser(null);
        setWorkerProfile(null);
      }
    } catch (err) {
      console.error('Error refreshing user profile:', err);
      authService.logout();
      setUser(null);
      setWorkerProfile(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email, password) => {
    const res = await authService.login(email, password);
    setUser(res.user);
    setWorkerProfile(res.workerProfile || null);
    setToken(res.token);
    return res;
  };

  const register = async (userData) => {
    const res = await authService.register(userData);
    setUser(res.user);
    setWorkerProfile(res.workerProfile || null);
    setToken(res.token);
    return res;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setWorkerProfile(null);
    setToken(null);
  };

  const updateProfile = async (profileData) => {
    const res = await authService.updateProfile(profileData);
    setUser(res.user);
    if (res.workerProfile) {
      setWorkerProfile(res.workerProfile);
    }
    return res;
  };

  const becomeWorker = async (workerData) => {
    const res = await authService.becomeWorker(workerData);
    setUser(res.user);
    setWorkerProfile(res.workerProfile || null);
    setToken(res.token);
    return res;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        workerProfile,
        token,
        loading,
        login,
        register,
        logout,
        refreshUser,
        updateProfile,
        becomeWorker,
        isAuthenticated: !!user,
        isCustomer: user?.role === 'customer',
        isWorker: user?.role === 'worker',
        isAdmin: user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
