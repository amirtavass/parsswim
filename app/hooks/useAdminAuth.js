// hooks/useAdminAuth.js
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/app/lib/api";
import { useAdmin } from "@/app/contexts/AdminContext";
import { useAuth } from "@/app/contexts/authContext";

// Admin Login Hook
export const useAdminLogin = () => {
  const { login: adminLogin } = useAdmin();
  const { logout: userLogout } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ username, password }) => {
      // First logout any existing user session
      try {
        await api.post("/auth/logout");
      } catch (error) {
        // Ignore logout errors
      }

      // Clear user auth state
      userLogout();

      // Login as admin
      const response = await api.post("/admin/login", { username, password });
      return response.data;
    },
    onSuccess: (data) => {
      if (data.success && data.admin) {
        adminLogin(data.admin);
        // Clear all queries and refetch admin status
        queryClient.clear();
        queryClient.invalidateQueries(["admin", "me"]);
      }
    },
    onError: (error) => {
      console.error("Admin login failed:", error.response?.data || error);
    },
  });
};

// Admin Logout Hook
export const useAdminLogout = () => {
  const { logout: adminLogout } = useAdmin();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await api.post("/admin/logout");
      return response.data;
    },
    onSuccess: () => {
      adminLogout();
      queryClient.clear();
    },
    onError: (error) => {
      console.error("Admin logout error:", error);
      // Still logout locally even if API fails
      adminLogout();
      queryClient.clear();
    },
  });
};

// Check Admin Authentication Status
export const useAdminCheck = () => {
  const { login, logout } = useAdmin();

  return useQuery({
    queryKey: ["admin", "me"],
    queryFn: async () => {
      const response = await api.get("/admin/me");
      return response.data;
    },
    onSuccess: (data) => {
      if (data.success && data.admin) {
        login(data.admin);
      }
    },
    onError: (error) => {
      if (error.response?.status === 401) {
        logout();
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
