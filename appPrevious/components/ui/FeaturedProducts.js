"use client";
import { useState } from "react";
import Button from "./Button";
import Link from "next/link";
import ProductCard from "./ProductCard";
import { useProducts, useProductsByCategory } from "@/app/hooks/useProducts";
import { useLanguage } from "@/app/contexts/LanguageContext";

function FeaturedProducts() {
  const [activeCategory, setActiveCategory] = useState("swimwear");
  const { t } = useLanguage();

  const { data: currentProducts, isLoading } =
    useProductsByCategory(activeCategory);
  const { data: allProducts } = useProducts();

  const displayProducts =
    currentProducts ||
    allProducts?.filter((product) => product.category === activeCategory) ||
    [];

  return (
    <section className="bg-gray-50 py-10">
      <div className="px-4 mx-auto max-w-6xl">
        <div className="text-center mb-5">
          <h2 className="text-gray-800 font-bold text-3xl mb-4">
            {t("shopTitle")}
          </h2>
          <p className="text-lg text-gray-600">{t("shopSubtitle")}</p>
        </div>

        <div className="flex gap-3 mb-8 justify-center">
          <div className="bg-gray-100 w-full max-w-md md:w-auto rounded-lg p-1 flex flex-col md:flex-row gap-1">
            <Button
              active={activeCategory === "swimwear"}
              onClick={() => setActiveCategory("swimwear")}
            >
              {t("swimwear")}
            </Button>
            <Button
              active={activeCategory === "swimgoggles"}
              onClick={() => setActiveCategory("swimgoggles")}
            >
              {t("goggles")}
            </Button>
            <Button
              active={activeCategory === "swimfins"}
              onClick={() => setActiveCategory("swimfins")}
            >
              {t("fins")}
            </Button>
            <Button
              active={activeCategory === "swimequipment"}
              onClick={() => setActiveCategory("swimequipment")}
            >
              {t("equipment")}
            </Button>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="font-bold text-gray-700 text-xl text-center mb-4">
            {t("specialProducts")}
          </h3>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">{t("loading")}...</p>
            </div>
          ) : displayProducts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              {displayProducts.slice(0, 8).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">{t("noDataFound")}</p>
            </div>
          )}
        </div>

        <div className="text-center">
          <Link
            href="/products"
            className="inline-block bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
          >
            {t("viewAllProducts")}
          </Link>
        </div>
      </div>
    </section>
  );
}

export default FeaturedProducts;
