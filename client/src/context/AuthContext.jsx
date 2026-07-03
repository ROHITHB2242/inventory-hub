// src/context/AuthContext.jsx
// Purpose: Maintain global user auth state and session triggers.

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Cleans local state to log out user on request or session expiry.
   */
  const clearAuthState = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('access_token');
    setLoading(false);
  }, []);

  /**
   * Pings the server /me endpoint to check if user has active credentials.
   */
  const checkAuth = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem('access_token');
    
    // Check if token exists before calling me.
    // If a refresh cookie exists, Axios interceptor will automatically fetch a new access token anyway.
    if (!token) {
      clearAuthState();
      return;
    }
    
    try {
      const userData = await authService.getMe();
      setUser(userData);
      setIsAuthenticated(true);
    } catch (err) {
      console.log("[-] Session restore check failed, clearing local credentials.");
      clearAuthState();
    } finally {
      setLoading(false);
    }
  }, [clearAuthState]);

  // Check auth on initial mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Hook into Axios session expiry events to trigger automatic logout
  useEffect(() => {
    const handleAuthExpired = () => {
      clearAuthState();
    };

    window.addEventListener('auth-expired', handleAuthExpired);
    return () => {
      window.removeEventListener('auth-expired', handleAuthExpired);
    };
  }, [clearAuthState]);

  /**
   * Standard Email/Password login dispatcher.
   */
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.login(email, password);
      localStorage.setItem('access_token', data.access_token);
      setUser(data.user);
      setIsAuthenticated(true);
      return data.user;
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to log in. Please check your credentials.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Standard Email/Password user registration.
   */
  const signup = async (name, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const registeredUser = await authService.signup(name, email, password);
      // Automatically log user in upon successful signup
      await login(email, password);
      return registeredUser;
    } catch (err) {
      const msg = err.response?.data?.detail || 'Registration failed. Try a different email.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  /**
   * User log out dispatcher.
   */
  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
    } catch (err) {
      console.error("[-] Backend logout error: ", err);
    } finally {
      clearAuthState();
    }
  };

  /**
   * Direct credential injector for Google OAuth redirects.
   */
  const loginWithGoogleToken = (accessToken, userData) => {
    localStorage.setItem('access_token', accessToken);
    setUser(userData);
    setIsAuthenticated(true);
    setLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        error,
        login,
        signup,
        logout,
        checkAuth,
        loginWithGoogleToken,
        setError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be called within an AuthProvider.');
  }
  return context;
};
