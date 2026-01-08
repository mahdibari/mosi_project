'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import { UserPlus, Phone, Lock, User, ArrowLeft, CheckCircle2 } from 'lucide-react';

const toEnglishDigits = (str: string) => {
  return str.replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString())
            .replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());
};

export default function SignupForm() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/';

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const engPhone = toEnglishDigits(phone);
      const generatedEmail = `${engPhone}@temp.domain`;

      // ۱. ثبت‌نام در بخش Auth
      const { data: authData, error: signupError } = await supabase.auth.signUp({
        email: generatedEmail,
        password,
        options: { data: { first_name: firstName, last_name: lastName, phone: engPhone } },
      });

      if (signupError) throw signupError;

      if (authData.user) {
        // ۲. ثبت همزمان در جدول profile (مطابق دیتابیس شما)
        const { error: dbError } = await supabase
          .from('profile')
          .upsert({
            id: authData.user.id,
            phone: engPhone,
            first_name: firstName,
            last_name: lastName,
            email: generatedEmail,
          }, { onConflict: 'phone' });

        if (dbError) throw dbError;

        setSuccess(true);
        setTimeout(() => {
          router.push(returnUrl);
          router.refresh();
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || 'خطایی در ثبت‌نام رخ داد.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center p-10 bg-white rounded-[2rem] shadow-2xl border border-green-100 animate-in zoom-in duration-500">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 size={48} />
        </div>
        <h2 className="text-2xl font-black text-gray-800 mb-2">خوش آمدید!</h2>
        <p className="text-gray-500 text-center">حساب شما با موفقیت ساخته شد. در حال انتقال به صفحه پرداخت...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-indigo-100 border border-gray-50 mt-10">
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 rotate-3 shadow-lg">
          <UserPlus size={32} />
        </div>
        <h2 className="text-3xl font-black text-gray-800">ثبت‌نام سریع</h2>
        <p className="text-gray-400 mt-2 text-sm">لطفاً اطلاعات خود را وارد کنید</p>
      </div>

      <form onSubmit={handleSignup} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="relative group">
            <input
              type="text" placeholder="نام" value={firstName} onChange={(e) => setFirstName(e.target.value)} required
              className="w-full pr-11 pl-4 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 border-none transition-all"
            />
            <User className="absolute right-4 top-4 text-gray-300 group-focus-within:text-indigo-500" size={20} />
          </div>
          <input
            type="text" placeholder="نام خانوادگی" value={lastName} onChange={(e) => setLastName(e.target.value)} required
            className="w-full px-4 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 border-none transition-all"
          />
        </div>

        <div className="relative group">
          <input
            type="tel" placeholder="شماره موبایل (09...)" value={phone} onChange={(e) => setPhone(e.target.value)} required
            className="w-full pr-11 pl-4 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 border-none transition-all text-left"
          />
          <Phone className="absolute right-4 top-4 text-gray-300 group-focus-within:text-indigo-500" size={20} />
        </div>

        <div className="relative group">
          <input
            type="password" placeholder="رمز عبور" value={password} onChange={(e) => setPassword(e.target.value)} required
            className="w-full pr-11 pl-4 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 border-none transition-all"
          />
          <Lock className="absolute right-4 top-4 text-gray-300 group-focus-within:text-indigo-500" size={20} />
        </div>

        {error && <div className="text-red-500 text-xs bg-red-50 p-3 rounded-xl flex items-center gap-2 font-bold italic">{error}</div>}

        <button
          disabled={loading}
          className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black text-lg hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {loading ? 'در حال ثبت نام...' : 'عضویت و ادامه'}
          <ArrowLeft size={20} />
        </button>
      </form>
    </div>
  );
}