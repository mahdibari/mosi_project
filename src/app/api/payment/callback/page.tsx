'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext'; // برای خالی کردن سبد

export default function PaymentCallbackPage() {
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
        setMessage('اطلاعات بازگشتی از بانک نامعتبر است.');
        return;
      }

      try {
        // ارسال به API سرور برای تایید نهایی
        const response = await fetch('/api/payment/verify-bitpay', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ trans_id, id_get }),
        });

        const result = await response.json();

        if (result.success) {
          setStatus('success');
          clearCart(); // خالی کردن سبد خرید بعد از پرداخت موفق
          
          // بعد از 3 ثانیه ریدایرکت به صفحه سفارشات یا موفقیت
          setTimeout(() => {
            router.push('/order-success');
          }, 3000);
        } else {
          setStatus('error');
          setMessage(result.message || 'پرداخت ناموفق بود.');
        }
      } catch (error) {
        console.error(error);
        setStatus('error');
        setMessage('خطا در ارتباط با سرور.');
      }
    };

    verifyPayment();
  }, [searchParams, router, clearCart]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg text-center max-w-md w-full">
        {status === 'loading' && (
          <div>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">در حال بررسی وضعیت پرداخت...</p>
          </div>
        )}

        {status === 'success' && (
          <div>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">پرداخت موفق!</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">سفارش شما با موفقیت ثبت شد. به زودی به صفحه سفارشات هدایت می‌شوید.</p>
          </div>
        )}

        {status === 'error' && (
          <div>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">پرداخت ناموفق</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{message}</p>
            <button 
              onClick={() => router.push('/cart')}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              بازگشت به سبد خرید
            </button>
          </div>
        )}
      </div>
    </div>
  );
}