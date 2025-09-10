"use client";
import { useAdmin } from "@/app/contexts/AdminContext";
import { useAuth } from "@/app/contexts/authContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminLayout({ children }) {
  const { isAuthenticated: adminAuth, isLoading: adminLoading } = useAdmin();
  const { isAuthenticated: userAuth, logout: userLogout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!adminLoading) {
      // If regular user is logged in and tries to access admin, log them out first
      if (userAuth && !adminAuth) {
        userLogout();
        // Don't redirect - let them access admin login
      }
    }
  }, [adminAuth, adminLoading, userAuth, userLogout]);

  if (adminLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">در حال بررسی دسترسی...</p>
        </div>
      </div>
    );
  }

  // Always render children - let AdminProtectedRoute handle the authentication
  return <>{children}</>;
}
