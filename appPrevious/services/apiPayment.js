import { api } from "@/app/lib/api";

export const paymentApi = {
  // Initiate payment for cart items
  initiateCartPayment: async (cartItems) => {
    const response = await api.post("/payment/cart", {
      items: cartItems,
      totalAmount: cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      ),
    });
    return response.data;
  },

  // Initiate payment for class registration
  initiateClassPayment: async (classId) => {
    const response = await api.post("/payment/class", { classId });
    return response.data;
  },

  // Add balance to user account
  addBalance: async (amount) => {
    const response = await api.post("/payment/balance", { amount });
    return response.data;
  },

  // Verify payment callback
  verifyPayment: async (authority, type) => {
    const response = await api.post("/payment/verify", { authority, type });
    return response.data;
  },
};
