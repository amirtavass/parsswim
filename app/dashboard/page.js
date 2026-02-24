"use client";
import { useAuth } from "@/app/contexts/authContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ProtectedRoute from "@/app/auth/ProtectedRoute";
import Link from "next/link";
import { useLanguage } from "@/app/contexts/LanguageContext";

function DashboardPage() {
  const { user, logout } = useAuth();
  const { t, language } = useLanguage();
  const router = useRouter();

  const [selectedClass, setSelectedClass] = useState(null);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [registrationForm, setRegistrationForm] = useState({
    emergencyContact: "",
    emergencyPhone: "",
    medicalConditions: "",
    swimmingExperience: "beginner",
    goals: "",
  });

  // Check for selected class on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const action = urlParams.get("action");

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
    }
  }, []);

  const handleLogout = async () => {
    await logout();
    localStorage.removeItem("selectedClass");
    window.location.href = "/";
  };

  const handleRegistrationSubmit = async (e) => {
    e.preventDefault();

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const successMessage =
        language === "fa"
          ? `ثبت‌نام در کلاس "${selectedClass.title}" با موفقیت انجام شد!`
          : `Successfully registered for "${selectedClass.title}" class!`;

      alert(successMessage);

      // Clear form and selections
      setSelectedClass(null);
      setShowRegistrationForm(false);
      setRegistrationForm({
        emergencyContact: "",
        emergencyPhone: "",
        medicalConditions: "",
        swimmingExperience: "beginner",
        goals: "",
      });
      localStorage.removeItem("selectedClass");

      window.history.pushState({}, "", "/dashboard");
    } catch (error) {
      console.error("Registration error:", error);
      const errorMessage =
        language === "fa"
          ? "خطا در ثبت‌نام. لطفاً دوباره تلاش کنید."
          : "Registration error. Please try again.";
      alert(errorMessage);
    }
  };

  const handleCancelSelection = () => {
    setSelectedClass(null);
    setShowRegistrationForm(false);
    localStorage.removeItem("selectedClass");
    window.history.pushState({}, "", "/dashboard");
  };

  const handleChargeBalance = async (e) => {
    e.preventDefault();
    const amount = e.target.amount.value;

    if (!amount || amount < 1000) {
      const minAmountMessage =
        language === "fa"
          ? "حداقل مبلغ شارژ 1000 تومان است"
          : "Minimum charge amount is 1000 Toman";
      alert(minAmountMessage);
      return;
    }

    // Get the correct API URL
    const apiUrl =
      window.location.hostname === "localhost"
        ? "http://localhost:4000"
        : "https://parsswim-backend-production.up.railway.app";

    // Create a form and submit it (instead of fetch)
    const form = document.createElement("form");
    form.method = "POST";
    form.action = `${apiUrl}/dashboard/pay`;

    const amountInput = document.createElement("input");
    amountInput.type = "hidden";
    amountInput.name = "amount";
    amountInput.value = amount;

    form.appendChild(amountInput);
    document.body.appendChild(form);
    form.submit();
  };

  const handlePaidClassPayment = () => {
    const paymentMessage =
      language === "fa"
        ? "انتقال به صفحه پرداخت..."
        : "Redirecting to payment page...";
    alert(paymentMessage);
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
              <div className="bg-blue-50 p-4 rounded-lg mt-6 max-w-md mx-auto">
                <h3 className="font-bold text-gray-800 mb-2">
                  {t("userInfo")}
                </h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>
                    <strong>{t("name")}:</strong> {user?.name}
                  </p>
                  <p>
                    <strong>{t("email")}:</strong> {user?.email}
                  </p>
                  <p>
                    <strong>{t("balance")}:</strong>{" "}
                    {user?.balance?.toLocaleString()} {t("toman")}
                  </p>
                </div>

                {/* Charge Form */}
                <form onSubmit={handleChargeBalance} className="mt-4">
                  <input
                    type="number"
                    name="amount"
                    placeholder={t("amount")}
                    min="1000"
                    className="w-full px-3 py-2 border rounded-lg text-gray-900 mb-2"
                    required
                  />
                  <button
                    type="submit"
                    className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg"
                  >
                    {t("chargeAccount")}
                  </button>
                </form>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="mt-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
              >
                {t("logoutAccount")}
              </button>
            </div>

            {/* Registration Form for Free Classes */}
            {showRegistrationForm && selectedClass && (
              <div className="mb-8 p-6 bg-blue-50 border border-blue-400 rounded-lg">
                <h3 className="text-xl font-bold text-blue-800 mb-4">
                  {language === "fa"
                    ? `ثبت‌نام در کلاس: ${selectedClass.title}`
                    : `Register for Class: ${selectedClass.title}`}
                </h3>
                <div className="bg-white p-4 rounded-lg mb-6">
                  <h4 className="font-bold text-lg">{selectedClass.title}</h4>
                  <p className="text-gray-600">{selectedClass.classType}</p>
                  <p className="text-green-600 font-bold">{t("freeClass")}</p>
                  <p className="text-gray-600">
                    {language === "fa" ? "تاریخ" : "Date"}:{" "}
                    {new Date(selectedClass.date).toLocaleDateString(
                      language === "fa" ? "fa-IR" : "en-US"
                    )}
                  </p>
                  <p className="text-gray-600">
                    {language === "fa" ? "زمان" : "Time"}: {selectedClass.time}
                  </p>
                </div>

                <form onSubmit={handleRegistrationSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {language === "fa"
                          ? "نام و نام خانوادگی تماس اضطراری"
                          : "Emergency Contact Name"}
                      </label>
                      <input
                        type="text"
                        required
                        value={registrationForm.emergencyContact}
                        onChange={(e) =>
                          setRegistrationForm({
                            ...registrationForm,
                            emergencyContact: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border rounded-lg text-gray-900"
                        placeholder={
                          language === "fa"
                            ? "نام کامل شخص قابل تماس"
                            : "Full name of contact person"
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {language === "fa"
                          ? "شماره تماس اضطراری"
                          : "Emergency Contact Phone"}
                      </label>
                      <input
                        type="tel"
                        required
                        value={registrationForm.emergencyPhone}
                        onChange={(e) =>
                          setRegistrationForm({
                            ...registrationForm,
                            emergencyPhone: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border rounded-lg text-gray-900"
                        placeholder={
                          language === "fa" ? "09xxxxxxxxx" : "Phone number"
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {language === "fa" ? "تجربه شنا" : "Swimming Experience"}
                    </label>
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
                      <option value="beginner">
                        {language === "fa" ? "مبتدی" : "Beginner"}
                      </option>
                      <option value="intermediate">
                        {language === "fa" ? "متوسط" : "Intermediate"}
                      </option>
                      <option value="advanced">
                        {language === "fa" ? "پیشرفته" : "Advanced"}
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {language === "fa"
                        ? "مشکلات پزشکی (در صورت وجود)"
                        : "Medical Conditions (if any)"}
                    </label>
                    <textarea
                      value={registrationForm.medicalConditions}
                      onChange={(e) =>
                        setRegistrationForm({
                          ...registrationForm,
                          medicalConditions: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border rounded-lg text-gray-900"
                      rows="3"
                      placeholder={
                        language === "fa"
                          ? "هیچ مشکل خاصی ندارم یا ذکر مشکلات پزشکی"
                          : "No specific problems or mention medical conditions"
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {language === "fa"
                        ? "اهداف از یادگیری شنا"
                        : "Goals for Learning Swimming"}
                    </label>
                    <textarea
                      value={registrationForm.goals}
                      onChange={(e) =>
                        setRegistrationForm({
                          ...registrationForm,
                          goals: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border rounded-lg text-gray-900"
                      rows="3"
                      placeholder={
                        language === "fa"
                          ? "اهداف و انتظارات خود را شرح دهید"
                          : "Describe your goals and expectations"
                      }
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-bold"
                    >
                      {language === "fa"
                        ? "تکمیل ثبت‌نام"
                        : "Complete Registration"}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelSelection}
                      className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-bold"
                    >
                      {t("cancel")}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Selected Paid Class */}
            {selectedClass &&
              !showRegistrationForm &&
              selectedClass.price > 0 && (
                <div className="mb-8 p-6 bg-yellow-50 border border-yellow-400 rounded-lg">
                  <h3 className="text-xl font-bold text-yellow-800 mb-4">
                    {language === "fa"
                      ? "کلاس انتخاب شده برای ثبت‌نام"
                      : "Selected Class for Registration"}
                  </h3>
                  <div className="bg-white p-4 rounded-lg">
                    <h4 className="font-bold text-lg">{selectedClass.title}</h4>
                    <p className="text-gray-600">
                      {language === "fa" ? "قیمت" : "Price"}:{" "}
                      {selectedClass.price.toLocaleString()} {t("toman")}
                    </p>
                    <div className="mt-4 flex gap-4">
                      <button
                        onClick={handlePaidClassPayment}
                        className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg"
                      >
                        {language === "fa"
                          ? "پرداخت و ثبت‌نام"
                          : "Pay and Register"}
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
            {!selectedClass && !showRegistrationForm && (
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-blue-50 p-6 rounded-lg text-center">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">
                    {language === "fa" ? "کلاس‌های شنا" : "Swimming Classes"}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {language === "fa"
                      ? "مشاهده و ثبت‌نام در کلاس‌های مختلف"
                      : "View and register for different classes"}
                  </p>
                  <Link
                    href="/"
                    className="inline-block bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark"
                  >
                    {language === "fa"
                      ? "مشاهده تمام کلاس‌ها"
                      : "View All Classes"}
                  </Link>
                </div>

                <div className="bg-purple-50 p-6 rounded-lg text-center">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">
                    {t("products")}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {language === "fa"
                      ? "خرید تجهیزات شنا"
                      : "Buy swimming equipment"}
                  </p>
                  <a
                    href="/products"
                    className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg"
                  >
                    {t("viewAllProducts")}
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default DashboardPage;
