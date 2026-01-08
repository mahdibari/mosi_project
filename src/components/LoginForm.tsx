'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import { LogIn, Phone, Lock, ArrowLeft } from 'lucide-react';

const toEnglishDigits = (str: string) => {
  return str.replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString())
            .replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());
};

export default function LoginForm() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const engPhone = toEnglishDigits(phone);
      const generatedEmail = `${engPhone}@temp.domain`;

      // ورود با استفاده از ایمیل ساخته شده از شماره موبایل
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: generatedEmail,
        password,
      });

      if (loginError) {
        if (loginError.status === 400) throw new Error('شماره یا رمز عبور اشتباه است.');
        throw loginError;
      }

      router.push(returnUrl);
      router.refresh();
   
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-blue-100 border border-gray-50 animate-in fade-in zoom-in duration-500">
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 -rotate-3 shadow-lg shadow-blue-200">
          <LogIn size={32} />
        </div>
        <h2 className="text-3xl font-black text-gray-800">ورود به حساب</h2>
        <p className="text-gray-400 mt-2 text-sm">لطفاً شماره موبایل و رمز خود را وارد کنید</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-6">
        <div className="relative group">
          <input
            type="tel" placeholder="شماره موبایل" value={phone} 
            onChange={(e) => setPhone(e.target.value)} required
            className="w-full pr-12 pl-4 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 border-none transition-all text-left font-bold"
          />
          <Phone className="absolute right-4 top-4 text-gray-300 group-focus-within:text-blue-500" size={20} />
        </div>

        <div className="relative group">
          <input
            type="password" placeholder="رمز عبور" value={password} 
            onChange={(e) => setPassword(e.target.value)} required
            className="w-full pr-12 pl-4 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 border-none transition-all"
          />
          <Lock className="absolute right-4 top-4 text-gray-300 group-focus-within:text-blue-500" size={20} />
        </div>

        {error && (
          <div className="text-red-500 text-xs bg-red-50 p-4 rounded-xl border-r-4 border-red-500 font-bold">
            {error}
          </div>
        )}

        <button
          disabled={loading}
          className="w-full py-5 bg-blue-600 text-white rounded-[1.8rem] font-black text-lg hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:bg-gray-300"
        >
          {loading ? 'در حال ورود...' : 'ورود امن'}
          <ArrowLeft size={20} />
        </button>
      </form>
    </div>
  );
}