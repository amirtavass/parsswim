"use client";
import { useState, Suspense } from "react";
import AdminProtectedRoute from "@/app/admin/AdminProtectedRoute";
import AdminHeader from "./components/AdminHeader";
import TabNavigation from "./components/TabNavigation";
import ClassesTab from "./components/ClassesTab";
import ProductsTab from "./components/ProductsTab";

function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState("classes");

  return (
    <AdminProtectedRoute>
      <div className="min-h-screen bg-gray-100">
        <AdminHeader />

        <div className="max-w-6xl mx-auto px-4 py-8">
          <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

          <Suspense fallback={<TabSkeleton />}>
            {activeTab === "classes" ? <ClassesTab /> : <ProductsTab />}
          </Suspense>
        </div>
      </div>
    </AdminProtectedRoute>
  );
}

// Loading skeleton for tabs
function TabSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="animate-pulse">
        <div className="flex justify-between items-center mb-6">
          <div className="h-6 bg-gray-200 rounded w-48" />
          <div className="h-10 bg-gray-200 rounded w-32" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboardPage;
