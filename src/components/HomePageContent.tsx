// File: components/HomePageContent.tsx

'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Calendar, ArrowLeft } from 'lucide-react';
import CategorySidebar from './CategorySidebar';
import FilterableProductList from './FilterableProductList';
import Slideshow from './Slideshow'; // اضافه کردن این خط
import { Product, Category, Brands } from '@/types';

// اینترفیس برای مقالات
interface Article {
  slug: string;
  title: string;
  created_at: string;
}

// اینترفیس prop ها
interface HomePageContentProps {
  products: Product[];
  categories: Category[];
  brands: Brands[];
  latestArticles: Article[];
}

export default function HomePageContent({ products, categories, brands, latestArticles }: HomePageContentProps) {
  const [activeFilter, setActiveFilter] = useState<{ type: 'category' | 'brand' | 'special'; value: string | null }>({ type: 'special', value: null });

  const filteredProducts = useMemo(() => {
    if (!activeFilter.value) {
      return products;
    }

    switch (activeFilter.type) {
      case 'category':
        return products.filter(p => p.category_id === activeFilter.value);
      case 'brand':
        return products.filter(p => p.brand_id === activeFilter.value);
      case 'special':
        switch (activeFilter.value) {
          case 'bestsellers':
            return products.filter(p => p.is_bestseller);
          case 'discounted':
            return products.filter(p => p.discount_percentage && p.discount_percentage > 0);
          case 'topRated':
            return products.filter(p => Number(p.average_rating || 0) >= 3.5);
          default:
            return products;
        }
      default:
        return products;
    }
  }, [products, activeFilter]);

  return (
    <>
      {/* اضافه کردن اسلایدشو در بالای صفحه */}
      <Slideshow />
      
      {/* --- بخش اصلی: محصولات و دسته‌بندی‌ها --- */}
      <div className="container mx-auto flex flex-col lg:flex-row gap-8 p-6">
        <aside className="w-full lg:w-64 flex-shrink-0">
          <CategorySidebar
            categories={categories}
            brands={brands}
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
          />
        </aside>
        <main className="flex-grow">
          <FilterableProductList products={filteredProducts} />
        </main>
      </div>

      {/* --- بخش جدا: مقالات (تمام‌عرض) --- */}
      <section className="bg-gradient-to-br from-gray-50 to-indigo-50 py-16 lg:py-24 w-full">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-800 mb-4">آخرین مقالات</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              با مقالات ما از آخرین اخبار و ترفندهای دنیای پوست و زیبایی باخبر شوید.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {latestArticles.map((article) => (
              <div key={article.slug} className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <Calendar className="w-4 h-4 ml-2" />
                    {new Date(article.created_at).toLocaleDateString('fa-IR')}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4 leading-relaxed">{article.title}</h3>
                </div>
                <Link 
                  href={`/articles/${article.slug}`} 
                  className="inline-flex items-center justify-center w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 font-semibold text-center shadow-md"
                >
                  این مقاله را بخوانید
                  <ArrowLeft className="w-4 h-4 mr-2 rotate-180" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}