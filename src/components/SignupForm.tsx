'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import { User, Phone, Lock, ArrowLeft } from 'lucide-react';

const toEnglishDigits = (str: string) => {
  return str.replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString())
            .replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());
};

export default function SignupForm({ onSuccess }: { onSuccess?: () => void }) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/checkout';

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (!fullName.trim()) {
      setError('لطفاً نام خود را وارد کنید');
      return;
    }
    
    const engPhone = toEnglishDigits(phone);
    const phoneRegex = /^09[0-9]{9}$/;
    if (!phoneRegex.test(engPhone)) {
      setError('شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود');
      return;
    }
    
    if (password.length < 6) {
      setError('رمز عبور باید حداقل ۶ کاراکتر باشد');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('رمزهای عبور مطابقت ندارند');
      return;
    }
    
    setLoading(true);
    
    try {
      const generatedEmail = `${engPhone}@temp.domain`;
      
      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('phone', engPhone)
        .single();
      
      if (existingUser) {
        throw new Error('این شماره موبایل قبلاً ثبت شده است');
      }
      
      // Sign up the user
      const { error: signupError } = await supabase.auth.signUp({
        email: generatedEmail,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: engPhone,
          }
        }
      });
      
      if (signupError) {
        throw signupError;
      }
      
      // Save user info to users table
      const { error: insertError } = await supabase
        .from('users')
        .insert([
          {
            full_name: fullName,
            phone: engPhone,
            email: generatedEmail,
          }
        ]);
      
      if (insertError) {
        console.error('Error saving user info:', insertError);
      }
      
      setSuccess(true);
      
      // If onSuccess callback is provided, call it instead of redirecting
      if (onSuccess) {
        setTimeout(onSuccess, 1500);
      } else {
        // Redirect after a short delay
        setTimeout(() => {
          router.push(`/auth/login?returnUrl=${encodeURIComponent(returnUrl)}`);
          router.refresh();
        }, 2000);
      }
      
    } catch (err: any) {
      setError(err.message || 'مشکلی در ثبت نام رخ داد');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-green-100 border border-gray-50 text-center animate-in fade-in zoom-in duration-500">
        <div className="w-16 h-16 bg-green-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-4">
          <User size={32} />
        </div>
        <h2 className="text-2xl font-black text-gray-800 mb-2">ثبت نام موفق!</h2>
        <p className="text-gray-500">حساب کاربری شما با موفقیت ایجاد شد.</p>
      </div>
    );
  }

  return (
    <div className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-blue-100 border border-gray-50 animate-in fade-in zoom-in duration-500">
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 -rotate-3 shadow-lg shadow-blue-200">
          <User size={32} />
        </div>
        <h2 className="text-3xl font-black text-gray-800">ثبت نام حساب</h2>
        <p className="text-gray-400 mt-2 text-sm">لطفاً اطلاعات خود را وارد کنید</p>
      </div>

      <form onSubmit={handleSignup} className="space-y-6">
        <div className="relative group">
          <input
            type="text" placeholder="نام و نام خانوادگی" value={fullName} 
            onChange={(e) => setFullName(e.target.value)} required
            className="w-full pr-12 pl-4 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 border-none transition-all"
          />
          <User className="absolute right-4 top-4 text-gray-300 group-focus-within:text-blue-500" size={20} />
        </div>

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

        <div className="relative group">
          <input
            type="password" placeholder="تکرار رمز عبور" value={confirmPassword} 
            onChange={(e) => setConfirmPassword(e.target.value)} required
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
          {loading ? 'در حال ثبت نام...' : 'ثبت نام امن'}
          <ArrowLeft size={20} />
        </button>
      </form>
    </div>
  );
}