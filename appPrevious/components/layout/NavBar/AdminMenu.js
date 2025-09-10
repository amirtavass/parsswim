"use client";
import Link from "next/link";
import { useAdmin } from "@/app/contexts/AdminContext";
import { useLanguage } from "@/app/contexts/LanguageContext";

function AdminMenu({ pathname }) {
  const { admin, logout } = useAdmin();
  const { language, t } = useLanguage();

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  const isActiveRoute = (route) => pathname.startsWith(route);

  return (
    <div className="flex items-center gap-4 bg-blue-50 px-4 py-2 rounded-lg">
      <span className="text-blue-700 font-medium">
        {language === "fa" ? "مدیر" : "Admin"}: {admin?.username}
      </span>
      <Link
        href="/admin/dashboard"
        className={`transition-colors ${
          isActiveRoute("/admin")
            ? "text-blue-900 font-medium"
            : "text-blue-700 hover:text-blue-900"
        }`}
      >
        {t("adminPanel")}
      </Link>
      <button
        onClick={handleLogout}
        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
      >
        {t("adminLogout")}
      </button>
    </div>
  );
}

export default AdminMenu;
