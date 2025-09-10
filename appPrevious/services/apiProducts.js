import { api } from "@/app/lib/api";

export const productsApi = {
  // GET all products
  getAll: async (params = {}) => {
    const response = await api.get("/products", { params });
    return response.data.data;
  },

  // GET single product
  getById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data.data;
  },

  // POST create product (admin only)
  create: async (productData) => {
    const response = await api.post("/products", productData);
    return response.data.data;
  },

  // PUT update product (admin only)
  update: async (id, productData) => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data.data;
  },

  // DELETE product (admin only)
  delete: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  // GET products by category
  getByCategory: async (category) => {
    const response = await api.get("/products", {
      params: { category },
    });
    return response.data.data;
  },
};
