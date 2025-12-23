'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function SignupForm() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // ایجاد کاربر با شماره تلفن به عنوان ایمیل موقت
      const { data: authData, error: signupError } = await supabase.auth.signUp({
        email: `${phone}@temp.domain`, // استفاده از شماره تلفن به عنوان ایمیل موقت
        password,
        options: {
          data: {
            phone: phone,
            first_name: firstName,
            last_name: lastName,
          },
        },
      });

      if (signupError) {
        setError(signupError.message);
        return;
      }

      if (authData.user) {
        // به‌روزرسانی اطلاعات کاربر در جدول users
        const { error: updateError } = await supabase
          .from('users')
          .update({
            phone: phone,
            first_name: firstName,
            last_name: lastName,
          })
          .eq('id', authData.user.id);

        if (updateError) {
          setError(updateError.message);
          return;
        }

        alert('ثبت‌نام با موفقیت انجام شد!');
        router.push('/auth/login');
      }
    } catch (err) {
      setError('خطایی در ثبت‌نام رخ داد. لطفاً دوباره تلاش کنید.');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">ثبت‌نام</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSignup}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">نام</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full px-4 py-2 border rounded-md"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">نام خانوادگی</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full px-4 py-2 border rounded-md"
            required
          />
        </div>
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
          className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600"
        >
          ثبت‌نام
        </button>
      </form>
      <p className="mt-4 text-center">
        حساب دارید؟{' '}
        <a href="/auth/login" className="text-blue-500 hover:underline">
          وارد شوید
        </a>
      </p>
    </div>
  );
}