function TabNavigation({ activeTab, onTabChange }) {
  return (
    <div className="mb-8">
      <div className="flex gap-4">
        <button
          onClick={() => onTabChange("classes")}
          className={`px-6 py-3 rounded-lg font-medium ${
            activeTab === "classes"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700 hover:bg-gray-50"
          }`}
        >
          مدیریت کلاس‌ها
        </button>
        <button
          onClick={() => onTabChange("products")}
          className={`px-6 py-3 rounded-lg font-medium ${
            activeTab === "products"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700 hover:bg-gray-50"
          }`}
        >
          مدیریت محصولات
        </button>
      </div>
    </div>
  );
}

export default TabNavigation;
