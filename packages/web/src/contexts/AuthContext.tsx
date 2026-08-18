import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ORGANIZER' | 'CUSTOMER' | 'GATEKEEPER';
}

interface AuthContextData {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  register: (name: string, email: string, password: string, role?: string) => Promise<void>;
  logout: () => void;
  switchRoleDemo: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadStoredAuth() {
      const storedToken = localStorage.getItem('@passfy:token');
      const storedUser = localStorage.getItem('@passfy:user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        try {
          // Verify with backend
          const response = await api.get('/auth/me');
          setUser(response.data.user);
          localStorage.setItem('@passfy:user', JSON.stringify(response.data.user));
        } catch {
          // Invalid token, logout
          logout();
        }
      }
      setIsLoading(false);
    }

    loadStoredAuth();
  }, []);

  const login = async (email: string, password = 'password123') => {
    const response = await api.post('/auth/login', { email, password });
    const { user: loggedUser, token: authToken } = response.data;

    setUser(loggedUser);
    setToken(authToken);

    localStorage.setItem('@passfy:user', JSON.stringify(loggedUser));
    localStorage.setItem('@passfy:token', authToken);
  };

  const register = async (name: string, email: string, password: string, role = 'CUSTOMER') => {
    const response = await api.post('/auth/register', { name, email, password, role });
    const { user: registeredUser, token: authToken } = response.data;

    setUser(registeredUser);
    setToken(authToken);

    localStorage.setItem('@passfy:user', JSON.stringify(registeredUser));
    localStorage.setItem('@passfy:token', authToken);
  };

  const switchRoleDemo = async (email: string) => {
    setIsLoading(true);
    try {
      await login(email, 'password123');
    } catch (err) {
      console.error('Failed to switch demo user:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('@passfy:user');
    localStorage.removeItem('@passfy:token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        switchRoleDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
