"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useClasses } from "@/app/hooks/useClasses";
import { useAuth } from "@/app/contexts/authContext";
import { useLanguage } from "@/app/contexts/LanguageContext";
import {
  MdAccessTime,
  MdCalendarToday,
  MdGroup,
  MdLocationOn,
} from "react-icons/md";

function ClassRegister() {
  const [selectedClass, setSelectedClass] = useState(null);
  const router = useRouter();
  const { data: classes, isLoading, error } = useClasses();
  const { isAuthenticated } = useAuth();
  const { t, language } = useLanguage();

  const handleSelectClass = (cls) => {
    if (!isAuthenticated) {
      router.push("/auth/login");
    } else {
      localStorage.setItem("selectedClass", JSON.stringify(cls));
      router.push("/dashboard?action=register");
    }
  };

  const getButtonText = (cls) => {
    if (cls.currentStudents >= cls.maxStudents) {
      return t("classFull");
    }

    if (!isAuthenticated) {
      return t("loginAndRegister");
    }

    if (cls.price === 0) {
      return t("registerFree");
    } else {
      return t("selectAndRegister");
    }
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">{t("loading")}...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <div className="text-red-600 mb-4">⚠️</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">{t("error")}</h3>
          <p className="text-gray-600">{t("error")}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg"
          >
            {t("tryAgain")}
          </button>
        </div>
      </section>
    );
  }

  if (!classes || classes.length === 0) {
    return (
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            {t("classRegistration")}
          </h2>
          <p className="text-lg text-gray-600 mb-8">{t("selectClass")}</p>
          <div className="bg-gray-100 p-8 rounded-lg">
            <p className="text-gray-600 mb-4">{t("noDataFound")}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            {t("classRegistration")}
          </h2>
          <p className="text-lg text-gray-600">{t("selectClass")}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {classes.map((cls) => (
            <div
              key={cls._id}
              className="bg-white rounded-xl shadow-lg overflow-hidden border hover:shadow-xl transition-shadow"
            >
              <div
                className={`text-white p-6 text-center ${
                  cls.price === 0 ? "bg-green-600" : "bg-primary"
                }`}
              >
                <h3 className="text-xl font-bold mb-2">{cls.title}</h3>
                <div className="text-3xl font-bold">
                  {cls.price === 0
                    ? t("freeClass")
                    : cls.price.toLocaleString()}
                </div>
                {cls.price > 0 && (
                  <div className="text-sm opacity-90">{t("toman")}</div>
                )}
                {cls.price === 0 && (
                  <div className="text-sm opacity-90">
                    {t("freeTrialSession")}
                  </div>
                )}
              </div>
              <div className="p-6">
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-gray-600">
                    <MdAccessTime
                      className={`${
                        language === "fa" ? "ml-3" : "mr-3"
                      } text-primary w-5 h-5`}
                    />
                    <span>
                      {cls.duration} {t("duration")}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MdCalendarToday
                      className={`${
                        language === "fa" ? "ml-3" : "mr-3"
                      } text-primary w-5 h-5`}
                    />
                    <span>
                      {new Date(cls.date).toLocaleDateString(
                        language === "fa" ? "fa-IR" : "en-US"
                      )}{" "}
                      - {cls.time}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MdGroup
                      className={`${
                        language === "fa" ? "ml-3" : "mr-3"
                      } text-primary w-5 h-5`}
                    />
                    <span>
                      {cls.maxStudents - cls.currentStudents}{" "}
                      {t("availableSpots")} {cls.maxStudents}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MdLocationOn
                      className={`${
                        language === "fa" ? "ml-3" : "mr-3"
                      } text-primary w-5 h-5`}
                    />
                    <span>
                      {cls.location ||
                        (language === "fa" ? "استخر اصلی" : "Main Pool")}
                    </span>
                  </div>
                </div>
                {cls.description && (
                  <p className="text-gray-600 mb-6">{cls.description}</p>
                )}
                <button
                  onClick={() => handleSelectClass(cls)}
                  disabled={cls.currentStudents >= cls.maxStudents}
                  className={`w-full py-3 rounded-lg font-medium transition-colors ${
                    cls.currentStudents >= cls.maxStudents
                      ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                      : cls.price === 0
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : "bg-success hover:bg-green-700 text-white"
                  }`}
                >
                  {getButtonText(cls)}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ClassRegister;
