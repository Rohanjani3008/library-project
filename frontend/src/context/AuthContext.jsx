import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/client';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load current user profile from backend
  const fetchCurrentUser = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await api.get('/api/auth/me/');
      setUser(response.data);
    } catch (err) {
      console.error('Failed to fetch current user profile:', err);
      // If fetching me fails even after refresh attempt in axios interceptor
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();

    // Listen for automatic logout dispatched by axios interceptor
    const handleAutoLogout = () => {
      setUser(null);
    };

    window.addEventListener('auth:logout', handleAutoLogout);
    return () => {
      window.removeEventListener('auth:logout', handleAutoLogout);
    };
  }, []);

  // Login handler
  const login = async (username, password) => {
    try {
      const response = await api.post('/api/auth/login/', { username, password });
      const { access, refresh, user: userData } = response.data;

      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);
      setUser(userData);

      return { success: true, user: userData };
    } catch (err) {
      if (!err.response) {
        return {
          success: false,
          error: 'Cannot connect to backend server. Make sure the Django server is running at http://127.0.0.1:8000.',
        };
      }
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        'Login failed. Please verify your credentials.';
      return { success: false, error: errorMsg };
    }
  };

  // Student registration handler
  const register = async (studentData) => {
    try {
      const response = await api.post('/api/auth/register/', studentData);
      const { access, refresh, user: userData } = response.data;

      if (access && refresh) {
        localStorage.setItem('accessToken', access);
        localStorage.setItem('refreshToken', refresh);
        setUser(userData);
      }

      return { success: true, user: userData };
    } catch (err) {
      if (!err.response) {
        return {
          success: false,
          error: 'Cannot connect to backend server. Make sure the Django server is running at http://127.0.0.1:8000.',
        };
      }
      let errorMsg = 'Registration failed. Please check the entered details.';
      if (err.response?.data) {
        const errorData = err.response.data;
        if (typeof errorData === 'object') {
          // Flatten field error messages
          const firstKey = Object.keys(errorData)[0];
          const firstVal = errorData[firstKey];
          if (Array.isArray(firstVal)) {
            errorMsg = `${firstKey}: ${firstVal[0]}`;
          } else if (typeof firstVal === 'string') {
            errorMsg = `${firstKey}: ${firstVal}`;
          }
        }
      }
      return { success: false, error: errorMsg };
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        fetchCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to consume AuthContext cleanly
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
