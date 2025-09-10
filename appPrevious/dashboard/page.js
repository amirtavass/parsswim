"use client";
import { useAuth } from "@/app/contexts/authContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import ProtectedRoute from "@/app/auth/ProtectedRoute";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { UserInfoCard } from "@/app/components/dashboard/UserInfoCard";
import { ClassRegistrationForm } from "@/app/components/dashboard/ClassRegistrationForm";
import { QuickActions } from "@/app/components/dashboard/QuickActions";

function DashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const action = searchParams.get("action");

  const [selectedClass, setSelectedClass] = useState(null);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);

  // Check for selected class on mount
  useEffect(() => {
    if (action === "register") {
      const savedClass = localStorage.getItem("selectedClass");
      if (savedClass) {
        try {
          const classData = JSON.parse(savedClass);
          setSelectedClass(classData);
          if (classData.price === 0) {
            setShowRegistrationForm(true);
          }
        } catch (error) {
          console.error("Error parsing saved class:", error);
          localStorage.removeItem("selectedClass");
        }
      }
    }
  }, [action]);

  const handleLogout = async () => {
    await logout();
    localStorage.removeItem("selectedClass");
    window.location.href = "/";
  };

  const handleRegistrationSubmit = async (formData) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      alert(`ثبت‌نام در کلاس "${selectedClass.title}" با موفقیت انجام شد!`);

      setSelectedClass(null);
      setShowRegistrationForm(false);
      localStorage.removeItem("selectedClass");
      router.push("/dashboard");
    } catch (error) {
      console.error("Registration error:", error);
      alert("خطا در ثبت‌نام. لطفاً دوباره تلاش کنید.");
    }
  };

  const handleCancelSelection = () => {
    setSelectedClass(null);
    setShowRegistrationForm(false);
    localStorage.removeItem("selectedClass");
    router.push("/dashboard");
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-200 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-white rounded-xl shadow-lg p-8">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-800 mb-4">
                {t("welcome")} {user?.name}
              </h1>
              <p className="text-lg text-gray-600">{t("welcomeToDashboard")}</p>

              {/* User Info Card */}
              <UserInfoCard user={user} onLogout={handleLogout} />
            </div>

            {/* Registration Form for Free Classes */}
            {showRegistrationForm && selectedClass && (
              <ClassRegistrationForm
                selectedClass={selectedClass}
                onSubmit={handleRegistrationSubmit}
                onCancel={handleCancelSelection}
              />
            )}

            {/* Selected Paid Class */}
            {selectedClass &&
              !showRegistrationForm &&
              selectedClass.price > 0 && (
                <div className="mb-8 p-6 bg-yellow-50 border border-yellow-400 rounded-lg">
                  <h3 className="text-xl font-bold text-yellow-800 mb-4">
                    کلاس انتخاب شده برای ثبت‌نام
                  </h3>
                  <div className="bg-white p-4 rounded-lg">
                    <h4 className="font-bold text-lg">{selectedClass.title}</h4>
                    <p className="text-gray-600">
                      قیمت: {selectedClass.price.toLocaleString()} تومان
                    </p>
                    <div className="mt-4 flex gap-4">
                      <button
                        onClick={() => alert("Redirect to payment...")}
                        className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg"
                      >
                        پرداخت و ثبت‌نام
                      </button>
                      <button
                        onClick={handleCancelSelection}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg"
                      >
                        {t("cancel")}
                      </button>
                    </div>
                  </div>
                </div>
              )}

            {/* Quick Actions */}
            {!selectedClass && !showRegistrationForm && <QuickActions />}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default DashboardPage;
