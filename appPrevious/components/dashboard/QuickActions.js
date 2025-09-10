"use client";
import Link from "next/link";
import { useLanguage } from "@/app/contexts/LanguageContext";

export function QuickActions() {
  const { t } = useLanguage();

  return (
    <div className="grid md:grid-cols-2 gap-6 mb-8">
      <div className="bg-blue-50 p-6 rounded-lg text-center">
        <h3 className="text-xl font-bold text-gray-800 mb-4">کلاس‌های شنا</h3>
        <p className="text-gray-600 mb-4">مشاهده و ثبت‌نام در کلاس‌های مختلف</p>
        <Link
          href="/"
          className="inline-block bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark"
        >
          مشاهده تمام کلاس‌ها
        </Link>
      </div>

      <div className="bg-purple-50 p-6 rounded-lg text-center">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          {t("products")}
        </h3>
        <p className="text-gray-600 mb-4">خرید تجهیزات شنا</p>
        <Link
          href="/products"
          className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg"
        >
          {t("viewAllProducts")}
        </Link>
      </div>
    </div>
  );
}
