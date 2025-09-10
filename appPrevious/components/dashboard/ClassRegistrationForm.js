"use client";
import { useState } from "react";
import { useLanguage } from "@/app/contexts/LanguageContext";

export function ClassRegistrationForm({ selectedClass, onSubmit, onCancel }) {
  const { t } = useLanguage();
  const [registrationForm, setRegistrationForm] = useState({
    emergencyContact: "",
    emergencyPhone: "",
    medicalConditions: "",
    swimmingExperience: "beginner",
    goals: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit(registrationForm);
  };

  return (
    <div className="mb-8 p-6 bg-blue-50 border border-blue-400 rounded-lg">
      <h3 className="text-xl font-bold text-blue-800 mb-4">
        ثبت‌نام در کلاس: {selectedClass.title}
      </h3>

      <div className="bg-white p-4 rounded-lg mb-6">
        <h4 className="font-bold text-lg">{selectedClass.title}</h4>
        <p className="text-gray-600">{selectedClass.classType}</p>
        <p className="text-green-600 font-bold">کلاس رایگان</p>
        <p className="text-gray-600">
          تاریخ: {new Date(selectedClass.date).toLocaleDateString("fa-IR")}
        </p>
        <p className="text-gray-600">زمان: {selectedClass.time}</p>
      </div>

      <div className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <input
            type="text"
            required
            placeholder="نام و نام خانوادگی تماس اضطراری"
            value={registrationForm.emergencyContact}
            onChange={(e) =>
              setRegistrationForm({
                ...registrationForm,
                emergencyContact: e.target.value,
              })
            }
            className="w-full px-3 py-2 border rounded-lg text-gray-900"
          />
          <input
            type="tel"
            required
            placeholder="شماره تماس اضطراری"
            value={registrationForm.emergencyPhone}
            onChange={(e) =>
              setRegistrationForm({
                ...registrationForm,
                emergencyPhone: e.target.value,
              })
            }
            className="w-full px-3 py-2 border rounded-lg text-gray-900"
          />
        </div>

        <select
          value={registrationForm.swimmingExperience}
          onChange={(e) =>
            setRegistrationForm({
              ...registrationForm,
              swimmingExperience: e.target.value,
            })
          }
          className="w-full px-3 py-2 border rounded-lg text-gray-900"
        >
          <option value="beginner">مبتدی</option>
          <option value="intermediate">متوسط</option>
          <option value="advanced">پیشرفته</option>
        </select>

        <textarea
          value={registrationForm.medicalConditions}
          onChange={(e) =>
            setRegistrationForm({
              ...registrationForm,
              medicalConditions: e.target.value,
            })
          }
          className="w-full px-3 py-2 border rounded-lg text-gray-900"
          rows="2"
          placeholder="مشکلات پزشکی (در صورت وجود)"
        />

        <textarea
          value={registrationForm.goals}
          onChange={(e) =>
            setRegistrationForm({
              ...registrationForm,
              goals: e.target.value,
            })
          }
          className="w-full px-3 py-2 border rounded-lg text-gray-900"
          rows="2"
          placeholder="اهداف از یادگیری شنا"
        />

        <div className="flex gap-4 pt-4">
          <button
            onClick={handleSubmit}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-bold"
          >
            تکمیل ثبت‌نام
          </button>
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-bold"
          >
            {t("cancel")}
          </button>
        </div>
      </div>
    </div>
  );
}
