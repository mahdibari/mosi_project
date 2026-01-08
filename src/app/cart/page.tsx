'use client';

import { useCart } from '@/contexts/CartContext';
import CartItem from '@/components/CartItem';
import Link from 'next/link';
import { 
  ShoppingBag, 
  Truck, 
  ArrowRight, 
  ShieldCheck, 
  Headphones, 
  CreditCard, 
  TicketPercent 
} from 'lucide-react';
import { formatToToman } from '@/utils/formatPrice';

export default function CartPage() {
  const { cartItems, cartTotal, isLoading } = useCart();

  // 1. حالت لودینگ با اسکلت (Skeleton Loading)
  if (isLoading) {
    return (
      <main className="container mx-auto px-4 py-12 max-w-6xl min-h-screen">
        <div className="h-10 w-64 bg-gray-200 rounded-xl animate-pulse mb-8"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="w-full h-40 bg-gray-100 rounded-3xl animate-pulse border border-gray-200"></div>
            ))}
          </div>
          <div className="hidden lg:block h-96 bg-gray-100 rounded-3xl animate-pulse"></div>
        </div>
      </main>
    );
  }

  // 2. حالت سبد خالی (Empty State) جذاب
  if (cartItems.length === 0) {
    return (
      <main className="container mx-auto px-4 py-20 max-w-2xl min-h-screen text-center">
        <div className="bg-white dark:bg-gray-800 rounded-[3rem] p-12 shadow-2xl border border-gray-100 dark:border-gray-700 relative overflow-hidden">
          {/* پس‌زمینه تزئینی */}
          <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-indigo-50 to-transparent dark:from-indigo-900/20 -z-10 rounded-t-[3rem]"></div>
          
          <div className="w-24 h-24 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <ShoppingBag size={40} />
          </div>
          
          <h2 className="text-3xl font-black text-gray-800 dark:text-white mb-3">سبد خرید خالی است</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8 text-lg">
            هنوز محصولی انتخاب نکرده‌اید. بیایید خرید جذابی انجام دهیم!
          </p>
          
          <Link 
            href="/products" 
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-bold transition-all hover:scale-105 shadow-lg shadow-indigo-200 dark:shadow-none"
          >
            مشاهده محصولات
            <ArrowRight size={20} />
          </Link>
        </div>
      </main>
    );
  }

  // 3. حالت اصلی (سبد خرید)
  return (
    <main className="container mx-auto px-4 py-8 max-w-7xl min-h-screen">
      {/* هدر صفحه */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
            <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 p-2 rounded-2xl">
              <ShoppingBag size={28} />
            </span>
            سبد خرید شما
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 mr-12">
            {cartItems.length} آیتم در سبد دارید
          </p>
        </div>
        
        {/* لینک ادامه خرید کوچک */}
        <Link href="/products" className="hidden md:flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors bg-indigo-50 dark:bg-indigo-900/20 px-4 py-2 rounded-xl">
          <ArrowRight size={16} className="rotate-180" />
          بازگشت به فروشگاه
        </Link>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* لیست محصولات */}
        <div className="lg:col-span-8 space-y-6">
          {cartItems.map((item, index) => (
            <div key={item.id} className="animate-in slide-in-from-bottom duration-500" style={{ animationDelay: `${index * 100}ms` }}>
              <CartItem item={item} />
            </div>
          ))}
        </div>

        {/* سایدبار خلاصه سفارش (Sticky) */}
        <aside className="lg:col-span-4">
          <div className="sticky top-8 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">جزئیات صورتحساب</h2>
              <CreditCard className="text-gray-400 w-5 h-5" />
            </div>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center text-gray-600 dark:text-gray-300">
                <span>مجموع کل اقلام</span>
                <span className="font-medium">{formatToToman(cartTotal)}</span>
              </div>
              
              

              {/* فیلد کوپن (صوری) برای زیبایی */}
              <div className="flex gap-2 pt-2">
                <div className="relative flex-1">
                  <TicketPercent className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input 
                    type="text" 
                    placeholder="کد تخفیف دارید؟" 
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    disabled // غیرفعال برای نمونه
                  />
                </div>
                <button 
                  className="px-4 py-3 bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-300 rounded-xl font-bold text-sm transition-colors hover:bg-gray-300"
                  disabled
                >
                  ثبت
                </button>
              </div>
            </div>

            {/* خط جداکننده گرافیکی */}
            <div className="h-px w-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 my-6"></div>

            <div className="flex justify-between items-end mb-8">
              <span className="font-bold text-gray-700 dark:text-gray-300 text-sm">مبلغ قابل پرداخت</span>
              <div className="text-right">
                <span className="block text-3xl font-black text-indigo-600 dark:text-indigo-400 leading-none">
                  {formatToToman(cartTotal)}
                </span>
                <span className="text-xs text-gray-400 font-medium mt-1 block">تومان</span>
              </div>
            </div>

            {/* دکمه پرداخت جذاب */}
            <Link href="/checkout" className="group w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-indigo-600 to-purple-700 text-white rounded-2xl font-black text-lg shadow-lg shadow-indigo-500/30 transition-all hover:scale-[1.02] hover:shadow-indigo-500/50 active:scale-95 relative overflow-hidden">
              <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></div>
              <span>تکمیل خرید و پرداخت</span>
              <ArrowRight size={20} className="group-hover:-translate-x-1 transition-transform" />
            </Link>

            {/* نشان‌های اعتماد (Trust Badges) */}
            <div className="mt-8 grid grid-cols-3 gap-2 pt-6 border-t border-gray-100 dark:border-gray-700">
              <div className="flex flex-col items-center gap-1 text-center">
                <ShieldCheck className="w-5 h-5 text-green-600" />
                <span className="text-[10px] font-bold text-gray-500">پرداخت امن</span>
              </div>
              <div className="flex flex-col items-center gap-1 text-center">
                <Headphones className="w-5 h-5 text-blue-600" />
                <span className="text-[10px] font-bold text-gray-500">پشتیبانی ۲۴/۷</span>
              </div>
              <div className="flex flex-col items-center gap-1 text-center">
                <Truck className="w-5 h-5 text-orange-600" />
                <span className="text-[10px] font-bold text-gray-500">ارسال پستی </span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}