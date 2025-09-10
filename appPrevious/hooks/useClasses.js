import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { classesApi } from "@/app/services/apiClasses";

// GET hooks (read operations)
export const useClasses = (filters = {}) => {
  return useQuery({
    queryKey: ["classes", filters],
    queryFn: () => classesApi.getAll(filters),
  });
};

export const useClass = (id) => {
  return useQuery({
    queryKey: ["classes", id],
    queryFn: () => classesApi.getById(id),
  });
};

export const useAvailableClasses = () => {
  return useQuery({
    queryKey: ["classes", "available"],
    queryFn: () => classesApi.getAvailable(),
  });
};

// MUTATION hooks
export const useCreateClass = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: classesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
    },
  });
};

export const useUpdateClass = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }) => classesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
    },
  });
};

export const useDeleteClass = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: classesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
    },
  });
};
