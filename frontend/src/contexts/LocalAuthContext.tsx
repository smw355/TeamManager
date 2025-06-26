import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, UserRole } from '../types';
import ApiService from '../services/api';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      const token = ApiService.getToken();
      
      if (token) {
        // Verify token is still valid by getting current user
        const response = await ApiService.getCurrentUser();
        if (response.success && response.data) {
          setCurrentUser(response.data.user);
        } else {
          // Invalid token, clear it
          ApiService.logout();
          setCurrentUser(null);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      ApiService.logout();
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await ApiService.login(email, password);
      setCurrentUser(response.user);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await ApiService.register({ email, password, name });
      setCurrentUser(response.user);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    ApiService.logout();
    setCurrentUser(null);
  };

  // setUserRole is no longer needed - users don't have global roles
  // Roles are now team-specific and managed by TeamContext

  const value: AuthContextType = {
    currentUser,
    loading,
    error,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};