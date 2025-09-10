"use client";
import Image from "next/image";
import ChildrenImage from "@/public/images/pic-2.png";
import { useLanguage } from "@/app/contexts/LanguageContext";

function ChildrenSafetySection() {
  const { language } = useLanguage();

  const testimonials = {
    fa: [
      {
        id: 1,
        quote:
          "فرزندم عاشق کلاس‌های اقای رضایی شده و اعتماد به نفسش خیلی زیاد شده",
        parent: "کیان احمدی",
        childAge: "۷ سال",
      },
      {
        id: 2,
        quote: "آقای رضایی با صبر و مهربانی به کودکان آموزش می‌دهد",
        parent: "علی توکلی",
        childAge: "۹ سال",
      },
      {
        id: 3,
        quote: "استاد علی واقعاً تخصص کار با کودکان را دارد",
        parent: "دانیال موسوی",
        childAge: "۶ سال",
      },
    ],
    en: [
      {
        id: 1,
        quote:
          "My child loves Mr. Rezaei's classes and their confidence has improved greatly",
        parent: "Kian Ahmadi",
        childAge: "7 years",
      },
      {
        id: 2,
        quote: "Mr. Rezaei teaches children with patience and kindness",
        parent: "Ali Tavakoli",
        childAge: "9 years",
      },
      {
        id: 3,
        quote: "Coach Ali truly has expertise in working with children",
        parent: "Danial Mousavi",
        childAge: "6 years",
      },
    ],
  };

  const parentTestimonials = testimonials[language];

  return (
    <section className="bg-gray-50 py-10">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-10 items-center">
          <div className="md:col-span-2 relative h-96">
            <Image
              alt={
                language === "fa"
                  ? "آموزش شنا کودکان"
                  : "Children's Swimming Training"
              }
              src={ChildrenImage}
              className="object-cover rounded-lg"
              fill
              quality={70}
            />
          </div>
          <div className="md:col-span-1">
            {parentTestimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className={`bg-white shadow-md mt-2 p-6 border-primary ${
                  language === "fa" ? "border-r-4" : "border-l-4"
                } rounded-lg`}
              >
                <p className="text-gray-700 mb-4 text-sm italic">
                  &quot;{testimonial.quote}&quot;
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-primary">
                    {testimonial.parent}
                  </span>
                  <span className="text-xs text-gray-500">
                    {testimonial.childAge}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ChildrenSafetySection;
