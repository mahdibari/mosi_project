// File: components/Header.tsx

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCart, Menu, X, HelpCircle } from 'lucide-react';
import UserMenu from './UserMenu';
import { useCart } from '@/contexts/CartContext';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { cartCount } = useCart(); // <-- این بخش به درستی تعداد محصولات را از کانتکست می‌خواند

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
            <Link href="/" className="flex-shrink-0">
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent transition-all duration-300 hover:from-indigo-700 hover:to-purple-700">
               76604216 
              </span>
            </Link>

            <nav className="hidden md:flex space-x-8">
              {['خانه', ' تماس با ما '].map((item) => (
                <Link
                  key={item}
                  href={item === 'خانه' ? '/' : item === 'محصولات' ? '/products' : '/contact' }
                  className="relative text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium group"
                >
                  {item}
                  <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 transition-all duration-300 group-hover:w-full"></span>
                </Link>
              ))}
               <Link href={'/about'} className="relative text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium group">درباره ما <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 transition-all duration-300 group-hover:w-full"></span></Link>
               <Link href={'/products'} className="relative text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium group"> محصولات <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 transition-all duration-300 group-hover:w-full"></span></Link>
            </nav>

            <div className="flex items-center space-x-4">
               <Link href="/tickets" className="relative p-2 group">
                <HelpCircle className="w-6 h-6 text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200" />
              </Link>
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                {/* در اینجا می‌توانید آیکون ماه و خورشید را قرار دهید */}
              </button>

              <Link href="/cart" className="relative p-2 group">
                <ShoppingCart className="w-6 h-6 text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200" />
                {cartCount > 0 && ( // <-- نمایش تعداد محصولات در سبد خرید
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                    {cartCount}
                  </span>
                )}
              </Link>

              <div className="hidden md:block">
                <UserMenu />
              </div>

              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="fixed top-0 right-0 h-full w-64 max-w-xs bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 ease-in-out">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
                <span className="text-lg font-semibold">منو</span>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <nav className="flex-1 px-4 py-6 space-y-4">
                {['خانه', ' تماس با ما '].map((item) => (
                  <Link
                    key={item}
                    href={item === 'خانه' ? '/' : item === 'محصولات' ? '/products' : '/contact'}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-lg font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
                  >
                    {item}
                  </Link>
                ))}
                 <Link href={'/about'} onClick={() => setIsMobileMenuOpen(false)} className="block text-lg font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">درباره ما</Link>
                 <Link href={'/products'} onClick={() => setIsMobileMenuOpen(false)} className="block text-lg font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">محصولات</Link>
              </nav>
              <div className="p-4 border-t dark:border-gray-700">
                <UserMenu />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}