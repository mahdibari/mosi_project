'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShoppingCart, 
  Menu, 
  X, 
  Truck, 
  Instagram, 
  MessageCircle, 
  Bell // ۱. ایمپورت آیکون زنگ
} from 'lucide-react';
import UserMenu from './UserMenu';
import { useCart } from '@/contexts/CartContext';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false); // ۲. استیت برای باز و بسته شدن نوتیف
  const { cartCount } = useCart(); 

  const socialLinks = {
    instagram: "https://instagram.com/your-id",
    whatsapp: "https://wa.me/989123456789"
  };

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen, isNotificationOpen]); // جلوگیری از اسکرول هنگام باز بودن مودال

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-sm z-[100] transition-all duration-300 border-b border-gray-100 dark:border-gray-700">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            
            {/* بخش راست: لوگو و شبکه‌های اجتماعی */}
            <div className="flex items-center gap-6">
              <Link href="/" className="flex-shrink-0">
                <span className="text-2xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent hover:scale-105 transition-transform inline-block">
                  مصی شاپ 
                </span>
              </Link>

              <div className="hidden lg:flex items-center gap-3 border-r pr-6 border-gray-200 dark:border-gray-700">
                <a href={socialLinks.instagram} target="_blank" className="text-pink-600 hover:scale-110 transition-transform">
                  <Instagram size={20} />
                </a>
                <a href={socialLinks.whatsapp} target="_blank" className="text-green-600 hover:scale-110 transition-transform">
                  <MessageCircle size={20} />
                </a>
              </div>
            </div>

            {/* منوی ناوبری */}
            <nav className="hidden md:flex items-center gap-8 font-bold text-sm">
              <Link href="/" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 transition-colors">خانه</Link>
              <Link href="/products" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 transition-colors">محصولات</Link>
              <Link href="/about" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 transition-colors">درباره ما</Link>
              <Link href="/contact" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 transition-colors">تماس با ما</Link>
            </nav>

            {/* بخش چپ: دکمه‌ها */}
            <div className="flex items-center gap-2 sm:gap-4">
              
              <Link 
                href="/track-order" 
                className="hidden sm:flex items-center gap-2 bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 px-4 py-2.5 rounded-2xl hover:bg-indigo-50 hover:text-indigo-600 transition-all text-xs font-black border border-gray-100 dark:border-gray-700"
              >
                <Truck size={16} />
                <span>پیگیری سفارش</span>
              </Link>

              {/* ۳. آیکون زنگ توجه (جدید) */}


              {/* آیکون سبد خرید */}
             <Link href="/cart" className="relative p-2.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-2xl group transition-all hover:bg-indigo-600 hover:text-white">
                <ShoppingCart className="w-5 h-5" />
                
                {/* شمارنده آیتم‌ها */}
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white group-hover:border-indigo-600 transition-colors">
                    {cartCount}
                  </span>
                )}
              </Link>


              <div className="hidden md:block">
                <UserMenu />
              </div>

              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden p-2.5 rounded-2xl bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="h-20"></div>

      {/* ۴. مودال نوتیفیکیشن (پاپ آپ وسط صفحه) */}
      {isNotificationOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
          {/* پس‌زمینه تیره */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsNotificationOpen(false)}
          ></div>
          
          {/* کارت پیام */}
          <div className="relative bg-white dark:bg-gray-900 rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl animate-[pop_0.3s_ease-out] border border-gray-100 dark:border-gray-800">
            <button 
              onClick={() => setIsNotificationOpen(false)}
              className="absolute top-4 left-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/50 text-amber-600 rounded-full flex items-center justify-center mb-6">
                <Bell size={32} />
              </div>
              
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-3">اطلاعیه مهم</h2>
              
              
              
              <button 
                onClick={() => setIsNotificationOpen(false)}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-lg transition-all active:scale-95 shadow-lg shadow-indigo-200 dark:shadow-none"
              >
                متوجه شدم
              </button>
            </div>
          </div>
        </div>
      )}

      {/* منوی موبایل */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[110] md:hidden">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="fixed top-0 right-0 h-full w-80 bg-white dark:bg-gray-900 shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-6 border-b dark:border-gray-800">
                <span className="text-xl font-black text-indigo-600">فهرست</span>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-gray-50 rounded-xl">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <nav className="flex-1 px-6 py-8 space-y-4">
                <Link href="/track-order" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 p-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100">
                  <Truck size={20} /> پیگیری سفارشات
                </Link>

                <div className="space-y-1">
                   <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="block p-4 font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 rounded-xl">خانه</Link>
                   <Link href="/products" onClick={() => setIsMobileMenuOpen(false)} className="block p-4 font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 rounded-xl">محصولات</Link>
                   <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)} className="block p-4 font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 rounded-xl">تماس با ما</Link>
                    <Link href="/about" onClick={() => setIsMobileMenuOpen(false)} className="block p-4 font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 rounded-xl">درباره ما</Link>
                </div>

                <div className="pt-6 flex gap-4 border-t dark:border-gray-800">
                  <a href={socialLinks.instagram} className="flex-1 flex items-center justify-center gap-2 py-3 bg-pink-50 text-pink-600 rounded-xl font-bold">
                    <Instagram size={18} /> اینستاگرام
                  </a>
                  <a href={socialLinks.whatsapp} className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-50 text-green-600 rounded-xl font-bold">
                    <MessageCircle size={18} /> واتساپ
                  </a>
                </div>
              </nav>

              <div className="p-6 bg-gray-50 dark:bg-gray-800/50 border-t dark:border-gray-800">
                <UserMenu />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}