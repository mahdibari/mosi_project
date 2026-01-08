'use client';
//app/payment-result/page.tsx
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Home } from 'lucide-react';
import { Suspense } from 'react';

// ۱. محتوای اصلی صفحه که از پارامترها استفاده می‌کند
function PaymentResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const status = searchParams.get('status');
  const ref = searchParams.get('ref');
  const isSuccess = status === 'success';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-10 max-w-lg w-full text-center border border-gray-100 dark:border-gray-700">
      {isSuccess ? (
        <>
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">پرداخت موفقیت‌آمیز بود!</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            سفارش شما با شماره پیگیری <span className="font-mono font-bold text-indigo-600">{ref || '---'}</span> ثبت شد.
          </p>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-green-800 dark:text-green-200 text-sm mb-8">
             وضعیت سیستم: <span className="font-bold">SUCCESS</span>
          </div>
        </>
      ) : (
        <>
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-12 h-12 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">پرداخت انجام نشد</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            مشکلی در فرآیند پرداخت پیش آمد یا تراکنش توسط شما لغو شد.
          </p>
        </>
      )}

      <button 
        onClick={() => router.push('/')}
        className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg"
      >
        <Home size={20} />
        بازگشت به خانه
      </button>
    </div>
  );
}

// ۲. بخش اصلی صفحه که محتوا را در Suspense قرار می‌دهد (برای رفع ارور ورسل)
export default function PaymentResultPage() {
  return (
    <main className="container mx-auto px-4 py-20 min-h-[60vh] flex items-center justify-center">
      <Suspense fallback={
        <div className="text-center p-10 bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-500">در حال بارگذاری نتیجه پرداخت...</p>
        </div>
      }>
        <PaymentResultContent />
      </Suspense>
    </main>
  );
}