// app/payment/callback/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react'; // <-- ۱. Suspense را ایمپورت کن

// کامپوننتی که حاوی منطق اصلی و useSearchParams است
function CallbackRedirectPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // تمام پارامترهای کوئری (مثل trans_id و id_get) را دریافت کن
    const queryString = searchParams.toString();
    
    // کاربر را به آدرس صحیح API با همان پارامترها هدایت کن
    if (queryString) {
      router.replace(`/api/payment/callback?${queryString}`);
    } else {
      router.replace('/api/payment/callback');
    }
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <p className="mt-2 text-gray-500">در حال پردازش پرداخت...</p>
      </div>
    </div>
  );
}

// <-- ۲. کامپوننت اصلی را در Suspense بپیچید و اکسپورت کنید
export default function CallbackRedirectPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-500">در حال پردازش پرداخت...</p>
          </div>
        </div>
      }
    >
      <CallbackRedirectPageContent />
    </Suspense>
  );
}