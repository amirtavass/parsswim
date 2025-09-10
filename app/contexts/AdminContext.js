"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { api } from "@/app/lib/api";

const AdminContext = createContext();

export function AdminProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check admin auth status on app start
  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const response = await api.get("/admin/me");
      setAdmin(response.data.admin);
      setIsAuthenticated(true);
    } catch (error) {
      // FIXED: Don't log expected 401 errors
      if (error.response?.status !== 401) {
        console.error("Unexpected admin check error:", error);
      }
      setAdmin(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (userData) => {
    setAdmin(userData);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try {
      await api.post("/admin/logout");
    } catch (error) {
      console.error("Admin logout error:", error);
    } finally {
      // Always clear local state regardless of API call result
      setAdmin(null);
      setIsAuthenticated(false);
    }
  };

  return (
    <AdminContext.Provider
      value={{
        admin,
        isAuthenticated,
        isLoading,
        login,
        logout,
        checkAdminStatus,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used within AdminProvider");
  }
  return context;
};
