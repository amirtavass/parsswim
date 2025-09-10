"use client";
import { useProducts } from "@/app/hooks/useProducts";
import ProductCard from "../components/ui/ProductCard";
import { useLanguage } from "@/app/contexts/LanguageContext";

function ProductsPage() {
  const { data: products, isLoading, error } = useProducts();
  const { t } = useLanguage();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-lg text-gray-600"> {t("loading")}..</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              {t("error")}..
            </h1>
            <p className="text-lg text-gray-600 mb-6">{t("noDataFound")}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg"
            >
              {t("tryAgain")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
            {t("shopTitle")}
          </h1>
          <p className="text-base sm:text-lg text-gray-600">
            {t("allProducts")}
          </p>
        </div>

        {products && products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-gray-400 text-6xl mb-4">📦</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {t("noProductFound")}
            </h3>
            <p className="text-gray-600 mb-6">{t("noAvailibleProduct")}</p>
            <p className="text-gray-500">{t("callSupport")}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductsPage;
