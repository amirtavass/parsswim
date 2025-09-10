"use client";

import Image from "next/image";
import HeroImage from "@/public/images/registerHero.jpg";
import ProductImage from "@/public/images/productsHero.jpg";
import CoachImage from "@/public/images/coachHero.jpg";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useLanguage } from "@/app/contexts/LanguageContext";

function SlidingHero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { t } = useLanguage();

  const slides = [
    {
      id: 0,
      title: t("heroTitle"),
      subtitle: t("heroSubtitle"),
      ctaText: t("heroCta"),
      ctaLink: "/register",
      bgColor: "bg-primary hover:bg-primary-dark",
      imagesrc: HeroImage,
    },
    {
      id: 1,
      title: t("shopTitle"),
      subtitle: t("shopSubtitle"),
      ctaText: t("viewAllProducts"),
      ctaLink: "/products",
      bgColor: "bg-green-600 hover:bg-green-700",
      imagesrc: ProductImage,
    },
    {
      id: 2,
      title: t("articlesTitle"),
      subtitle: t("articlesSubtitle"),
      ctaText: t("readMore"),
      ctaLink: "/articles",
      bgColor: "bg-purple-600 hover:bg-purple-700",
      imagesrc: CoachImage,
    },
  ];

  const getTransform = (slideIndex) => {
    if (slideIndex === currentSlide) {
      return "translate-x-0";
    } else if (slideIndex > currentSlide) {
      return "translate-x-full";
    } else {
      return "translate-x-[-100%]";
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <main>
      <div className="relative w-full h-[70vh] overflow-hidden">
        {slides.map((slide, index) => (
          <section
            key={slide.id}
            className={`inset-0 flex justify-center items-center flex-col absolute h-[70vh] text-center overflow-hidden transition-transform transform ease-in-out duration-1000 ${getTransform(
              index
            )}`}
          >
            <div className="top-0 left-0 absolute w-full h-full -z-10">
              <Image
                src={slide.imagesrc}
                alt="Swimmer"
                fill
                className="object-cover"
                quality={80}
                placeholder="blur"
              />
            </div>
            <div className="bg-black bg-opacity-70 absolute top-0 left-0 w-full h-full -z-5"></div>
            <div className="relative z-10 text-white px-4">
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                {slide.title}
              </h1>
              <p className="text-xl md:text-2xl mb-8">{slide.subtitle}</p>
              <Link
                href={slide.ctaLink}
                className={`text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors ${slide.bgColor}`}
              >
                {slide.ctaText}
              </Link>
            </div>
          </section>
        ))}

        {/* Navigation Dots */}
        <div className="absolute bottom-7 left-1/2 -translate-x-1/2 transform flex gap-2 z-20">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`${
                currentSlide === index ? "bg-white" : "bg-gray-600"
              } rounded-full h-3 w-3 transition-colors cursor-pointer`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      </div>
    </main>
  );
}

export default SlidingHero;
