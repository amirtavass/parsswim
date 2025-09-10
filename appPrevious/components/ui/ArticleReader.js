"use client";
import Image from "next/image";
import Link from "next/link";

function ArticleReader({ article, swimmingType, onBack }) {
  // Error handling - if no article is passed
  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            مقاله یافت نشد
          </h1>
          <Link href="/articles" className="text-primary hover:underline">
            بازگشت به مقالات
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-4xl px-4">
        {/* BREADCRUMB NAVIGATION */}
        <div className="flex items-center mb-8 text-sm">
          <Link href="/articles" className="text-gray-500 hover:text-primary">
            مقالات
          </Link>
          {swimmingType && (
            <>
              <span className="mx-2 text-gray-400">/</span>
              <button
                onClick={onBack}
                className="text-gray-500 hover:text-primary"
              >
                {swimmingType.name}
              </button>
            </>
          )}
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-800">{article.title}</span>
        </div>

        {/* MAIN ARTICLE CONTAINER */}
        <article className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* HERO IMAGE WITH OVERLAY */}
          <div className="relative h-64 md:h-96">
            <Image
              src={article.image}
              alt={article.title}
              fill
              className="object-cover"
              quality={90}
            />
            {/* Dark overlay for text readability */}
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end">
              <div className="p-8 text-white">
                {/* ARTICLE METADATA BADGES */}
                <div className="flex items-center gap-4 mb-4">
                  <span className="bg-primary px-3 py-1 rounded-full text-sm">
                    {article.difficulty}
                  </span>
                  <span className="text-sm opacity-90">{article.readTime}</span>
                  <span className="text-sm opacity-90">
                    {article.publishDate}
                  </span>
                </div>

                {/* ARTICLE TITLE */}
                <h1 className="text-3xl md:text-4xl font-bold leading-tight">
                  {article.title}
                </h1>
              </div>
            </div>
          </div>

          {/* ARTICLE CONTENT SECTION */}
          <div className="p-8 md:p-12">
            {/* AUTHOR AND META INFO */}
            <div className="border-b border-gray-200 pb-6 mb-8">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>نویسنده: {article.author}</span>
                <div className="flex items-center gap-4">
                  <span>زمان مطالعه: {article.readTime}</span>
                  <span>سطح: {article.difficulty}</span>
                </div>
              </div>

              {/* TAGS */}
              <div className="flex flex-wrap gap-2 mt-4">
                {article.tags?.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* MAIN ARTICLE CONTENT */}
            {/* 
            This uses dangerouslySetInnerHTML to render HTML content
            The 'prose' classes are from Tailwind Typography plugin
            for beautiful article formatting
            */}
            <div
              className="prose prose-lg max-w-none prose-headings:text-gray-800 prose-p:text-gray-600 prose-p:leading-relaxed prose-li:text-gray-600"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            {/* BACK BUTTON */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <button
                onClick={onBack}
                className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg transition-colors"
              >
                بازگشت به فهرست مقالات
              </button>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}

// CRITICAL: Make sure to export the component as default
export default ArticleReader;
