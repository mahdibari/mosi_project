'use client';

import { useState, useEffect, Suspense } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  MapPin, 
  Phone, 
  User, 
  CreditCard, 
  Truck, 
  ShieldCheck, 
  ArrowRight,
  AlertCircle,
  X
} from 'lucide-react';
import { formatToToman } from '@/utils/formatPrice';
import Image from 'next/image';
import LoginForm from '@/components/LoginForm';
import SignupForm from '@/components/SignupForm';

// تابع هوشمند برای تبدیل اعداد فارسی/عربی به انگلیسی
const toEnglishDigits = (str: string) => {
  return str.replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString())
            .replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());
};

function CheckoutContent() {
  const { cartItems, cartTotal, clearCart, isLoading } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const status = searchParams.get('status');
  const isSuccess = status === 'success';

  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    address: '',
    postal_code: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);

  // بررسی وضعیت احراز هویت و بازیابی دیتای فرم
  useEffect(() => {
    const checkAuthStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsUserLoggedIn(true);
      }
      setIsCheckingAuth(false);
    };
    
    // بازیابی اطلاعات ذخیره شده
    const savedData = localStorage.getItem('pending_checkout_data');
    if (savedData) {
      try {
        setFormData(JSON.parse(savedData));
      } catch (e) {
        console.error("Error parsing saved data", e);
      }
    }

    checkAuthStatus();
  }, []);

  // پاکسازی سبد خرید بعد از بازگشت موفق از درگاه
  useEffect(() => {
    if (isSuccess) {
      clearCart();
      localStorage.removeItem('pending_checkout_data');
    }
  }, [isSuccess, clearCart]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    const processedValue = (name === 'phone' || name === 'postal_code') 
      ? toEnglishDigits(value) 
      : value;
    
    setFormData(prev => {
      const newState = { ...prev, [name]: processedValue };
      localStorage.setItem('pending_checkout_data', JSON.stringify(newState));
      return newState;
    });

    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    const phoneRegex = /^09[0-9]{9}$/;
    
    if (!formData.full_name.trim()) newErrors.full_name = 'نام الزامی است';
    if (!phoneRegex.test(formData.phone)) newErrors.phone = 'شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود';
    if (formData.postal_code.length !== 10) newErrors.postal_code = 'کد پستی باید دقیقاً ۱۰ رقم باشد';
    if (formData.address.length < 10) newErrors.address = 'لطفاً آدرس دقیق‌تری وارد کنید';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // تابع اصلی اجرای اکشن نهایی ثبت سفارش
  const executeOrderAction = async (user: any) => {
    setIsSubmitting(true);
    try {
      // ۱. ثبت آدرس
      const { data: newAddress, error: addressError } = await supabase
        .from('addresses')
        .insert([{ 
          full_name: formData.full_name,
          phone: formData.phone,
          address: formData.address,
          postal_code: formData.postal_code,
          user_id: user.id 
        }])
        .select()
        .single();

      if (addressError) throw new Error('خطا در ثبت آدرس');

      // ۲. ثبت سفارش
      const { data: newOrder, error: orderError } = await supabase
        .from('orders')
        .insert([{
          user_id: user.id,
          address_id: newAddress.id,
          total_amount: cartTotal,
          status: 'pending',
        }])
        .select()
        .single();

      if (orderError) throw new Error('خطا در ایجاد سفارش');

      // ۳. ثبت محصولات سفارش
      const orderItems = cartItems.map(item => ({
        order_id: newOrder.id,
        product_id: item.product.id,
        quantity: item.quantity,
        price: item.product.discount_percentage 
          ? item.product.price * (1 - item.product.discount_percentage / 100)
          : item.product.price,
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) throw itemsError;

      // ۴. ارسال به درگاه پرداخت
      const paymentData = {
        amount: cartTotal,
        name: formData.full_name,
        phone: formData.phone,
        description: `سفارش ${newOrder.id}`,
        factorId: newOrder.id,
        redirectUrl: `${window.location.origin}/api/payment/callback`,
      };

      const response = await fetch('/api/payment/initiate-bitpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData),
      });

      const result = await response.json();

      if (result.success && result.bitpayRedirectUrl) {
        localStorage.removeItem('pending_checkout_data');
        window.location.href = result.bitpayRedirectUrl;
      } else {
        throw new Error(result.message || 'خطا در اتصال به درگاه');
      }
    } catch (error: any) {
      alert(error.message || 'مشکلی پیش آمد، لطفاً دوباره تلاش کنید.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      setShowAuthModal(true);
      return;
    }

    await executeOrderAction(session.user);
  };

  const handleAuthSuccess = async () => {
    setShowAuthModal(false);
    setIsUserLoggedIn(true);
    
    // دریافت سشن جدید بعد از لاگین/ثبت‌نام
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await executeOrderAction(session.user);
    }
  };

  if (isLoading || isCheckingAuth) return <div className="text-center py-20 font-bold">در حال بارگذاری...</div>;

  return (
    <main className="container mx-auto px-4 py-10 min-h-screen" dir="rtl">
      {/* Authentication Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl w-full max-w-md relative overflow-hidden animate-in zoom-in duration-300">
            <button 
              onClick={() => setShowAuthModal(false)}
              className="absolute top-6 left-6 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors z-10"
            >
              <X size={20} className="text-gray-500" />
            </button>
            
            <div className="p-8">
              <h2 className="text-2xl font-black text-center mb-8">
                {authMode === 'login' ? 'ورود به حساب' : 'ثبت نام'}
              </h2>
              
              <div className="bg-gray-50 dark:bg-gray-900/50 p-1 rounded-2xl mb-8 flex">
                <button 
                  onClick={() => setAuthMode('login')}
                  className={`flex-1 py-3 rounded-xl font-bold transition-all ${authMode === 'login' ? 'bg-white dark:bg-gray-800 shadow-sm text-indigo-600' : 'text-gray-400'}`}
                >ورود</button>
                <button 
                  onClick={() => setAuthMode('signup')}
                  className={`flex-1 py-3 rounded-xl font-bold transition-all ${authMode === 'signup' ? 'bg-white dark:bg-gray-800 shadow-sm text-indigo-600' : 'text-gray-400'}`}
                >ثبت نام</button>
              </div>

              {authMode === 'login' ? (
                <LoginForm onSuccess={handleAuthSuccess} />
              ) : (
                <SignupForm onSuccess={handleAuthSuccess} />
              )}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* فرم اطلاعات */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl">
                <MapPin className="text-indigo-600 dark:text-indigo-400" size={24} />
              </div>
              اطلاعات تحویل سفارش
            </h2>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-500 mr-2">نام و نام خانوادگی</label>
                <input 
                  type="text" 
                  name="full_name" 
                  value={formData.full_name} 
                  onChange={handleChange} 
                  className="w-full p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border-none outline-none focus:ring-2 ring-indigo-500/20"
                  placeholder="مثلاً: محمد رضایی"
                />
                {errors.full_name && <p className="text-red-500 text-xs flex items-center gap-1"><AlertCircle size={12}/> {errors.full_name}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-500 mr-2">شماره تماس</label>
                <input 
                  type="tel" 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleChange} 
                  className="w-full p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border-none outline-none focus:ring-2 ring-indigo-500/20 text-left"
                  placeholder="09123456789"
                  dir="ltr"
                />
                {errors.phone && <p className="text-red-500 text-xs flex items-center gap-1"><AlertCircle size={12}/> {errors.phone}</p>}
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-bold text-gray-500 mr-2">آدرس پستی</label>
                <textarea 
                  name="address" 
                  value={formData.address} 
                  onChange={handleChange} 
                  rows={3}
                  className="w-full p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border-none outline-none focus:ring-2 ring-indigo-500/20"
                  placeholder="استان، شهر، محله، خیابان، پلاک..."
                />
                {errors.address && <p className="text-red-500 text-xs flex items-center gap-1"><AlertCircle size={12}/> {errors.address}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-500 mr-2">کد پستی (۱۰ رقم)</label>
                <input 
                  type="text" 
                  name="postal_code" 
                  value={formData.postal_code} 
                  onChange={handleChange} 
                  maxLength={10}
                  className="w-full p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border-none outline-none focus:ring-2 ring-indigo-500/20 text-left"
                  placeholder="۱۲۳۴۵۶۷۸۹۰"
                  dir="ltr"
                />
                {errors.postal_code && <p className="text-red-500 text-xs flex items-center gap-1"><AlertCircle size={12}/> {errors.postal_code}</p>}
              </div>

              <div className="md:col-span-2 pt-4">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 shadow-xl disabled:bg-gray-400"
                >
                  {isSubmitting ? "در حال اتصال به درگاه..." : "تایید و پرداخت آنلاین"}
                  <CreditCard size={24} />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* خلاصه فاکتور */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden sticky top-24">
            <div className="p-6 border-b border-gray-50 dark:border-gray-700 flex items-center gap-2 font-bold">
              <Truck size={18} className="text-gray-400" />
              خلاصه سفارش
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex justify-between text-gray-500 text-sm">
                <span>مبلغ کالاها:</span>
                <span>{formatToToman(cartTotal)}</span>
              </div>
              
              <div className="pt-6 border-t border-dashed border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <span className="font-black text-gray-800 dark:text-gray-100">جمع نهایی:</span>
                <span className="text-2xl font-black text-indigo-600">{formatToToman(cartTotal)}</span>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl flex items-start gap-3 mt-4">
                <ShieldCheck className="text-blue-600 shrink-0" size={20} />
                <p className="text-[11px] text-blue-800 dark:text-blue-300 leading-relaxed">
                  پرداخت شما از طریق درگاه امن بیت‌پی انجام می‌شود. در صورت بروز هرگونه مشکل، پشتیبانی در کنار شماست.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center font-bold">در حال بارگذاری...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}