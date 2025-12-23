'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // ابتدا کاربر را بر اساس شماره تلفن پیدا می‌کنیم
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('email')
        .eq('phone', phone)
        .single();

      if (userError || !userData) {
        setError('کاربری با این شماره تلفن یافت نشد');
        return;
      }

      // سپس با ایمیل موقت کاربر وارد می‌شویم
      const { error } = await supabase.auth.signInWithPassword({
        email: userData.email || `${phone}@temp.domain`,
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      setError('خطایی در ورود رخ داد. لطفاً دوباره تلاش کنید.');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">ورود به حساب</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleLogin}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">شماره تلفن</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-4 py-2 border rounded-md"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">رمز عبور</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-md"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
        >
          ورود
        </button>
      </form>
      <p className="mt-4 text-center">
        حساب ندارید؟{' '}
        <a href="/auth/signup" className="text-blue-500 hover:underline">
          ثبت‌نام کنید
        </a>
      </p>
    </div>
  );
}