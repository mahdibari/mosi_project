'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, ShoppingBag, ChevronLeft, Clock } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/pagination';

import CategorySidebar from './CategorySidebar';
import FilterableProductList from './FilterableProductList';
import Slideshow from './Slideshow';
import ProductCard from './ProductCard';
import { Product, Category, Brands } from '@/types';

interface Article {
  slug: string;
  title: string;
  created_at: string;
  image_url?: string | null;
}

interface HomePageContentProps {
  products: Product[];
  categories: Category[];
  brands: Brands[];
  latestArticles: Article[];
}

export default function HomePageContent({ products, categories, brands, latestArticles }: HomePageContentProps) {
  const [activeFilter, setActiveFilter] = useState<{ type: 'category' | 'brand' | 'special'; value: string | null }>({ 
    type: 'special', 
    value: null 
  });

  // محصولات جدید برای اسلایدر (۱۰ مورد آخر)
  const latestProducts = useMemo(() => products.slice(0, 10), [products]);

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-gray-950">
      <Slideshow />

      <main className="max-w-[1500px] mx-auto px-4 md:px-6 py-10">
        
        {/* اسلایدر جدیدترین‌ها */}
        <section className="mb-16">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
              <ShoppingBag className="text-indigo-600" /> جدیدترین محصولات
            </h2>
          </div>

          <Swiper
            dir="rtl"
            spaceBetween={15}
            slidesPerView={1.3}
            autoplay={{ delay: 3000 }}
            pagination={{ clickable: true }}
            breakpoints={{
              640: { slidesPerView: 2.3 },
              1024: { slidesPerView: 4 },
              1280: { slidesPerView: 5 }
            }}
            modules={[Autoplay, Pagination]}
            className="!pb-12"
          >
            {latestProducts.map((p) => (
              <SwiperSlide key={p.id}><ProductCard product={p} /></SwiperSlide>
            ))}
          </Swiper>
        </section>

        {/* لیست محصولات با فیلتر */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <aside className="lg:col-span-3">
            <CategorySidebar 
              categories={categories} 
              brands={brands} 
              activeFilter={activeFilter} 
              onFilterChange={setActiveFilter} 
            />
          </aside>
          <div className="lg:col-span-9">
            <FilterableProductList products={products} activeFilter={activeFilter} />
          </div>
        </div>

        {/* بخش مقالات */}
        <section className="mt-24">
          <h2 className="text-2xl font-black mb-10 dark:text-white">مجله زیبایی مصی شاپ</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {latestArticles.map((article) => (
              <Link key={article.slug} href={`/articles/${article.slug}`} className="group bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800">
                <div className="relative h-52">
                  {article.image_url ? (
                    <Image src={article.image_url} alt={article.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full bg-gray-100 dark:bg-gray-800" />
                  )}
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-gray-800 dark:text-white mb-3 line-clamp-2">{article.title}</h3>
                  <div className="flex items-center text-xs text-gray-400 gap-2">
                    <Calendar size={14} /> {new Date(article.created_at).toLocaleDateString('fa-IR')}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}