import { Suspense } from 'react';
import SignupForm from '@/components/SignupForm';

export default function SignupPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
      <Suspense fallback={<div className="animate-pulse font-bold text-gray-400">Loading...</div>}>
        <SignupForm />
      </Suspense>
    </main>
  );
}