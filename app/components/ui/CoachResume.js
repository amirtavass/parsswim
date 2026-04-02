"use client";
import {
  FaChalkboardTeacher,
  FaCertificate,
  FaTrophy,
  FaSwimmer,
  FaUsers,
  FaMedal,
  FaAward,
} from "react-icons/fa";
import { useLanguage } from "@/app/contexts/LanguageContext";

function CoachResume() {
  const { t, language } = useLanguage();
  const isRtl = language === "fa";

  const stats = {
    fa: [
      { value: "۱۵+", label: "سال تجربه", icon: FaSwimmer },
      { value: "۵۰۰+", label: "دانش‌آموز", icon: FaUsers },
      { value: "۴", label: "مدرک معتبر", icon: FaCertificate },
      { value: "۶", label: "افتخار ورزشی", icon: FaMedal },
    ],
    en: [
      { value: "15+", label: "Years Experience", icon: FaSwimmer },
      { value: "500+", label: "Students Trained", icon: FaUsers },
      { value: "4", label: "Certifications", icon: FaCertificate },
      { value: "6", label: "Awards Won", icon: FaMedal },
    ],
  };

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
        "Intl. Swimming Cert",
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
  const currentStats = stats[language];

  return (
    <section
      className="py-20 bg-gray-50 overflow-hidden"
      suppressHydrationWarning
    >
      <div className="mx-auto max-w-6xl px-4">
        {/* Section Header */}
        <div className="text-center mb-16 px-4 flex flex-col items-center">
          <span className="inline-block px-4 py-1.5 bg-blue-100/50 text-primary text-sm font-bold rounded-full mb-6 tracking-wide border border-blue-200">
            {t("coachResume")}
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-5 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-800 to-gray-500 pb-2">
            {language === "fa" ? "۱۵ سال سابقه درخشان." : "Proven Excellence."}
          </h2>
          <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto font-medium leading-relaxed">
            {language === "fa"
              ? "آموزش تخصصی شنا با تکیه بر تجربه و مدارک معتبر بین‌المللی."
              : "15 years of specialized swimming instruction backed by recognized international certifications."}
          </p>
        </div>
        {/* Bento Box Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 auto-rows-[minmax(160px,auto)]">
          {/* Card 1: Experience */}
          <div className="md:col-span-2 md:row-span-2 bg-gray-900 rounded-[2rem] p-8 text-white shadow-xl hover:-translate-y-1 transition-transform duration-300 flex flex-col justify-between group">
            <div>
              <div className="w-14 h-14 bg-gray-800 rounded-2xl flex items-center justify-center mb-6 border border-gray-700">
                <FaChalkboardTeacher className="text-2xl text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold mb-6">
                {language === "fa" ? "سوابق کاری" : "Work Experience"}
              </h3>
              <div className="space-y-4">
                {data.experience.map((item, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.8)] shrink-0" />
                    <span className="text-gray-300 text-lg">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card 2: Years Experience */}
          <div className="bg-primary rounded-[2rem] p-8 text-white shadow-lg hover:-translate-y-1 transition-transform duration-300 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-10 text-9xl">
              <FaSwimmer />
            </div>
            <FaSwimmer className="text-3xl text-blue-200 mb-4 relative z-10" />
            <div className="relative z-10">
              <div className="text-5xl font-extrabold mb-2">
                {currentStats[0].value}
              </div>
              <div className="text-blue-100 font-medium text-lg">
                {currentStats[0].label}
              </div>
            </div>
          </div>

          {/* Card 3: Students Trained */}
          <div className="bg-white rounded-[2rem] p-8 text-gray-900 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between border border-gray-100">
            <FaUsers className="text-3xl text-primary mb-4" />
            <div>
              <div className="text-5xl font-extrabold mb-2 text-gray-800">
                {currentStats[1].value}
              </div>
              <div className="text-gray-500 font-medium text-lg">
                {currentStats[1].label}
              </div>
            </div>
          </div>

          {/* Card 4: Achievements */}
          <div className="md:col-span-2 bg-white rounded-[2rem] p-8 border border-gray-100 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center shrink-0">
                <FaTrophy className="text-xl text-amber-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">
                {language === "fa" ? "افتخارات کلیدی" : "Key Achievements"}
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {data.achievements.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 border border-gray-100"
                >
                  <FaAward className="text-amber-500 shrink-0" />
                  <span className="text-gray-700 text-sm font-medium">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Card 5: Certificates */}
        </div>
      </div>
    </section>
  );
}

export default CoachResume;
