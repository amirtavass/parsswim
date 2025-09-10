"use client";
import Link from "next/link";
import { useAuth } from "@/app/contexts/authContext";
import { useLanguage } from "@/app/contexts/LanguageContext";

function UserMenu({ pathname }) {
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  const isActiveRoute = (route) => pathname.startsWith(route);

  return (
    <>
      <Link
        href="/dashboard"
        className={`transition-colors relative ${
          isActiveRoute("/dashboard")
            ? "text-primary font-medium"
            : "text-gray-700 hover:text-primary"
        }`}
      >
        {t("dashboard")}
        {isActiveRoute("/dashboard") && (
          <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-primary" />
        )}
      </Link>
      <span className="text-gray-600">
        {t("hello")} {user?.name}
      </span>
      <button
        onClick={handleLogout}
        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
      >
        {t("logout")}
      </button>
    </>
  );
}

export default UserMenu;
