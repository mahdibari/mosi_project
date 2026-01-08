'use client';
//app/
import { Suspense } from 'react';
import LoginForm from '@/components/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] px-4">
      {/* این Suspense باعث می‌شود Next.js در زمان Build ارور ندهد */}
      <Suspense fallback={
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-bold">در حال بارگذاری...</p>
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  );
}