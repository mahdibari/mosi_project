// app/payment/success/page.tsx

'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { CheckCircle, XCircle, AlertCircle, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

// کامپوننتی که حاوی منطق اصلی است
function PaymentResultPageContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get('status');

  // --- شروع تغییرات ---
  // به جای useState و useEffect، پیام را مستقیماً محاسبه می‌کنیم
  const getMessage = () => {
    if (status === 'success') {
      return 'خرید شما با موفقیت انجام شد. سفارش شما بزودی توسط ادمین بررسی و ارسال خواهد شد.';
    } else if (status === 'failed') {
      return 'پرداخت شما ناموفق بود. در صورت کسر مبلغ، ظرف ۷۲ ساعت به حساب شما بازگردانده خواهد شد.';
    } else {
      return 'خطایی در فرآیند پرداخت رخ داده است. لطفاً با پشتیبانی تماس بگیرید.';
    }
  };

  const message = getMessage();
  // --- پایان تغییرات ---

  const getIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-16 w-16 text-green-500" />;
      case 'failed':
        return <XCircle className="h-16 w-16 text-red-500" />;
      default:
        return <AlertCircle className="h-16 w-16 text-yellow-500" />;
    }
  };

  const getTitle = () => {
    switch (status) {
      case 'success':
        return 'پرداخت موفقیت‌آمیز';
      case 'failed':
        return 'پرداخت ناموفق';
      default:
        return 'خطا در پرداخت';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <div className="flex justify-center mb-4">
          {getIcon()}
        </div>
        <h1 className="text-2xl font-bold mb-4">{getTitle()}</h1>
        <p className="text-gray-600 mb-6">{message}</p>
        <Link
          href="/"
          className="inline-flex items-center bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
        >
          <ShoppingBag className="ml-2 h-5 w-5" />
          بازگشت به صفحه اصلی
        </Link>
      </div>
    </div>
  );
}

// کامپوننت اصلی صفحه که کامپوننت بالا را در Suspense پیچیده می‌دهد
export default function PaymentResultPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-500">در حال بارگذاری...</p>
          </div>
        </div>
      }
    >
      <PaymentResultPageContent />
    </Suspense>
  );
}