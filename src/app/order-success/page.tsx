// File: app/order-success/page.tsx

import Link from 'next/link';
import { CheckCircle, ShoppingBag, ArrowRight } from 'lucide-react';

export default function OrderSuccessPage() {
  return (
    <main className="container mx-auto px-4 py-8 min-h-[60vh] flex flex-col items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12 max-w-md w-full text-center">
        <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-full flex items-center justify-center">
          <CheckCircle className="w-16 h-16 text-green-500" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">سفارش شما با موفقیت ثبت شد!</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          از خرید شما متشکریم. سفارش شما در حال پردازش است و به زودی ارسال خواهد شد.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/products"
            className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-medium"
          >
            <ShoppingBag className="w-5 h-5 ml-2" />
            ادامه خرید
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
          >
            بازگشت به صفحه اصلی
            <ArrowRight className="w-5 h-5 mr-2" />
          </Link>
        </div>
      </div>
    </main>
  );
}