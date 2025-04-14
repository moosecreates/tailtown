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
        const token = localStorage.getItem('token');
        const tokenTimestamp = localStorage.getItem('tokenTimestamp');
        const mockUser = localStorage.getItem('user');

        if (token && tokenTimestamp && mockUser) {
          // Check if token is expired (24 hour expiration)
          const tokenAge = Date.now() - parseInt(tokenTimestamp);
          const tokenExpiration = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

          if (tokenAge < tokenExpiration) {
            setUser(JSON.parse(mockUser));
          } else {
            // Token expired, clear everything
            localStorage.removeItem('token');
            localStorage.removeItem('tokenTimestamp');
            localStorage.removeItem('user');
          }
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        // On error, clear everything to be safe
        localStorage.removeItem('token');
        localStorage.removeItem('tokenTimestamp');
        localStorage.removeItem('user');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();

    // Set up an interval to check token expiration every minute
    const interval = setInterval(checkAuthStatus, 60000);
    return () => clearInterval(interval);
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

        // Store in localStorage with timestamp
        localStorage.setItem('token', 'mock-jwt-token');
        localStorage.setItem('tokenTimestamp', Date.now().toString());
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
    localStorage.removeItem('tokenTimestamp');
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
