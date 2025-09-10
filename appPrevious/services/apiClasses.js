import { api } from "@/app/lib/api";
export const classesApi = {
  // GET all classes
  getAll: async (params = {}) => {
    const response = await api.get("/classes", { params });
    return response.data.data;
  },

  // GET single class
  getById: async (id) => {
    const response = await api.get(`/classes/${id}`);
    return response.data.data;
  },

  // POST create class (admin only)
  create: async (classData) => {
    const response = await api.post("/classes", classData);
    return response.data.data;
  },

  // PUT update class (admin only)
  update: async (id, classData) => {
    const response = await api.put(`/classes/${id}`, classData);
    return response.data.data;
  },

  // DELETE class (admin only)
  delete: async (id) => {
    const response = await api.delete(`/classes/${id}`);
    return response.data;
  },

  // GET available classes (not full)
  getAvailable: async () => {
    const response = await api.get("/classes/available");
    return response.data.data;
  },
};
