"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { swimmingTypes, articlesContent } from "@/app/data/articles";
import ArticleReader from "@/app/components/ui/ArticleReader";

export default function BreaststrokePage() {
  const [selectedArticle, setSelectedArticle] = useState(null);

  const swimmingType = swimmingTypes.breaststroke;
  const articles = Object.values(articlesContent.breaststroke || {});

  if (selectedArticle) {
    return (
      <ArticleReader
        article={selectedArticle}
        swimmingType={swimmingType}
        onBack={() => setSelectedArticle(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-6xl px-4">
        {/* Header with Swimming Type Info */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center mb-4">
            <Link
              href="/articles"
              className="text-gray-500 hover:text-primary transition-colors"
            >
              مقالات
            </Link>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-gray-800 font-medium">
              {swimmingType.name}
            </span>
          </div>

          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            مقالات {swimmingType.name}
          </h1>

          <p className="text-lg text-gray-600 mb-8">
            {swimmingType.description}
          </p>

          {/* Swimming Type GIF */}
          <div className="relative w-64 h-40 mx-auto mb-12 rounded-xl overflow-hidden shadow-lg">
            <Image
              src={swimmingType.gif}
              alt={swimmingType.name}
              fill
              className="object-cover"
              quality={80}
            />
          </div>
        </div>

        {/* Articles Grid */}
        {articles.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => (
              <article
                key={article.id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden group"
              >
                <div className="relative h-48">
                  <Image
                    src={article.image}
                    alt={article.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    quality={80}
                  />
                  <div className="absolute top-4 right-4">
                    <span className="bg-primary text-white px-2 py-1 rounded-full text-xs">
                      {article.difficulty}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-4 mb-3 text-sm text-gray-500">
                    <span className="flex items-center">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {article.readTime}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-800 mb-3 leading-tight">
                    {article.title}
                  </h3>

                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {article.excerpt}
                  </p>

                  <button
                    onClick={() => setSelectedArticle(article)}
                    className="inline-block bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    ادامه مطلب
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-gray-400 text-6xl mb-4">📝</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              مقاله‌ای یافت نشد
            </h3>
            <p className="text-gray-600">
              مقاله‌ای برای این نوع شنا هنوز منتشر نشده است.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
