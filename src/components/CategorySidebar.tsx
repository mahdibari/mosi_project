'use client';

import { Dispatch, SetStateAction } from 'react';
import { Category, Brands } from '@/types';

// تعریف تایپ فیلتر دقیقاً مطابق با صفحه اصلی
type FilterState = { type: 'category' | 'brand' | 'special'; value: string | null };

interface CategorySidebarProps {
  categories: Category[];
  brands: Brands[];
  activeFilter: FilterState;
  onFilterChange: Dispatch<SetStateAction<FilterState>>;
}

export default function CategorySidebar({ 
  categories, 
  brands, 
  activeFilter, 
  onFilterChange 
}: CategorySidebarProps) {
  
  const handleFilter = (type: 'category' | 'brand' | 'special', value: string | null) => {
    onFilterChange({ type, value });
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-6 shadow-sm border border-gray-100 dark:border-gray-800 sticky top-4">
      <h3 className="text-lg font-black mb-6 flex items-center gap-2 dark:text-white">
        <span className="w-1.5 h-6 bg-indigo-600 rounded-full"></span>
        دسته‌بندی‌ها
      </h3>
      
      <div className="space-y-2 mb-8">
        <button 
          onClick={() => handleFilter('special', null)}
          className={`w-full text-right px-4 py-3 rounded-xl transition-all ${activeFilter.type === 'special' ? 'bg-indigo-600 text-white shadow-lg' : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'}`}
        >
          همه محصولات
        </button>
        {categories.map((cat) => (
          <button 
            key={cat.id}
            onClick={() => handleFilter('category', cat.id)}
            className={`w-full text-right px-4 py-3 rounded-xl transition-all ${activeFilter.type === 'category' && activeFilter.value === cat.id ? 'bg-indigo-600 text-white' : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'}`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <h3 className="text-lg font-black mb-6 flex items-center gap-2 dark:text-white border-t border-gray-100 dark:border-gray-800 pt-6">
        <span className="w-1.5 h-6 bg-pink-500 rounded-full"></span>
        برندها
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {brands.map((brand) => (
          <button 
            key={brand.id}
            onClick={() => handleFilter('brand', brand.id)}
            className={`text-center py-2 px-1 rounded-lg text-xs border transition-all ${activeFilter.type === 'brand' && activeFilter.value === brand.id ? 'bg-pink-500 border-pink-500 text-white' : 'border-gray-100 dark:border-gray-800 text-gray-500 hover:border-pink-200'}`}
          >
            {brand.name}
          </button>
        ))}
      </div>
    </div>
  );
}