import React, { createContext, useState, useContext, useEffect } from 'react';
import { login as apiLogin, register as apiRegister, getCurrentUser, setToken, setUser, clearAuth, getUser as getStoredUser, getToken as getStoredToken } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = getStoredToken();
      const storedUser = getStoredUser();
      
      if (token && storedUser) {
        try {
          // Verify token is still valid
          const response = await getCurrentUser();
          if (response.success) {
            setUserState(response.user);
            setIsAuthenticated(true);
          } else {
            // Token invalid
            clearAuth();
            setUserState(null);
            setIsAuthenticated(false);
          }
        } catch (error) {
          clearAuth();
          setUserState(null);
          setIsAuthenticated(false);
        }
      }
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      const response = await apiLogin(email, password);
      if (response.success) {
        setToken(response.token);
        setUser(response.user);
        setUserState(response.user);
        setIsAuthenticated(true);
        toast.success('Welcome back! 🎉');
        return { success: true };
      }
    } catch (error) {
      toast.error(error.message || 'Login failed');
      return { success: false, error: error.message };
    }
  };

  // Register function
  const register = async (name, email, password, company) => {
    try {
      const response = await apiRegister({ name, email, password, company });
      if (response.success) {
        setToken(response.token);
        setUser(response.user);
        setUserState(response.user);
        setIsAuthenticated(true);
        toast.success('Account created successfully! 🎉');
        return { success: true };
      }
    } catch (error) {
      toast.error(error.message || 'Registration failed');
      return { success: false, error: error.message };
    }
  };

  // Logout function
  const logout = () => {
    clearAuth();
    setUserState(null);
    setIsAuthenticated(false);
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAuthenticated,
      login,
      register,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};