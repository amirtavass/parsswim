"use client";
import { FaChalkboardTeacher, FaCertificate, FaTrophy } from "react-icons/fa";
import { useLanguage } from "@/app/contexts/LanguageContext";

function CoachResume() {
  const { t, language } = useLanguage();

  const resumeData = {
    fa: {
      experience: [
        "۱۵ سال سابقه آموزش شنا",
        "بیش از ۵۰۰ دانش‌آموز",
        "آموزش کودکان و بزرگسالان",
        "تدریس در باشگاه‌های معتبر",
      ],
      certificates: [
        "مدرک بین‌المللی شنا",
        "مربیگری درجه یک",
        "گواهینامه نجات‌گری",
        "مدرک آموزش کودکان",
      ],
      achievements: [
        "مدال طلای کشوری ۱۳۸۵",
        "رکورددار استانی",
        "شرکت در المپیاد ملی",
        "قهرمان لیگ شنا",
      ],
    },
    en: {
      experience: [
        "15 years of swimming coaching",
        "Over 500 students trained",
        "Children and adult training",
        "Teaching at prestigious clubs",
      ],
      certificates: [
        "International Swimming Certificate",
        "Level 1 Coaching License",
        "Lifeguard Certificate",
        "Child Training Certification",
      ],
      achievements: [
        "National Gold Medal 2006",
        "Provincial Record Holder",
        "National Olympiad Participant",
        "Swimming League Champion",
      ],
    },
  };

  const data = resumeData[language];

  return (
    <section className="py-13 bg-gray-50">
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center mb-12">
          <h2 className="text-gray-800 font-bold text-3xl mb-4">
            {t("coachResume")}
          </h2>
          <p className="text-lg text-gray-600">{t("experience15Years")}</p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-blue-100 flex justify-center rounded-full items-center mx-auto mb-6">
              <FaChalkboardTeacher className="text-3xl text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              {t("workExperience")}
            </h3>
            <ul className="text-gray-600 space-y-2">
              {data.experience.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-blue-100 flex justify-center rounded-full items-center mx-auto mb-6">
              <FaCertificate className="text-3xl text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              {t("certificates")}
            </h3>
            <ul className="text-gray-600 space-y-2">
              {data.certificates.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-blue-100 flex justify-center rounded-full items-center mx-auto mb-6">
              <FaTrophy className="text-3xl text-yellow-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              {t("achievements")}
            </h3>
            <ul className="text-gray-600 space-y-2">
              {data.achievements.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CoachResume;
