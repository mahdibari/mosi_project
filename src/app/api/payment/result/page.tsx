// File: app/payment/result/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function PaymentResultPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { clearCart } = useCart();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyPayment = async () => {
      const trans_id = searchParams.get('trans_id');
      const id_get = searchParams.get('id_get');

      if (!trans_id || !id_get) {
        setStatus('error');
        setMessage('اطلاعات بازگشتی نامعتبر است.');
        return;
      }

      try {
        // فراخوانی API برای تایید پرداخت
        const res = await fetch('/api/payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'verify',
            trans_id,
            id_get,
          }),
        });

        const data = await res.json();

        if (data.success) {
          setStatus('success');
          setMessage('سفارش شما با موفقیت ثبت شد!');
          // خالی کردن سبد خرید فقط در صورت موفقیت
          clearCart();
        } else {
          setStatus('error');
          setMessage(data.error || 'پرداخت با موفقیت انجام نشد.');
        }
      } catch (error) {
        setStatus('error');
        setMessage('خطا در برقراری ارتباط با سرور.');
      }
    };

    verifyPayment();
  }, [searchParams, clearCart]);

  return (
    <main className="container mx-auto px-4 py-16 min-h-[60vh] flex flex-col items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-20 h-20 mx-auto mb-6 text-indigo-500 animate-spin" />
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">در حال بررسی پرداخت...</h2>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-24 h-24 mx-auto mb-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">پرداخت موفق!</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">{message}</p>
            <button
              onClick={() => router.push('/')}
              className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full font-bold shadow-lg hover:shadow-xl transition-all"
            >
              بازگشت به صفحه اصلی
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-24 h-24 mx-auto mb-6 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <XCircle className="w-16 h-16 text-red-500" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">پرداخت ناموفق</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">{message}</p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => router.push('/cart')}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full font-bold shadow-lg hover:shadow-xl transition-all"
              >
                تلاش مجدد
              </button>
              <button
                onClick={() => router.push('/')}
                className="w-full py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-full font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
              >
                بازگشت به فروشگاه
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}