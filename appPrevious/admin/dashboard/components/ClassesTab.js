"use client";
import { useState } from "react";
import { useClasses } from "@/app/hooks/useClasses";
import ClassForm from "./ClassForm";
import ClassesTable from "./ClassesTable";

function ClassesTab() {
  const { data: classes, isLoading } = useClasses();
  const [showForm, setShowForm] = useState(false);
  const [editingClass, setEditingClass] = useState(null);

  const handleEdit = (cls) => {
    setEditingClass(cls);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingClass(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">مدیریت کلاس‌ها</h2>
        <button
          onClick={() => {
            setEditingClass(null);
            setShowForm(true);
          }}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
        >
          ایجاد کلاس جدید
        </button>
      </div>

      {showForm && (
        <ClassForm editingClass={editingClass} onClose={handleFormClose} />
      )}

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
          <p>در حال بارگذاری کلاس‌ها...</p>
        </div>
      ) : (
        <ClassesTable classes={classes} onEdit={handleEdit} />
      )}
    </div>
  );
}

export default ClassesTab;
