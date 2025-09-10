"use client";
import { useLogin } from "@/app/hooks/useAuth";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/app/contexts/LanguageContext";

function LoginPage() {
  const [formData, setFormData] = useState({
    name: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useLanguage();

  const router = useRouter();
  const searchParams = useSearchParams();
  const classId = searchParams.get("classId");

  const loginMutation = useLogin();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = t("username") + " is required";
    }

    if (!formData.password) {
      newErrors.password = t("password") + " is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      await loginMutation.mutateAsync(formData);
      router.push("/dashboard");
    } catch (error) {
      console.error("Login failed:", error);

      if (error.response?.data?.message) {
        const message = error.response.data.message;
        setErrors({ general: t("error") + ": " + message });
      } else {
        setErrors({
          general: t("error"),
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-md mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {t("userLogin")}
            </h1>
            <p className="text-gray-600">{t("loginToAccount")}</p>
          </div>

          {errors.general && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("username")}
              </label>
              <input
                type="text"
                name="name"
                placeholder={t("username")}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                  errors.name ? "border-red-500 bg-red-50" : "border-gray-300"
                }`}
                value={formData.name}
                onChange={handleInputChange}
                disabled={isSubmitting}
                required
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("password")}
              </label>
              <input
                type="password"
                name="password"
                placeholder={t("password")}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                  errors.password
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300"
                }`}
                value={formData.password}
                onChange={handleInputChange}
                disabled={isSubmitting}
                required
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary hover:bg-primary-dark text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? t("loading") + "..." : t("loginButton")}
            </button>
          </form>

          <div className="text-center mt-8 pt-6 border-t border-gray-200">
            <p className="text-gray-600 mb-4">{t("newUser")}</p>
            <Link
              href="/auth/register"
              className="inline-block bg-success hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              {t("registerFirst")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
