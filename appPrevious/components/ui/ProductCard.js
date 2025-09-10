"use client";
import Image from "next/image";
import { MdShoppingCart } from "react-icons/md";
import { useCart } from "@/app/contexts/CartContext";
import { useState } from "react";
import { useLanguage } from "@/app/contexts/LanguageContext";

function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [imageError, setImageError] = useState(false);
  const { t } = useLanguage();

  const handleAddToCart = () => {
    addToCart({
      id: product._id || product.id,
      name: product.name,
      price:
        typeof product.price === "string"
          ? parseInt(product.price.replace(/[^\d]/g, ""))
          : product.price,
      image: product.image,
    });
  };

  const displayPrice =
    typeof product.price === "string"
      ? product.price
      : product.price.toLocaleString();

  const getImageSrc = () => {
    if (!product.image || imageError) {
      return "/images/default-product.jpg";
    }

    let imageSrc = product.image;
    imageSrc = imageSrc.replace(/\/+/g, "/");

    if (imageSrc.startsWith("/uploads/")) {
      return `http://localhost:4000${imageSrc}`;
    }

    return imageSrc;
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden">
      <div className="relative w-full aspect-square bg-gray-100">
        <Image
          src={getImageSrc()}
          alt={product.name}
          fill
          className="object-cover transition-transform hover:scale-105"
          quality={80}
          onError={() => setImageError(true)}
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          priority={false}
        />

        <div className="absolute top-2 right-2">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              product.inStock
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {product.inStock ? t("inStock") : t("outOfStock")}
          </span>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        <h3 className="font-bold text-lg mb-2 text-center line-clamp-2 min-h-[3.5rem] flex items-center justify-center">
          {product.name}
        </h3>

        <div className="text-center mb-4">
          <span className="text-xl sm:text-2xl font-bold text-primary">
            {displayPrice}
          </span>
          {typeof product.price === "number" && (
            <span className="text-gray-500 mx-2 text-sm">{t("toman")}</span>
          )}
        </div>

        <button
          disabled={!product.inStock}
          onClick={handleAddToCart}
          className={`w-full py-2 sm:py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
            product.inStock
              ? "bg-success hover:bg-green-700 text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          <MdShoppingCart className="w-4 h-4" />
          <span className="text-sm sm:text-base">
            {product.inStock ? t("addToCart") : t("outOfStock")}
          </span>
        </button>
      </div>
    </div>
  );
}

export default ProductCard;
