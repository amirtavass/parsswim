"use client";
import Link from "next/link";
import { useLanguage } from "@/app/contexts/LanguageContext";

function GuestMenu({ pathname }) {
  const { t } = useLanguage();

  const isActiveRoute = (route) => pathname.startsWith(route);

  return (
    <>
      <Link
        href="/auth/login"
        className={`transition-colors relative ${
          isActiveRoute("/auth/login")
            ? "text-primary font-medium"
            : "text-gray-700 hover:text-primary"
        }`}
      >
        {t("login")}
        {isActiveRoute("/auth/login") && (
          <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-primary" />
        )}
      </Link>
      <Link
        href="/auth/register"
        className={`transition-colors px-4 py-2 rounded-lg ${
          isActiveRoute("/auth/register")
            ? "bg-primary-dark text-white"
            : "bg-primary hover:bg-primary-dark text-white"
        }`}
      >
        {t("register")}
      </Link>
      <Link
        href="/admin/login"
        className={`text-sm transition-colors ${
          isActiveRoute("/admin/login")
            ? "text-blue-800 font-medium"
            : "text-blue-600 hover:text-blue-700"
        }`}
      >
        {t("adminLogin")}
      </Link>
    </>
  );
}

export default GuestMenu;
