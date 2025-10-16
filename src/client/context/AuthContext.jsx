import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export { AuthContext };

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    
    const performAuthCheck = async () => {
      try {
        setLoading(true);
        console.log('Checking auth status - localStorage token:', localStorage.getItem('authToken') ? 'present' : 'missing');
        console.log('Checking current user authentication...');
        
        const token = localStorage.getItem('authToken');
        if (!token) {
          console.log('No localStorage token found, will try cookies');
        }
        
        const userData = await authService.getCurrentUser();
        if (isMounted) {
          setUser(userData);
          setError(null);
          console.log('✅ User authenticated successfully');
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.log('Auth check response status:', error.status || 'unknown');
          console.log('Auth check response data:', error.message || error);
        }
        
        if (isMounted) {
          setUser(null);
          if (error.message !== 'Access denied. No token provided.' && 
              !error.message.includes('Database is not available')) {
            setError(error.message);
          }
          if (process.env.NODE_ENV === 'development') {
            console.log('User not authenticated - no valid session');
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    performAuthCheck();

    return () => {
      isMounted = false;
    };
  }, []);

  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      console.log('Manual auth check initiated');
      const userData = await authService.getCurrentUser();
      setUser(userData);
      setError(null);
      console.log('✅ Manual auth check successful');
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.log('❌ Manual auth check failed:', error.message);
      }
      setUser(null);
      if (error.message !== 'Access denied. No token provided.' && 
          !error.message.includes('Database is not available')) {
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.login(username, password);
      console.log('✅ Login successful in AuthContext, setting user:', response.user?.username);
      setUser(response.user);
      
      const storedToken = localStorage.getItem('authToken');
      console.log('✅ Post-login verification - localStorage token:', storedToken ? 'present' : 'missing');
      
      console.log('✅ Login complete - user authenticated without need for auth check');
      
      return response;
    } catch (error) {
      console.error('❌ Login failed in AuthContext:', error.message);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.signup(userData);
      setUser(response.user);
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await authService.logout();
      setUser(null);
      setError(null);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      setError(null);
      const response = await authService.updateProfile(profileData);
      setUser(response.user);
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    login,
    signup,
    logout,
    updateProfile,
    clearError,
    checkAuthStatus,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};