'use client';

import LoginForm from '@/components/LoginForm';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/checkout';

  const handleSuccess = () => {
    router.push(returnUrl);
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            ورود به حساب کاربری
          </h2>
        </div>
        <LoginForm onSuccess={handleSuccess} />
        <div className="text-center">
          <Link href={`/auth/signup?returnUrl=${encodeURIComponent(returnUrl)}`} className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
            حساب کاربری ندارید؟ ثبت نام کنید
          </Link>
        </div>
      </div>
    </div>
  );
}