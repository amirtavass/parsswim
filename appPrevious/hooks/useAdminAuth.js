import { useMutation } from "@tanstack/react-query";
import { api } from "@/app/lib/api";
import { useAdmin } from "@/app/contexts/AdminContext";
import { useAuth } from "@/app/contexts/authContext";

export const useAdminLogin = () => {
  const { login: adminLogin } = useAdmin();
  const { logout: userLogout, isAuthenticated: userAuth } = useAuth();

  return useMutation({
    mutationFn: async ({ username, password }) => {
      // If user is logged in, log them out first
      if (userAuth) {
        await userLogout();
      }

      const response = await api.post("/admin/login", { username, password });
      return response.data;
    },
    onSuccess: (data) => {
      adminLogin(data.admin);
    },
    onError: (error) => {
      console.error("Admin login failed:", error);
    },
  });
};
