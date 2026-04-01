import { useQueryClient, useMutation } from "@tanstack/react-query";
import { api } from "@/app/lib/api";

export function CreateAuthHooks(
  endpointPrefix,
  responseKey,
  useSpecificContext,
) {
  const useGenericLogin = (customMutationFn) => {
    const { login } = useSpecificContext();
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn:
        customMutationFn ||
        (async (credentials) => {
          const response = await api.post(
            `/${endpointPrefix}/login`,
            credentials,
          );
          return response.data;
        }),
      onSuccess: (data) => {
        if (data.success && data[responseKey]) {
          login(data[responseKey]);
          queryClient.invalidateQueries({ queryKey: [endpointPrefix, "me"] });
        }
      },
      onError: (error) => {
        console.error(
          `${endpointPrefix} Login failed:`,
          error.response?.data || error,
        );
      },
    });
  };

  const useGenericLogout = () => {
    const { logout } = useSpecificContext();
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: async () => {
        const response = await api.post(`/${endpointPrefix}/logout`);
        return response.data;
      },
      onSuccess: () => {
        logout();
        queryClient.clear();
      },
      onError: (error) => {
        console.error(`${endpointPrefix} Logout error:`, error);

        logout();
        queryClient.clear();
      },
    });
  };
  return { useGenericLogin, useGenericLogout };
}
