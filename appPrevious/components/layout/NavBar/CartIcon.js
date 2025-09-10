"use client";
import Link from "next/link";
import { useAdmin } from "@/app/contexts/AdminContext";
import { useCart } from "@/app/contexts/CartContext";
import { MdShoppingCart } from "react-icons/md";

function CartIcon({ pathname }) {
  const { isAuthenticated: adminAuth } = useAdmin();
  const { getTotalItems } = useCart();

  if (adminAuth) return null;

  const isActive = pathname.startsWith("/cart");

  return (
    <Link
      href="/cart"
      className={`relative p-2 transition-colors ${
        isActive ? "text-primary" : "text-gray-600 hover:text-primary"
      }`}
    >
      <MdShoppingCart className="w-6 h-6" />
      {getTotalItems() > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {getTotalItems()}
        </span>
      )}
    </Link>
  );
}

export default CartIcon;
