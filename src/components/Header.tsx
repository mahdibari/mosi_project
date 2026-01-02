'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCart, Menu, X, HelpCircle, Truck } from 'lucide-react';
import UserMenu from './UserMenu';
import { useCart } from '@/contexts/CartContext';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { cartCount } = useCart(); 

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-40 transition-colors duration-300">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* بخش لوگو */}
            <Link href="/" className="flex-shrink-0">
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent transition-all duration-300 hover:from-indigo-700 hover:to-purple-700">
                مصی شاپ 
              </span>
            </Link>

            {/* منوی ناوبری دسکتاپ */}
            <nav className="hidden md:flex items-center space-x-8 space-x-reverse">
              <Link href="/" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 font-medium transition-colors">خانه</Link>
              <Link href="/products" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 font-medium transition-colors">محصولات</Link>
              <Link href="/about" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 font-medium transition-colors">درباره ما</Link>
              <Link href="/contact" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 font-medium transition-colors">تماس با ما</Link>
            </nav>

            {/* بخش سمت چپ هدر (دکمه‌ها) */}
            <div className="flex items-center gap-2 sm:gap-4">
              
              {/* دکمه پیگیری سفارش - نسخه دسکتاپ */}
              <Link 
                href="/track-order" 
                className="hidden sm:flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 px-3 py-2 rounded-xl hover:bg-indigo-100 transition-all text-sm font-bold border border-indigo-100 dark:border-indigo-800"
              >
                <Truck size={18} />
                <span>پیگیری سفارش</span>
              </Link>

              {/* آیکون تیکت/پشتیبانی */}
              <Link href="/tickets" className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                <HelpCircle className="w-6 h-6" />
              </Link>

              {/* سبد خرید */}
             <Link href="/cart" className="relative p-2 text-gray-600 hover:text-indigo-600 transition-colors group">
  <ShoppingCart className="w-6 h-6" />
  {cartCount > 0 && (
    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white animate-in zoom-in duration-300 shadow-sm">
      {cartCount}
    </span>
  )}
</Link>

              {/* پروفایل کاربر */}
              <div className="hidden md:block">
                <UserMenu />
              </div>

              {/* دکمه منوی موبایل */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden p-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* منوی کشویی موبایل */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="fixed top-0 right-0 h-full w-72 bg-white dark:bg-gray-800 shadow-2xl transform transition-transform duration-300">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-5 border-b dark:border-gray-700">
                <span className="text-xl font-bold text-indigo-600">منوی اصلی</span>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <nav className="flex-1 px-4 py-6 space-y-2">
                {/* دکمه پیگیری سفارش در موبایل (بسیار مهم) */}
                <Link 
                  href="/track-order" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 p-4 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-200 mb-6 font-bold"
                >
                  <Truck size={22} />
                  <span>پیگیری سفارشات</span>
                </Link>

                <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="block p-4 text-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors">خانه</Link>
                <Link href="/products" onClick={() => setIsMobileMenuOpen(false)} className="block p-4 text-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors">محصولات</Link>
                <Link href="/about" onClick={() => setIsMobileMenuOpen(false)} className="block p-4 text-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors">درباره ما</Link>
                <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)} className="block p-4 text-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors">تماس با ما</Link>
              </nav>

              <div className="p-6 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <UserMenu />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}