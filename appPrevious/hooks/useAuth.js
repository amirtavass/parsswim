import { useMutation } from "@tanstack/react-query";
import { api } from "@/app/lib/api";
import { useAuth } from "@/app/contexts/authContext";

export const useLogin = () => {
  const { login } = useAuth();

  return useMutation({
    mutationFn: async ({ name, password }) => {
      const response = await api.post("/auth/login", { name, password });
      return response.data;
    },
    onSuccess: (data) => {
      // Update auth context with user data
      login(data.user);
    },
  });
};

export const useRegister = () => {
  const { login } = useAuth();

  return useMutation({
    mutationFn: async (userData) => {
      const response = await api.post("/auth/register", {
        ...userData,
        balance: 0,
        swimmingType: "normal",
        skillLevel: "beginner",
      });
      return response.data;
    },
    onSuccess: (data) => {
      // Update auth context with user data
      login(data.user);
    },
  });
};
