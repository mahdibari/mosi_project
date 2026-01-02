// File: app/products/ProductListClient.tsx

'use client';

import { useState, useMemo } from 'react';
import ProductCard from '@/components/ProductCard';
import { Product, Category } from '@/types';
//import Image from 'next/image';
import {
  Search,
  Filter,
  SlidersHorizontal,
  ChevronDown,
  X,
  TrendingUp,
  Sparkles,
  Star,
} from 'lucide-react';

interface ProductListClientProps {
  products: Product[];
  categories: Category[];
}

export default function ProductListClient({ products, categories }: ProductListClientProps) {
  // State برای جستجو
  const [searchTerm, setSearchTerm] = useState('');

  // State برای مرتب‌سازی
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'price-asc', 'price-desc', 'rating-desc'
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

  // State برای فیلتر دسته‌بندی
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  
  // State برای فیلترهای ویژه
  const [activeFilter, setActiveFilter] = useState<{ type: 'category' | 'special' | null; value: string | null }>({ type: null, value: null });

  // محصولات فیلتر و مرتب‌شده با useMemo برای بهینه‌سازی
  const filteredAndSortedProducts = useMemo(() => {
    let result = products;

    // 1. اعمال فیلتر جستجو
    if (searchTerm) {
      result = result.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 2. اعمال فیلتر دسته‌بندی یا ویژه
    if (activeFilter.type && activeFilter.value) {
      switch (activeFilter.type) {
        case 'category':
          result = result.filter(p => p.category_id === activeFilter.value);
          break;
        case 'special':
          switch (activeFilter.value) {
            case 'bestsellers':
              result = result.filter(p => p.is_bestseller);
              break;
            case 'discounted':
              result = result.filter(p => p.discount_percentage && p.discount_percentage > 0);
              break;
            case 'topRated':
              result = result.filter(p => (p.average_rating || 0) >= 4.5);
              break;
          }
          break;
      }
    }

    // 3. اعمال مرتب‌سازی
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating-desc':
        result.sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0));
        break;
      case 'newest':
      default:
        // پیش‌فرض بر اساس جدیدترین مرتب شده است
        break;
    }

    return result;
  }, [products, searchTerm, activeFilter, sortBy]);

  // تابع برای کلیک روی فیلترهای ویژه
  const handleSpecialFilterClick = (value: string) => {
    setActiveFilter(prev => {
      // اگر همان فیلتر دوباره کلیک شد، آن را غیرفعال کن
      if (prev.value === value) {
        return { type: null, value: null };
      }
      return { type: 'special', value };
    });
  };

  // تابع برای کلیک روی دسته‌بندی
  const handleCategoryFilterClick = (categoryId: string) => {
    setActiveFilter({ type: 'category', value: categoryId });
    setIsFilterDropdownOpen(false);
  };
  
  // تابع برای پاک کردن همه فیلترها
  const clearAllFilters = () => {
    setActiveFilter({ type: null, value: null });
    setSearchTerm('');
    setSortBy('newest');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br ">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/95 to-purple-600/95 z-10"></div>
        <div className="absolute inset-0">
         {/*
         <Image
            src="https://images.unsplash.com/photo-1441986300917-64674bd520d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D3D&auto=format&fit=crop&w=1950&q=80"
            alt="Hero Background"
            width={600} // <--- اضافه شد
            height={600} // <--- اضافه شد
            className="w-full h-full object-cover"
            priority
          />
          */}
        </div>
        
        <div className="relative z-20 container mx-auto px-4 py-24 lg:py-32 text-center text-white">
          <h1 className="text-4xl lg:text-6xl font-extrabold mb-6 leading-tight">
            کشف <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-300">زیبایی طبیعی</span> شما
          </h1>
          <p className="text-lg lg:text-xl max-w-3xl mx-auto leading-relaxed opacity-90">
            مجموعه‌ای از محصولات منتخب و باکیفیت برای درخشش پوستی شما
          </p>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="bg-white shadow-md sticky top-0 z-30 border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
            {/* Search Input */}
            <div className="relative w-full lg:w-auto flex-grow lg:flex-grow-0">
              <input
                type="text"
                placeholder="جستجوی محصول..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full lg:w-96 pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2 space-x-reverse">
              {/* Filter Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                  className="flex items-center justify-center px-6 py-3 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-300"
                >
                  <Filter className="w-5 h-5 ml-2" />
                  <span>دسته‌بندی</span>
                  <ChevronDown className="w-4 h-4 mr-2" />
                </button>
                {isFilterDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-40">
                    <div className="p-2 max-h-64 overflow-y-auto">
                      {categories.map((category) => (
                        <button
                          key={category.id}
                          onClick={() => handleCategoryFilterClick(category.id)}
                          className="w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-md transition-colors duration-200"
                        >
                          {category.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sort Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                  className="flex items-center justify-center px-6 py-3 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-300"
                >
                  <SlidersHorizontal className="w-5 h-5 ml-2" />
                  <span>مرتب‌سازی</span>
                  <ChevronDown className="w-4 h-4 mr-2" />
                </button>
                {isSortDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-40">
                    <div className="p-2">
                      <button onClick={() => { setSortBy('newest'); setIsSortDropdownOpen(false); }} className="w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-md transition-colors duration-200">جدیدترین</button>
                      <button onClick={() => { setSortBy('price-asc'); setIsSortDropdownOpen(false); }} className="w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-md transition-colors duration-200">ارزان‌ترین</button>
                      <button onClick={() => { setSortBy('price-desc'); setIsSortDropdownOpen(false); }} className="w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-md transition-colors duration-200">گران‌ترین</button>
                      <button onClick={() => { setSortBy('rating-desc'); setIsSortDropdownOpen(false); }} className="w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-md transition-colors duration-200">پربازدیدترین</button>
                    </div>
                  </div>
                )}
              </div>

              {/* Clear Filters Button */}
              {(activeFilter.value || searchTerm || sortBy !== 'newest') && (
                <button
                  onClick={clearAllFilters}
                  className="flex items-center justify-center px-4 py-3 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-all duration-300"
                >
                  <X className="w-5 h-5 ml-2" />
                  <span>پاک کردن</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Special Categories */}
      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <button
              onClick={() => handleSpecialFilterClick('bestsellers')}
              className={`p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 flex items-center justify-between text-right ${
                activeFilter.value === 'bestsellers' ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white' : 'bg-white'
              }`}
            >
              <div>
                <h3 className="text-xl font-bold mb-2">پرفروش‌ترین‌ها</h3>
                <p className={`text-sm ${activeFilter.value === 'bestsellers' ? 'text-yellow-100' : 'text-gray-600'}`}>محصولاتی که توسط مشتریان ما بیشترین امتیاز را دریافت کرده‌اند</p>
              </div>
              <TrendingUp className="w-8 h-8" />
            </button>

            <button
              onClick={() => handleSpecialFilterClick('discounted')}
              className={`p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 flex items-center justify-between text-right ${
                activeFilter.value === 'discounted' ? 'bg-gradient-to-r from-green-400 to-teal-500 text-white' : 'bg-white'
              }`}
            >
              <div>
                <h3 className="text-xl font-bold mb-2">تخفیف‌های ویژه</h3>
                <p className={`text-sm ${activeFilter.value === 'discounted' ? 'text-green-100' : 'text-gray-600'}`}>پیشنهادهای شگفت‌انگیز و محدود زمانی برای محصولات منتخب</p>
              </div>
              <Sparkles className="w-8 h-8" />
            </button>

            <button
              onClick={() => handleSpecialFilterClick('topRated')}
              className={`p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 flex items-center justify-between text-right ${
                activeFilter.value === 'topRated' ? 'bg-gradient-to-r from-purple-400 to-indigo-500 text-white' : 'bg-white'
              }`}
            >
              <div>
                <h3 className="text-xl font-bold mb-2">بالاترین امتیاز</h3>
                <p className={`text-sm ${activeFilter.value === 'topRated' ? 'text-purple-100' : 'text-gray-600'}`}>محصولاتی که بالاترین امتیاز را از سوی کاربران دریافت کرده‌اند</p>
              </div>
              <Star className="w-8 h-8" />
            </button>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="pb-16 lg:pb-24">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold ">همه محصولات</h2>
            <p className="text-gray-600">{filteredAndSortedProducts.length} محصول یافت شد</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredAndSortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {filteredAndSortedProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-xl text-gray-500">محصولی با مشخصات درخواستی شما یافت نشد.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}