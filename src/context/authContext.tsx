import React, { createContext, useContext, useState, useEffect } from 'react';

export type Role = 'admin' | 'tutor' | null;

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: AuthUser | null;
  role: Role;
  token: string | null;
  login: (userData: AuthUser, tokenData: string, roleData: Role) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const setCookie = (name: string, value: string, days = 7) => {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
};

const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return decodeURIComponent(parts.pop()?.split(';').shift() || '');
  return null;
};

const removeCookie = (name: string) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [role, setRole] = useState<Role>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = getCookie('token');
    const storedRole = getCookie('role') as Role;
    const storedUser = getCookie('user');

    if (storedToken && storedRole && storedUser) {
      let isExpired = false;
      try {
        const payload = JSON.parse(atob(storedToken.split('.')[1]));
        if (payload.exp && payload.exp * 1000 < Date.now()) {
          isExpired = true;
        }
      } catch (e) {
        isExpired = true;
      }

      if (isExpired) {
        removeCookie('token');
        removeCookie('role');
        removeCookie('user');
        setToken(null);
        setRole(null);
        setUser(null);
      } else {
        setToken(storedToken);
        setRole(storedRole);
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error('Failed to parse user data from cookie', e);
        }
      }
    }
    setIsLoading(false);
  }, []);

  const login = (userData: AuthUser, tokenData: string, roleData: Role) => {
    setUser(userData);
    setToken(tokenData);
    setRole(roleData);
    setCookie('token', tokenData);
    setCookie('role', roleData ?? '');
    setCookie('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setRole(null);
    removeCookie('token');
    removeCookie('role');
    removeCookie('user');
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ user, role, token, login, logout, isAuthenticated, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};