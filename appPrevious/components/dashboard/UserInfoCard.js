"use client";
import { useState } from "react";
import { useLanguage } from "@/app/contexts/LanguageContext";

export function UserInfoCard({ user, onLogout }) {
  const [showChargeForm, setShowChargeForm] = useState(false);
  const [chargeAmount, setChargeAmount] = useState("");
  const { t } = useLanguage();

  const handleChargeBalance = async (e) => {
    e.preventDefault();
    if (!chargeAmount || chargeAmount < 1000) {
      alert("حداقل مبلغ شارژ 1000 تومان است");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("amount", chargeAmount);

      const response = await fetch("/dashboard/pay", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (response.redirected) {
        window.location.href = response.url;
      } else {
        alert("خطا در ایجاد درخواست پرداخت");
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert("خطا در اتصال به درگاه پرداخت");
    }
  };

  return (
    <div className="bg-blue-50 p-4 rounded-lg mt-6 max-w-md mx-auto">
      <h3 className="font-bold text-gray-800 mb-2">{t("userInfo")}</h3>
      <div className="text-sm text-gray-600 space-y-1">
        <p>
          <strong>{t("name")}:</strong> {user?.name}
        </p>
        <p>
          <strong>{t("email")}:</strong> {user?.email}
        </p>
        <p>
          <strong>{t("balance")}:</strong> {user?.balance?.toLocaleString()}{" "}
          {t("toman")}
        </p>
        <p>
          <strong>{t("skillLevel")}:</strong> {user?.skillLevel}
        </p>
      </div>

      <button
        onClick={() => setShowChargeForm(!showChargeForm)}
        className="mt-4 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
      >
        {t("chargeAccount")}
      </button>

      {showChargeForm && (
        <div className="mt-4 space-y-3">
          <input
            type="number"
            placeholder={t("amount")}
            min="1000"
            value={chargeAmount}
            onChange={(e) => setChargeAmount(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-gray-900"
            required
          />
          <div className="flex gap-2">
            <button
              onClick={handleChargeBalance}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm"
            >
              {t("pay")}
            </button>
            <button
              onClick={() => setShowChargeForm(false)}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded-lg text-sm"
            >
              {t("cancel")}
            </button>
          </div>
        </div>
      )}

      <button
        onClick={onLogout}
        className="mt-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors w-full"
      >
        {t("logoutAccount")}
      </button>
    </div>
  );
}
