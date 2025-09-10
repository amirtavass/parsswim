"use client";
import Link from "next/link";
import { useAuth } from "@/app/contexts/authContext";
import { useAdmin } from "@/app/contexts/AdminContext";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { MdLanguage } from "react-icons/md";
import AdminMenu from "./AdminMenu";
import UserMenu from "./UserMenu";
import GuestMenu from "./GuestMenu";

function DesktopMenu({ pathname }) {
  const { language, toggleLanguage, t } = useLanguage();
  const { isAuthenticated: userAuth, isLoading: userLoading } = useAuth();
  const { isAuthenticated: adminAuth, isLoading: adminLoading } = useAdmin();

  if (userLoading || adminLoading) return null;

  const isActiveRoute = (route) => {
    if (route === "/" && pathname === "/") return true;
    if (route !== "/" && pathname.startsWith(route)) return true;
    return false;
  };

  return (
    <div className="hidden md:flex items-center space-x-8 space-x-reverse">
      {/* Language Toggle */}
      <button
        onClick={toggleLanguage}
        className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        title={language === "fa" ? "Switch to English" : "تغییر به فارسی"}
      >
        <MdLanguage className="w-5 h-5" />
        <span className="text-sm font-medium">
          {language === "fa" ? "EN" : "FA"}
        </span>
      </button>

      {/* Navigation Links (only for non-admin users) */}
      {!adminAuth && (
        <>
          <Link
            href="/"
            className={`transition-colors relative ${
              isActiveRoute("/")
                ? "text-primary font-medium"
                : "text-gray-700 hover:text-primary"
            }`}
          >
            {t("home")}
            {isActiveRoute("/") && (
              <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-primary" />
            )}
          </Link>
          <Link
            href="/articles"
            className={`transition-colors relative ${
              isActiveRoute("/articles")
                ? "text-primary font-medium"
                : "text-gray-700 hover:text-primary"
            }`}
          >
            {t("articles")}
            {isActiveRoute("/articles") && (
              <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-primary" />
            )}
          </Link>
          <Link
            href="/products"
            className={`transition-colors relative ${
              isActiveRoute("/products")
                ? "text-primary font-medium"
                : "text-gray-700 hover:text-primary"
            }`}
          >
            {t("products")}
            {isActiveRoute("/products") && (
              <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-primary" />
            )}
          </Link>
        </>
      )}

      {/* Auth Menu */}
      {adminAuth ? (
        <AdminMenu pathname={pathname} />
      ) : userAuth ? (
        <UserMenu pathname={pathname} />
      ) : (
        <GuestMenu pathname={pathname} />
      )}
    </div>
  );
}

export default DesktopMenu;
