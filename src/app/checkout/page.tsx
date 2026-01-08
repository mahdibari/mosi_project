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
  AlertCircle
} from 'lucide-react';
import { formatToToman } from '@/utils/formatPrice';
import Image from 'next/image';

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

  useEffect(() => {
    if (isSuccess) {
      clearCart();
    }
  }, [isSuccess, clearCart]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // تبدیل خودکار اعداد فارسی به انگلیسی در فیلدهای حساس
    const processedValue = (name === 'phone' || name === 'postal_code') 
      ? toEnglishDigits(value) 
      : value;
    
    setFormData(prev => ({ ...prev, [name]: processedValue }));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // حل مشکل Fetch: دریافت سشن معتبر قبل از هر عملیات
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        alert('نشست شما پایان یافته است. لطفا دوباره وارد حساب خود شوید.');
        router.push('/login');
        return;
      }

      const user = session.user;

      // ۱. ثبت آدرس
      const { data: newAddress, error: addressError } = await supabase
        .from('addresses')
        .insert([{ ...formData, user_id: user.id }])
        .select()
        .single();

      if (addressError) throw new Error('خطا در ثبت آدرس');

      // ۲. ثبت سفارش (مبلغ دقیق سبد خرید بدون هزینه اضافی)
      const { data: newOrder, error: orderError } = await supabase
        .from('orders')
        .insert([{
          user_id: user.id,
          address_id: newAddress.id,
          total_amount: cartTotal, // فقط مبلغ محصولات
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

  if (isLoading) return <div className="text-center py-20 font-bold">در حال بارگذاری...</div>;

  return (
    <main className="container mx-auto px-4 py-10 min-h-screen" dir="rtl">
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
                <label className="text-sm font-bold text-gray-500 mr-2">شماره تماس (انگلیسی/فارسی)</label>
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
  className={`
    group relative w-full py-5 overflow-hidden rounded-2xl
    bg-gradient-to-r from-indigo-600 to-purple-700
    text-white font-black text-lg
    shadow-2xl shadow-indigo-500/40 transition-all duration-300
    hover:scale-[1.02] hover:shadow-indigo-500/60 hover:brightness-110
    active:scale-[0.98]
    disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:active:scale-100
  `}
>
  {/* افکت درخشش (Shine Effect) - لایه نوری روی دکمه */}
  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

  {/* محتوای دکمه */}
  <div className="relative flex items-center justify-center gap-3">
    {isSubmitting ? (
      <>
        {/* لودینگ اسپینر */}
        <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
        <span>در حال اتصال به درگاه...</span>
      </>
    ) : (
      <>
        <span className="tracking-wide">تایید و پرداخت آنلاین</span>
        {/* آیکون کارت با انیمیشن ملایم برای جلب توجه */}
        <CreditCard size={24} className="animate-bounce" />
      </>
    )}
  </div>
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
    <Suspense fallback={<div className="p-20 text-center">درحال بارگذاری...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}