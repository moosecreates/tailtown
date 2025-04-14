import React, { createContext, useState, useContext, useEffect } from 'react';

// Define types
type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  error: string | null;
};

// Create context with default values
export const AuthContext = createContext<AuthContextType | null>(null);

// Custom hook for using the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};



// Provider component
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check if the user is already logged in on component mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // For now, we'll just check localStorage for a token
        const token = localStorage.getItem('token');
        if (token) {
          // TODO: Implement token validation with backend
          // For now, we'll use a mock user
          const mockUser: User = JSON.parse(localStorage.getItem('user') || '{}');
          setUser(mockUser);
        }
      } catch (err) {
        console.error('Auth check failed:', err);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // TODO: Implement actual API call to login
      // For now, we'll simulate a successful login with a mock user
      if (email && password) {
        // Mock successful login
        const mockUser: User = {
          id: '1',
          email,
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin',
        };

        // Store in localStorage (in a real app, you'd store the JWT token)
        localStorage.setItem('token', 'mock-jwt-token');
        localStorage.setItem('user', JSON.stringify(mockUser));
        
        setUser(mockUser);
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
