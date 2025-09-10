import { useMutation } from "@tanstack/react-query";
import { paymentApi } from "@/app/services/apiPayment";
import { useAuth } from "@/app/contexts/authContext";

export const useCartPayment = () => {
  const { isAuthenticated } = useAuth();

  return useMutation({
    mutationFn: (cartItems) => {
      if (!isAuthenticated) {
        throw new Error("Authentication required for payment");
      }
      return paymentApi.initiateCartPayment(cartItems);
    },
    onSuccess: (data) => {
      if (data.paymentUrl) {
        // Redirect to ZarinPal
        window.location.href = data.paymentUrl;
      }
    },
  });
};

export const useClassPayment = () => {
  const { isAuthenticated } = useAuth();

  return useMutation({
    mutationFn: (classId) => {
      if (!isAuthenticated) {
        throw new Error("Authentication required for payment");
      }
      return paymentApi.initiateClassPayment(classId);
    },
    onSuccess: (data) => {
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      }
    },
  });
};

export const useBalancePayment = () => {
  return useMutation({
    mutationFn: (amount) => paymentApi.addBalance(amount),
    onSuccess: (data) => {
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      }
    },
  });
};
