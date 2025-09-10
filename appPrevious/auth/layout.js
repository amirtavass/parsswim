"use client";
import { useAuth } from "@/app/contexts/authContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
// export const metadata = {
//   title: "ورود و عضویت - آرمان داریوشی",
//   description:
//     "ورود به حساب کاربری یا ثبت‌نام جدید برای دسترسی به کلاس‌های شنا و خدمات آموزشی آرمان داریوشی.",
// };

export default function AuthLayout({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">در حال بررسی احراز هویت...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
