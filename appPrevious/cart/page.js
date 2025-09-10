"use client";
import { useCart } from "@/app/contexts/CartContext";
import { useAuth } from "@/app/contexts/authContext";
import { useRouter } from "next/navigation";
import { useCartPayment } from "@/app/hooks/usePayment";
import { useState } from "react";
import Image from "next/image";
import { MdDelete, MdAdd, MdRemove } from "react-icons/md";

function CartPage() {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    getTotalPrice,
    clearCart,
  } = useCart();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const cartPaymentMutation = useCartPayment();
  const [paymentMethod, setPaymentMethod] = useState("zarinpal");

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      // Store current cart for after login
      localStorage.setItem("pendingCartPayment", JSON.stringify(cartItems));
      router.push("/auth/login?returnTo=/cart&action=checkout");
      return;
    }

    try {
      await cartPaymentMutation.mutateAsync(cartItems);
    } catch (error) {
      console.error("Payment failed:", error);
      alert("خطا در پردازش پرداخت");
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">سبد خرید</h1>
          <div className="bg-white rounded-xl shadow-lg p-8">
            <p className="text-gray-600 text-lg">سبد خرید شما خالی است</p>
            <a
              href="/products"
              className="inline-block mt-4 bg-primary text-white px-6 py-3 rounded-lg"
            >
              بازگشت به فروشگاه
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    // NO ProtectedRoute wrapper - available to all users
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">سبد خرید</h1>

        {/* Cart Items */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between border-b border-gray-200 py-4 last:border-b-0"
            >
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">{item.name}</h3>
                  <p className="text-gray-600">
                    {item.price.toLocaleString()} تومان
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="p-1 bg-gray-200 rounded-lg hover:bg-gray-300"
                  >
                    <MdRemove className="w-4 h-4" />
                  </button>
                  <span className="mx-2 font-bold">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="p-1 bg-gray-200 rounded-lg hover:bg-gray-300"
                  >
                    <MdAdd className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-lg font-bold text-primary">
                  {(item.price * item.quantity).toLocaleString()} تومان
                </div>

                <button
                  onClick={() => removeFromCart(item.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                >
                  <MdDelete className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Payment Section */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xl font-bold">مجموع:</span>
            <span className="text-2xl font-bold text-primary">
              {getTotalPrice().toLocaleString()} تومان
            </span>
          </div>

          {/* Payment Method Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-bold mb-4">روش پرداخت</h3>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="payment"
                  value="zarinpal"
                  checked={paymentMethod === "zarinpal"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="ml-2"
                />
                <span>پرداخت آنلاین (زرین‌پال)</span>
              </label>
              {isAuthenticated && (
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="payment"
                    value="balance"
                    checked={paymentMethod === "balance"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="ml-2"
                  />
                  <span>پرداخت از موجودی حساب</span>
                </label>
              )}
            </div>
          </div>

          {/* Auth Status Message */}
          {!isAuthenticated && (
            <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded">
              برای پرداخت نیاز به ورود به حساب کاربری دارید
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={clearCart}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-bold"
            >
              پاک کردن سبد
            </button>
            <button
              onClick={handleCheckout}
              disabled={cartPaymentMutation.isLoading}
              className="flex-1 bg-primary hover:bg-primary-dark text-white py-3 rounded-lg font-bold disabled:opacity-50"
            >
              {cartPaymentMutation.isLoading
                ? "در حال پردازش..."
                : isAuthenticated
                ? "پرداخت"
                : "ورود و پرداخت"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartPage;
