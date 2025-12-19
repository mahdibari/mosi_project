// File: components/CategorySidebar.tsx

'use client';

import { Trophy, Flame, Star, Grid3x3, Tag } from 'lucide-react';
import { Category, Brands } from '@/types';

interface CategorySidebarProps {
  categories: Category[];
  brands: Brands[];
  activeFilter: { type: 'category' | 'brand' | 'special'; value: string | null };
  setActiveFilter: (filter: { type: 'category' | 'brand' | 'special'; value: string | null }) => void;
}

export default function CategorySidebar({ categories, brands, activeFilter, setActiveFilter }: CategorySidebarProps) {
  const specialFilters = [
    { key: 'bestsellers', label: 'محصولات پرفروش', icon: <Trophy className="w-5 h-5" /> },
    { key: 'discounted', label: 'محصولات با تخفیف', icon: <Flame className="w-5 h-5" /> },
    { key: 'topRated', label: 'محصولات با امتیاز بالا', icon: <Star className="w-5 h-5" /> },
  ];

  const handleFilterClick = (type: 'category' | 'brand' | 'special', value: string | null) => {
    if (activeFilter.type === type && activeFilter.value === value) {
      setActiveFilter({ type: 'special', value: null });
    } else {
      setActiveFilter({ type, value });
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg h-fit sticky top-6 border border-gray-100">
      <h2 className="text-xl font-bold mb-6 text-gray-800 border-b pb-3">فیلترها</h2>
      
      {/* فیلترهای ویژه با انیمیشن */}
      <div className="space-y-2 mb-8">
        {specialFilters.map((filter) => (
          <button
            key={filter.key}
            onClick={() => handleFilterClick('special', filter.key)}
            className={`w-full text-right px-4 py-3 rounded-xl flex items-center justify-end gap-3 font-medium transition-all duration-300 transform hover:scale-105 ${
              activeFilter.type === 'special' && activeFilter.value === filter.key
                ? 'bg-gradient-to-l from-indigo-500 to-purple-600 text-white shadow-lg scale-105'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {filter.label}
            <span className={`transition-transform duration-300 ${activeFilter.type === 'special' && activeFilter.value === filter.key ? 'text-white' : 'text-indigo-500'}`}>
              {filter.icon}
            </span>
          </button>
        ))}
      </div>

      {/* لیست دسته‌بندی‌ها با انیمیشن */}
      <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
        <Grid3x3 className="w-5 h-5 text-gray-500" />
        دسته‌بندی‌ها
      </h3>
      <ul className="space-y-2 mb-8">
        <li>
          <button
            onClick={() => handleFilterClick('special', null)}
            className={`w-full text-right px-4 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
              !activeFilter.value
                ? 'bg-gradient-to-l from-green-500 to-teal-600 text-white shadow-lg scale-105'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            همه محصولات
          </button>
        </li>
        {categories.map((category) => (
          <li key={category.id}>
            <button
              onClick={() => handleFilterClick('category', category.id)}
              className={`w-full text-right px-4 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
                activeFilter.type === 'category' && activeFilter.value === category.id
                  ? 'bg-gradient-to-l from-indigo-500 to-purple-600 text-white shadow-lg scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.name}
            </button>
          </li>
        ))}
      </ul>

      {/* لیست برندها با انیمیشن */}
      <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
        <Tag className="w-5 h-5 text-gray-500" />
        برندها
      </h3>
      <ul className="space-y-2">
        {brands.map((brand) => (
          <li key={brand.id}>
            <button
              onClick={() => handleFilterClick('brand', brand.id)}
              className={`w-full text-right px-4 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
                activeFilter.type === 'brand' && activeFilter.value === brand.id
                  ? 'bg-gradient-to-l from-indigo-500 to-purple-600 text-white shadow-lg scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {brand.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}