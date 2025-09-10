// hooks/useAuth.js
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/app/lib/api";
import { useAuth } from "@/app/contexts/authContext";

// User Registration Hook
export const useRegister = () => {
  const { login } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData) => {
      const response = await api.post("/auth/register", userData);
      return response.data;
    },
    onSuccess: (data) => {
      if (data.success && data.user) {
        login(data.user);
        queryClient.invalidateQueries(["auth", "me"]);
      }
    },
    onError: (error) => {
      console.error("Registration failed:", error.response?.data || error);
    },
  });
};

// User Login Hook
export const useLogin = () => {
  const { login } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials) => {
      const response = await api.post("/auth/login", credentials);
      return response.data;
    },
    onSuccess: (data) => {
      if (data.success && data.user) {
        login(data.user);
        queryClient.invalidateQueries(["auth", "me"]);
      }
    },
    onError: (error) => {
      console.error("Login failed:", error.response?.data || error);
    },
  });
};

// User Logout Hook
export const useLogout = () => {
  const { logout } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await api.post("/auth/logout");
      return response.data;
    },
    onSuccess: () => {
      logout();
      queryClient.clear(); // Clear all cached data
    },
    onError: (error) => {
      console.error("Logout error:", error);
      // Still logout locally even if API fails
      logout();
      queryClient.clear();
    },
  });
};

// Check Authentication Status
export const useAuthCheck = () => {
  const { login, logout } = useAuth();

  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const response = await api.get("/auth/me");
      return response.data;
    },
    onSuccess: (data) => {
      if (data.success && data.user) {
        login(data.user);
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
