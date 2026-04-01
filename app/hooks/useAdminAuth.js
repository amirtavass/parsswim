// hooks/useAdminAuth.js
import { api } from "@/app/lib/api";
import { useAdminAuth as useAdminContext } from "@/app/contexts/AdminContext";
import { useAuth as useUserContext } from "@/app/contexts/authContext";
import { CreateAuthHooks } from "./CreateAuthHooks";

const { useGenericLogin, useGenericLogout } = CreateAuthHooks(
  "admin",
  "admin",
  useAdminContext,
);

export const useAdminLogout = () => useGenericLogout();

export const useAdminLogin = () => {
  const { logout: userLogout } = useUserContext();

  const adminLoginWithUserLogoutFn = async ({ username, password }) => {
    try {
      await api.post("/auth/logout");
    } catch (error) {}

    userLogout();

    const response = await api.post("/admin/login", { username, password });
    return response.data;
  };

  return useGenericLogin(adminLoginWithUserLogoutFn);
};
