'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image'; // اضافه شدن کامپوننت تصویر Next.js
import { Calendar, ArrowLeft, FileText, Clock } from 'lucide-react';
import CategorySidebar from './CategorySidebar';
import FilterableProductList from './FilterableProductList';
import Slideshow from './Slideshow';
import { Product, Category, Brands } from '@/types';

interface Article {
  slug: string;
  title: string;
  created_at: string;
  image_url?: string | null; // اضافه شدن این خط // اضافه شدن فیلد عکس
}

interface HomePageContentProps {
  products: Product[];
  categories: Category[];
  brands: Brands[];
  latestArticles: Article[];
}

export default function HomePageContent({ products, categories, brands, latestArticles }: HomePageContentProps) {
  const [activeFilter, setActiveFilter] = useState<{ type: 'category' | 'brand' | 'special'; value: string | null }>({ type: 'special', value: null });

  const filteredProducts = useMemo(() => {
    if (!activeFilter.value) return products;
    switch (activeFilter.type) {
      case 'category': return products.filter(p => p.category_id === activeFilter.value);
      case 'brand': return products.filter(p => p.brand_id === activeFilter.value);
      case 'special':
        switch (activeFilter.value) {
          case 'bestsellers': return products.filter(p => p.is_bestseller);
          case 'discounted': return products.filter(p => p.discount_percentage && p.discount_percentage > 0);
          case 'topRated': return products.filter(p => Number(p.average_rating || 0) >= 3.5);
          default: return products;
        }
      default: return products;
    }
  }, [products, activeFilter]);

  return (
    <>
      <Slideshow />
      
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

      {/* --- بخش مقالات با طراحی جدید --- */}
      <section className="bg-gradient-to-b from-white to-gray-50 py-20 w-full">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <h2 className="text-3xl lg:text-4xl font-black text-gray-900 mb-4">آخرین مطالب مجله</h2>
              <p className="text-gray-500 max-w-lg">جدیدترین مقالات آموزشی و اخبار دنیای زیبایی را اینجا دنبال کنید.</p>
            </div>
            <div className="h-1 w-20 bg-indigo-600 rounded-full hidden md:block"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
  {latestArticles.map((article) => (
    <div key={article.slug} className="group bg-white rounded-[2.5rem] shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden flex flex-col border border-gray-100">
      
      {/* بخش تصویر مقاله */}
      <div className="relative h-64 w-full overflow-hidden bg-gray-100">
        {article.image_url ? (
                 <Image
                   src={article.image_url}
                   alt={article.title}
                   fill
                   priority
                   className="object-cover opacity-60"
                 />
               ) : (
          /* اگر عکس نداشت، یک آیکون یا تصویر پیش‌فرض نشان دهد */
          <div className="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-200">
            <FileText size={100} />
          </div>
        )}
        
        {/* نشان تاریخ روی عکس */}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-900">
            <Calendar className="w-3.5 h-3.5 text-indigo-600" />
            {new Date(article.created_at).toLocaleDateString('fa-IR')}
          </div>
        </div>
      </div>

      <div className="p-8 flex flex-col flex-grow">
        <div className="flex items-center gap-4 mb-4 text-gray-400 text-xs font-medium">
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            ۵ دقیقه مطالعه
          </div>
        </div>
        
        <h3 className="text-xl font-bold text-gray-800 mb-6 leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2">
          {article.title}
        </h3>
        
        <div className="mt-auto pt-4 border-t border-gray-50">
          <Link 
            href={`/articles/${article.slug}`} 
            className="flex items-center justify-between text-sm font-bold text-gray-700 group/link"
          >
            <span>ادامه مطلب</span>
            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover/link:bg-indigo-600 group-hover/link:text-white transition-all">
              <ArrowLeft className="w-4 h-4 rotate-180" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  ))}
</div>
        </div>
      </section>
    </>
  );
}