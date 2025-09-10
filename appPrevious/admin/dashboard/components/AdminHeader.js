"use client";
import { useAdmin } from "@/app/contexts/AdminContext";

function AdminHeader() {
  const { admin, logout } = useAdmin();

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">پنل مدیریت</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">سلام {admin?.username}</span>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
            >
              خروج
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminHeader;
