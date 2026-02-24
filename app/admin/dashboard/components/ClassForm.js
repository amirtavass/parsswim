"use client";
import { useState } from "react";
import { useCreateClass, useUpdateClass } from "@/app/hooks/useClasses";

function ClassForm({ editingClass, onClose }) {
  const [formData, setFormData] = useState({
    title: editingClass?.title || "",
    classType: editingClass?.classType || "کلاس خصوصی ۱۲ جلسه",
    description: editingClass?.description || "",
    duration: editingClass?.duration || 60,
    date: editingClass
      ? new Date(editingClass.date).toISOString().split("T")[0]
      : "",
    time: editingClass?.time || "",
    maxStudents: editingClass?.maxStudents || 10,
    price: editingClass?.price || 0,
    instructor: editingClass?.instructor || "مربی اول",
    location: editingClass?.location || "استخر اصلی",
  });

  const [errors, setErrors] = useState({});

  const createClass = useCreateClass();
  const updateClass = useUpdateClass();

  // Helper function to safely handle number inputs
  const handleNumberChange = (field, value) => {
    const numValue = value === "" ? "" : parseInt(value);

    // Clear any existing error for this field
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }

    // Validate the input
    if (value !== "" && (isNaN(numValue) || numValue < 0)) {
      setErrors((prev) => ({
        ...prev,
        [field]:
          field === "price"
            ? "قیمت باید عدد مثبت باشد"
            : "مقدار باید عدد مثبت باشد",
      }));
      return;
    }

    setFormData((prev) => ({ ...prev, [field]: numValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required number fields
    const newErrors = {};
    if (formData.price === "" || formData.price < 0) {
      newErrors.price = "قیمت الزامی است و باید عدد مثبت باشد";
    }
    if (formData.duration === "" || formData.duration <= 0) {
      newErrors.duration = "مدت زمان الزامی است و باید بیشتر از صفر باشد";
    }
    if (formData.maxStudents === "" || formData.maxStudents <= 0) {
      newErrors.maxStudents =
        "حداکثر دانشجو الزامی است و باید بیشتر از صفر باشد";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const classData = { ...formData, date: new Date(formData.date) };

      if (editingClass) {
        await updateClass.mutateAsync({ id: editingClass._id, ...classData });
      } else {
        await createClass.mutateAsync(classData);
      }

      onClose();
    } catch (error) {
      alert("خطا در عملیات: " + error.message);
    }
  };

  return (
    <div className="mb-6 p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-bold mb-4">
        {editingClass ? "ویرایش کلاس" : "کلاس جدید"}
      </h3>

      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="عنوان"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg"
          required
        />

        <select
          value={formData.classType}
          onChange={(e) =>
            setFormData({ ...formData, classType: e.target.value })
          }
          className="w-full px-3 py-2 border rounded-lg"
        >
          <option value="کلاس خصوصی ۱۲ جلسه">کلاس خصوصی ۱۲ جلسه</option>
          <option value="کلاس پدر و فرزند">کلاس پدر و فرزند</option>
          <option value="کلاس آمادگی مسابقات">کلاس آمادگی مسابقات</option>
          <option value="سانس آزاد استخر">سانس آزاد استخر</option>
          <option value="جلسه آزمایشی رایگان">جلسه آزمایشی رایگان</option>
        </select>

        <div className="relative">
          <input
            type="number"
            placeholder="مدت زمان (دقیقه)"
            value={formData.duration}
            onChange={(e) => handleNumberChange("duration", e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg ${
              errors.duration ? "border-red-500 bg-red-50" : ""
            }`}
            required
          />
          {errors.duration && (
            <p className="text-red-500 text-sm mt-1">{errors.duration}</p>
          )}
        </div>

        <input
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg"
          required
        />

        <input
          type="time"
          value={formData.time}
          onChange={(e) => setFormData({ ...formData, time: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg"
          required
        />

        <div className="relative">
          <input
            type="number"
            placeholder="حداکثر دانشجو"
            value={formData.maxStudents}
            onChange={(e) => handleNumberChange("maxStudents", e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg ${
              errors.maxStudents ? "border-red-500 bg-red-50" : ""
            }`}
            required
          />
          {errors.maxStudents && (
            <p className="text-red-500 text-sm mt-1">{errors.maxStudents}</p>
          )}
        </div>

        <div className="relative">
          <input
            type="number"
            placeholder="قیمت (تومان)"
            value={formData.price}
            onChange={(e) => handleNumberChange("price", e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg ${
              errors.price ? "border-red-500 bg-red-50" : ""
            }`}
            required
          />
          {errors.price && (
            <p className="text-red-500 text-sm mt-1">{errors.price}</p>
          )}
        </div>

        <select
          value={formData.instructor}
          onChange={(e) =>
            setFormData({ ...formData, instructor: e.target.value })
          }
          className="w-full px-3 py-2 border rounded-lg"
        >
          <option value="مربی اول">مربی اول</option>
          <option value="مربی دوم">مربی دوم</option>
          <option value="هر دو مربی">هر دو مربی</option>
        </select>

        <textarea
          placeholder="توضیحات"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          className="col-span-2 w-full px-3 py-2 border rounded-lg"
          rows="3"
        />

        <div className="col-span-2 flex gap-4">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          >
            {editingClass ? "به‌روزرسانی" : "ایجاد"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg"
          >
            انصراف
          </button>
        </div>
      </form>
    </div>
  );
}

export default ClassForm;
