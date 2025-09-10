import Link from "next/link";
import { useLanguage } from "@/app/contexts/LanguageContext";

function Footer() {
  const { t, language } = useLanguage();

  return (
    <div className="mt-0 py-5 text-white bg-gray-800">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div
            className={`text-center ${
              language === "fa" ? "md:text-right" : "md:text-left"
            }`}
          >
            <h3 className="text-xl font-bold mb-2">
              {language === "fa" ? "پارس شنا" : "Pars Swimming"}
            </h3>
            <p className="text-gray-300">{t("swimCoach")}</p>
            <p className="text-gray-300">
              {language === "fa" ? "تلفن" : "Phone"}: 09179488211
            </p>
            <p className="text-gray-300">
              {language === "fa" ? "ایمیل" : "Email"}: amirtavass62@gmail.com
            </p>
          </div>

          <div
            className={`text-center ${
              language === "fa" ? "md:text-left" : "md:text-right"
            }`}
          >
            <div
              className={`flex gap-6 mb-3 justify-center ${
                language === "fa" ? "md:justify-start" : "md:justify-end"
              }`}
            >
              <Link
                href="/"
                className="text-gray-300 hover:text-white transition-colors"
              >
                {t("home")}
              </Link>
              <Link
                href="/auth/register"
                className="text-gray-300 hover:text-white transition-colors"
              >
                {t("register")}
              </Link>
              <Link
                href="/products"
                className="text-gray-300 hover:text-white transition-colors"
              >
                {t("products")}
              </Link>
            </div>
            <p className="text-gray-400 text-sm">
              © 2025 Amir Tavassoli. {t("allRightsReserved")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Footer;
