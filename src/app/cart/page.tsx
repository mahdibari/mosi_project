// File: app/cart/page.tsx

'use client';

import { useCart } from '@/contexts/CartContext';
import CartItem from '@/components/CartItem';
import Link from 'next/link';
import { ShoppingBag, Truck, Shield, CreditCard, ArrowRight, RefreshCw } from 'lucide-react';
import { formatToToman } from '@/utils/formatPrice';

export default function CartPage() {
  const { cartItems, cartTotal, isLoading, clearCart } = useCart();

  if (isLoading) {
    return (
      <main className="container mx-auto px-4 py-8 min-h-[60vh] flex justify-center items-center">
        <div className="flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 animate-pulse">در حال بارگذاری سبد خرید...</p>
        </div>
      </main>
    );
  }

  if (cartItems.length === 0) {
    return (
      <main className="container mx-auto px-4 py-8 min-h-[60vh] flex flex-col items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12 max-w-md w-full text-center">
          <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center">
            <ShoppingBag className="w-16 h-16 text-indigo-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">سبد خرید شما خالی است!</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">به نظر می‌رسد هنوز محصولی به سبد خود اضافه نکرده‌اید.</p>
          <Link
            href="/products"
            className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-medium"
          >
            مشاهده محصولات
            <ArrowRight className="w-5 h-5 mr-2" />
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8 min-h-[60vh]">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">سبد خرید شما</h1>
        <p className="text-gray-600 dark:text-gray-400">{cartItems.length} محصول در سبد خرید شما وجود دارد</p>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">محصولات</h2>
              <button
                onClick={clearCart}
                className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors flex items-center gap-1 text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                خالی کردن سبد
              </button>
            </div>
            
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {cartItems.map((item) => {
                // تبدیل آیتم به نوع مورد نظر برای رفع مشکل TypeScript
                const formattedItem = {
                  id: item.id,
                  product_id: item.product_id,
                  quantity: item.quantity,
                  product: {
                    id: item.product.id,
                    name: item.product.name,
                    price: item.product.price,
                    discount_percentage: item.product.discount_percentage,
                    image_url: item.product.image_url,
                    stock_quantity: item.product.stock_quantity,
                  }
                };
                
                return <CartItem key={item.id} item={formattedItem} />;
              })}
            </div>
          </div>
          
          <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">چرا از فروشگاه ما خرید کنید؟</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col items-center text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <Truck className="w-10 h-10 text-indigo-500 mb-2" />
                <h4 className="font-medium text-gray-800 dark:text-gray-100">ارسال سریع</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">تحویل در کوتاهترین زمان ممکن</p>
              </div>
              <div className="flex flex-col items-center text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <Shield className="w-10 h-10 text-indigo-500 mb-2" />
                <h4 className="font-medium text-gray-800 dark:text-gray-100">ضمانت اصالت</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">همه محصولات اصل و باکیفیت</p>
              </div>
              <div className="flex flex-col items-center text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <CreditCard className="w-10 h-10 text-indigo-500 mb-2" />
                <h4 className="font-medium text-gray-800 dark:text-gray-100">پرداخت امن</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">پرداخت آنلاین امن و مطمئن</p>
              </div>
            </div>
          </div>
        </section>
        
        <aside className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden sticky top-24">
            <div className="p-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
              <h2 className="text-xl font-semibold mb-2">خلاصه سفارش</h2>
              <p className="text-indigo-100 text-sm">مبلغ نهایی سفارش شما</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between text-gray-600 dark:text-gray-300">
                  <span>جمع کل محصولات:</span>
                  <span>{formatToToman(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-300">
                  <span className="flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    هزینه ارسال:
                  </span>
                  <span className="text-green-600 dark:text-green-400 font-semibold">رایگان</span>
                </div>
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between text-xl font-bold text-gray-800 dark:text-gray-100">
                    <span>مبلغ نهایی:</span>
                    <span>{formatToToman(cartTotal)}</span>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 space-y-3">
                <Link
                  href="/checkout"
                  className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-md font-medium"
                >
                  ادامه فرآیند خرید
                  <ArrowRight className="w-5 h-5" />
                </Link>
                
                <Link
                  href="/products"
                  className="w-full flex items-center justify-center gap-2 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                >
                  ادامه خرید
                </Link>
              </div>
              
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-green-800 dark:text-green-200">خرید امن</h4>
                      <p className="text-sm text-green-700 dark:text-green-300 mt-1">اطلاعات شما نزد ما محفوظ می‌ماند</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}