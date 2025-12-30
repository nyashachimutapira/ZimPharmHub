import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const id = localStorage.getItem('userId') || sessionStorage.getItem('userId');
    const userType = localStorage.getItem('userType') || sessionStorage.getItem('userType');
    return id ? { id, userType } : null;
  });

  const [token, setToken] = useState(() => localStorage.getItem('token') || sessionStorage.getItem('token') || null);
  const isAuthenticated = !!token;

  useEffect(() => {
    // Optionally we could verify token validity here by calling /api/auth/verify
  }, []);

  const login = (data, remember = true) => {
    const storage = remember ? localStorage : sessionStorage;

    storage.setItem('token', data.token);
    storage.setItem('userId', data.user.id);
    storage.setItem('userType', data.user.userType);

    // Remove from the other storage to avoid conflicts
    if (remember) {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('userId');
      sessionStorage.removeItem('userType');
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('userType');
    }

    setToken(data.token);
    setUser({ id: data.user.id, userType: data.user.userType });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userType');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('userType');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
