"use client";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "../contexts/LanguageContext";

// Swimming types data
const swimmingTypes = [
  {
    id: 1,
    name: "کرال سینه",
    englishName: "Freestyle",
    slug: "freestyle",
    gif: "/images/articles/crawl-technique.gif",
    description: "سریع‌ترین و محبوب‌ترین شیوه شنا",
  },
  {
    id: 2,
    name: "کرال پشت",
    englishName: "Backstroke",
    slug: "backstroke",
    gif: "/images/articles/backstroke_Swim.gif",
    description: "شنای روی پشت با حرکات ریتمیک",
  },
  {
    id: 3,
    name: "پروانه",
    englishName: "Butterfly",
    slug: "butterfly",
    gif: "/images/articles/butterfly_Swim.gif",
    description: "پیچیده‌ترین و قدرتمندترین تکنیک",
  },
  {
    id: 4,
    name: "قورباغه",
    englishName: "Breaststroke",
    slug: "breaststroke",
    gif: "/images/articles/breaststroke_SWIM.gif",
    description: "آرام‌ترین و مناسب‌ترین برای مبتدیان",
  },
];

function ArticlesPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            {t("articlesTitle")}
          </h1>
          <p className="text-lg text-gray-600 mb-12">{t("articlesSubtitle")}</p>

          {/* Swimming Types Section */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-gray-800 mb-8">
              {t("fourMainTypes")}
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {swimmingTypes.map((type) => (
                <Link
                  key={type.id}
                  href={`/articles/${type.slug}`}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-6 group cursor-pointer transform hover:scale-105"
                >
                  <div className="relative w-full h-32 mb-4 rounded-lg overflow-hidden">
                    <Image
                      src={type.gif}
                      alt={type.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                      quality={80}
                    />
                    <div className="absolute inset-0 bg-blue-600 bg-opacity-20 group-hover:bg-opacity-10 transition-all duration-300"></div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-primary transition-colors">
                    {type.name}
                  </h3>
                  <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors">
                    {type.description}
                  </p>
                  <div className="mt-3 text-xs text-gray-400 group-hover:text-primary transition-colors">
                    {t("clickToViewArticles")}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ArticlesPage;
