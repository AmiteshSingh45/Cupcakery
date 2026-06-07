"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Helper: check if auth object represents an admin user
export const isAdminUser = (auth) => {
  if (!auth?.user) return false;
  return (
    auth.user.role === 1 ||
    auth.user.adminRole === "Super Admin" ||
    auth.user.adminRole === "Admin"
  );
};

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("auth");
      if (stored) {
        const parsed = JSON.parse(stored);
        setAuth(parsed);
      }
    } catch (e) {
      console.error("Error parsing auth from localStorage", e);
    }
  }, []);

  const login = (userData) => {
    setAuth(userData);
    localStorage.setItem("auth", JSON.stringify(userData));
  };

  const logout = () => {
    setAuth(null);
    localStorage.removeItem("auth");
  };

  return (
    <AuthContext.Provider value={[auth, login, logout, setAuth]}>
      {children}
    </AuthContext.Provider>
  );
};

// Convenience hook: returns true/false for admin check
export const useIsAdmin = () => {
  const [auth] = useAuth();
  return isAdminUser(auth);
};
