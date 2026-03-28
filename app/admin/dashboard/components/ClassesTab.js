// app/admin/dashboard/components/ClassesTab.js
"use client";
import { useState } from "react";
import { useClasses, useDeleteClass } from "@/app/hooks/useClasses";
import { formatPrice } from "@/app/lib/formatCurrency";
import ClassForm from "./ClassForm";

function ClassesTab() {
  const { data: classes, isLoading, error } = useClasses();
  const [showForm, setShowForm] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const deleteClass = useDeleteClass();

  const handleEdit = (cls) => {
    setEditingClass(cls);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("آیا مطمئن هستید؟")) {
      try {
        await deleteClass.mutateAsync(id);
      } catch (error) {
        alert("خطا در حذف کلاس");
      }
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingClass(null);
  };

  const handleAddNew = () => {
    setEditingClass(null);
    setShowForm(true);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>در حال بارگذاری کلاس‌ها...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center text-red-600">
          <p>خطا در بارگذاری کلاس‌ها</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            تلاش مجدد
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">مدیریت کلاس‌ها</h2>
        <button
          onClick={handleAddNew}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
        >
          ایجاد کلاس جدید
        </button>
      </div>

      {/* Class Form */}
      {showForm && (
        <ClassForm editingClass={editingClass} onClose={handleCloseForm} />
      )}

      {/* Classes Table */}
      {classes && classes.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-right">عنوان</th>
                <th className="px-4 py-2 text-right">نوع</th>
                <th className="px-4 py-2 text-right">تاریخ</th>
                <th className="px-4 py-2 text-right">زمان</th>
                <th className="px-4 py-2 text-right">قیمت</th>
                <th className="px-4 py-2 text-right">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {classes.map((cls) => (
                <tr key={cls._id} className="border-b">
                  <td className="px-4 py-2">{cls.title}</td>
                  <td className="px-4 py-2">{cls.classType}</td>
                  <td className="px-4 py-2">
                    {new Date(cls.date).toLocaleDateString("fa-IR")}
                  </td>
                  <td className="px-4 py-2">{cls.time}</td>
                  <td className="px-4 py-2">{formatPrice(cls.price)}</td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => handleEdit(cls)}
                      className="text-blue-600 hover:underline ml-2"
                    >
                      ویرایش
                    </button>
                    <button
                      onClick={() => handleDelete(cls._id)}
                      className="text-red-600 hover:underline"
                    >
                      حذف
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>هیچ کلاسی یافت نشد</p>
          <button
            onClick={handleAddNew}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            اولین کلاس را اضافه کنید
          </button>
        </div>
      )}
    </div>
  );
}

export default ClassesTab;
