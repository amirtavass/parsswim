// hooks/useAuth.js
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/app/lib/api";
import { useAuth as useUserAuth } from "@/app/contexts/authContext";
import { CreateAuthHooks } from "./CreateAuthHooks";

const { useGenericLogin, useGenericLogout } = CreateAuthHooks(
  "auth",
  "user",
  useUserAuth,
);

export const useLogin = () => useGenericLogin();
export const useLogout = () => useGenericLogout();

// User Registration Hook
export const useRegister = () => {
  const { login } = useUserAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData) => {
      const response = await api.post("/auth/register", userData);
      return response.data;
    },
    onSuccess: (data) => {
      if (data.success && data.user) {
        login(data.user);
        queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      }
    },
    onError: (error) => {
      console.error("Registration failed:", error.response?.data || error);
    },
  });
};
