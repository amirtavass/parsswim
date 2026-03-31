"use client";
import Link from "next/link";
import { useAuth } from "@/app/contexts/authContext";
import { useAdminAuth } from "@/app/contexts/AdminContext";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { MdLanguage } from "react-icons/md";

function MobileMenu({ pathname, onClose }) {
  const { isAuthenticated: userAuth, user, logout: userLogout } = useAuth();
  const {
    isAuthenticated: adminAuth,
    admin,
    logout: adminLogout,
  } = useAdminAuth();
  const { language, toggleLanguage, t } = useLanguage();

  const handleUserLogout = async () => {
    try {
      await userLogout();
      onClose();
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
      onClose();
      window.location.href = "/";
    }
  };

  const handleAdminLogout = async () => {
    try {
      await adminLogout();
      onClose();
      window.location.href = "/";
    } catch (error) {
      console.error("Admin logout error:", error);
      onClose();
      window.location.href = "/";
    }
  };

  const handleLanguageToggle = () => {
    try {
      toggleLanguage();
      onClose();
    } catch (error) {
      console.error("Language toggle error:", error);
    }
  };

  const isActiveRoute = (route) => {
    try {
      return pathname.startsWith(route);
    } catch (error) {
      return false;
    }
  };

  return (
    <div className="md:hidden bg-white border-t border-gray-200">
      <div className="px-2 pt-2 pb-3 space-y-1">
        {/* Language Toggle Button - Always visible */}
        <button
          onClick={handleLanguageToggle}
          className="flex items-center gap-3 px-3 py-2 w-full text-left bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <MdLanguage className="w-5 h-5 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">
            {language === "fa" ? "English" : "فارسی"}
          </span>
        </button>

        {/* Mobile menu links (only show for non-admin users) */}
        {!adminAuth && (
          <>
            <Link
              href="/"
              className={`block px-3 py-2 transition-colors ${
                pathname === "/"
                  ? "text-primary font-medium bg-blue-50"
                  : "text-gray-700 hover:text-primary hover:bg-gray-50"
              }`}
              onClick={onClose}
            >
              {t("home")}
            </Link>
            <Link
              href="/articles"
              className={`block px-3 py-2 transition-colors ${
                isActiveRoute("/articles")
                  ? "text-primary font-medium bg-blue-50"
                  : "text-gray-700 hover:text-primary hover:bg-gray-50"
              }`}
              onClick={onClose}
            >
              {t("articles")}
            </Link>
            <Link
              href="/products"
              className={`block px-3 py-2 transition-colors ${
                isActiveRoute("/products")
                  ? "text-primary font-medium bg-blue-50"
                  : "text-gray-700 hover:text-primary hover:bg-gray-50"
              }`}
              onClick={onClose}
            >
              {t("products")}
            </Link>
          </>
        )}

        {/* Mobile Admin/User Menu */}
        {adminAuth ? (
          /* Admin Mobile Menu */
          <>
            <div className="px-3 py-2 text-blue-700 font-medium bg-blue-50 mx-3 rounded">
              {language === "fa" ? "مدیر" : "Admin"}: {admin?.username}
            </div>
            <Link
              href="/admin/dashboard"
              className={`block px-3 py-2 mx-3 transition-colors ${
                isActiveRoute("/admin")
                  ? "text-blue-900 font-medium bg-blue-100"
                  : "text-blue-700 hover:text-blue-900"
              }`}
              onClick={onClose}
            >
              {t("adminPanel")}
            </Link>
            <button
              onClick={handleAdminLogout}
              className="block w-full text-left px-3 py-2 bg-blue-600 text-white rounded-lg mx-3 mt-2"
            >
              {t("adminLogout")}
            </button>
          </>
        ) : userAuth ? (
          /* Regular User Mobile Menu */
          <>
            <Link
              href="/dashboard"
              className={`block px-3 py-2 transition-colors ${
                isActiveRoute("/dashboard")
                  ? "text-primary font-medium bg-blue-50"
                  : "text-gray-700 hover:text-primary hover:bg-gray-50"
              }`}
              onClick={onClose}
            >
              {t("dashboard")}
            </Link>
            <div className="px-3 py-2 text-gray-600">
              {t("hello")} {user?.name}
            </div>
            <button
              onClick={handleUserLogout}
              className="block w-full text-left px-3 py-2 bg-red-500 text-white rounded-lg mx-3 mt-2"
            >
              {t("logout")}
            </button>
          </>
        ) : (
          /* Guest Mobile Menu */
          <>
            <Link
              href="/auth/login"
              className={`block px-3 py-2 transition-colors ${
                isActiveRoute("/auth/login")
                  ? "text-primary font-medium bg-blue-50"
                  : "text-gray-700 hover:text-primary hover:bg-gray-50"
              }`}
              onClick={onClose}
            >
              {t("login")}
            </Link>
            <Link
              href="/auth/register"
              className={`block px-3 py-2 mx-3 rounded-lg transition-colors ${
                isActiveRoute("/auth/register")
                  ? "bg-primary-dark text-white"
                  : "bg-primary text-white hover:bg-primary-dark"
              }`}
              onClick={onClose}
            >
              {t("register")}
            </Link>
            <Link
              href="/admin/login"
              className={`block px-3 py-2 transition-colors ${
                isActiveRoute("/admin/login")
                  ? "text-blue-800 font-medium bg-blue-50"
                  : "text-blue-600 hover:text-blue-700 hover:bg-gray-50"
              }`}
              onClick={onClose}
            >
              {t("adminLogin")}
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default MobileMenu;
