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
  AlertCircle,
  ShoppingBag,
  ArrowRight,
  Lock
} from 'lucide-react';
import { formatToToman } from '@/utils/formatPrice';
import Image from 'next/image';

// تبدیل هوشمند اعداد فارسی به انگلیسی
const toEnglishDigits = (str: string) => {
  return str.replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString())
            .replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());
};

function CheckoutContent() {
  const { cartItems, cartTotal, clearCart, isLoading } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    address: '',
    postal_code: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (searchParams.get('status') === 'success') {
      clearCart();
    }
  }, [searchParams, clearCart]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const processedValue = (name === 'phone' || name === 'postal_code') 
      ? toEnglishDigits(value) 
      : value;
    
    setFormData(prev => ({ ...prev, [name]: processedValue }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.full_name.trim()) newErrors.full_name = 'نام و نام خانوادگی الزامی است';
    if (!/^09[0-9]{9}$/.test(formData.phone)) newErrors.phone = 'شماره موبایل معتبر وارد کنید (مثلا ۰۹۱۲۳۴۵۶۷۸۹)';
    if (formData.postal_code.length !== 10) newErrors.postal_code = 'کد پستی باید ۱۰ رقم باشد';
    if (formData.address.length < 10) newErrors.address = 'لطفاً آدرس را دقیق‌تر وارد کنید';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // --- حل ریشه‌ای مشکل منقضی شدن نشست (ارور FETCH) ---
      // اجبار به رفرش کردن توکن قبل از ثبت سفارش
      const { data: { session }, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError || !session) {
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

      if (addressError) throw new Error('خطا در ثبت اطلاعات آدرس');

      // ۲. ایجاد سفارش (بدون هزینه اضافی)
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

      if (orderError) throw new Error('خطا در ثبت سفارش');

      // ۳. ثبت آیتم‌ها
      const orderItems = cartItems.map(item => ({
        order_id: newOrder.id,
        product_id: item.product.id,
        quantity: item.quantity,
        price: item.product.discount_percentage 
          ? item.product.price * (1 - item.product.discount_percentage / 100)
          : item.product.price,
      }));

      await supabase.from('order_items').insert(orderItems);

      // ۴. هدایت به درگاه پرداخت
      const response = await fetch('/api/payment/initiate-bitpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: cartTotal,
          name: formData.full_name,
          phone: formData.phone,
          factorId: newOrder.id,
          redirectUrl: `${window.location.origin}/api/payment/callback`,
        }),
      });

      const result = await response.json();
      if (result.success) {
        window.location.href = result.bitpayRedirectUrl;
      } else {
        throw new Error(result.message);
      }
    
    } catch (error: any) {
      console.error(error);
      alert('خطا در برقراری ارتباط با سرور. لطفا اتصال اینترنت خود را چک کرده و دوباره تلاش کنید.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-indigo-600 mb-4"></div>
      <p className="font-bold text-gray-600">در حال بارگذاری فاکتور...</p>
    </div>
  );

  return (
    <main className="bg-[#f8fafc] dark:bg-gray-950 min-h-screen py-12 px-4" dir="rtl">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* بخش فرم اطلاعات (سمت راست) */}
        <div className="lg:col-span-2 space-y-8 animate-fadeIn">
          <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:shadow-none border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-4 mb-10">
              <div className="bg-indigo-600 p-3 rounded-2xl shadow-lg shadow-indigo-200">
                <MapPin className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-black text-gray-800 dark:text-white">جزئیات ارسال سفارش</h1>
                <p className="text-gray-400 text-sm mt-1 font-medium">لطفاً اطلاعات دقیق خود را وارد کنید</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-gray-500 px-2 flex items-center gap-1">
                    <User size={14}/> نام و نام خانوادگی
                  </label>
                  <input 
                    type="text" 
                    name="full_name" 
                    value={formData.full_name} 
                    onChange={handleChange}
                    placeholder="مثال: امیرحسین محمدی"
                    className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border-2 border-transparent focus:border-indigo-500/30 focus:bg-white outline-none transition-all dark:text-white"
                  />
                  {errors.full_name && <p className="text-red-500 text-xs font-bold px-2">{errors.full_name}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-gray-500 px-2 flex items-center gap-1">
                    <Phone size={14}/> شماره تماس
                  </label>
                  <input 
                    type="tel" 
                    name="phone" 
                    value={formData.phone} 
                    onChange={handleChange}
                    placeholder="09123456789"
                    dir="ltr"
                    className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border-2 border-transparent focus:border-indigo-500/30 focus:bg-white outline-none transition-all text-left font-sans dark:text-white"
                  />
                  {errors.phone && <p className="text-red-500 text-xs font-bold px-2">{errors.phone}</p>}
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-[13px] font-bold text-gray-500 px-2 flex items-center gap-1">
                    <ShoppingBag size={14}/> آدرس دقیق پستی
                  </label>
                  <textarea 
                    name="address" 
                    value={formData.address} 
                    onChange={handleChange}
                    rows={3}
                    placeholder="استان، شهر، خیابان اصلی، کوچه، پلاک و واحد"
                    className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border-2 border-transparent focus:border-indigo-500/30 focus:bg-white outline-none transition-all dark:text-white"
                  />
                  {errors.address && <p className="text-red-500 text-xs font-bold px-2">{errors.address}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-gray-500 px-2 flex items-center gap-1">
                    <Lock size={14}/> کد پستی (۱۰ رقمی)
                  </label>
                  <input 
                    type="text" 
                    name="postal_code" 
                    value={formData.postal_code} 
                    onChange={handleChange}
                    maxLength={10}
                    placeholder="۱۲۳۴۵۶۷۸۹۰"
                    dir="ltr"
                    className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border-2 border-transparent focus:border-indigo-500/30 focus:bg-white outline-none transition-all text-left font-sans dark:text-white"
                  />
                  {errors.postal_code && <p className="text-red-500 text-xs font-bold px-2">{errors.postal_code}</p>}
                </div>
              </div>

              <div className="pt-6">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full group relative overflow-hidden py-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[1.5rem] font-black text-xl transition-all shadow-2xl shadow-indigo-200 dark:shadow-none flex items-center justify-center gap-3 disabled:bg-gray-400"
                >
                  <div className=" bg-white/10 "></div>
                  {isSubmitting ? "در حال تمدید اتصال..." : "ثبت سفارش و پرداخت"}
                  <ArrowRight size={24} className="group-hover:translate-x-[-5px] transition-transform" />
                </button>
                <p className="text-center text-gray-400 text-[10px] mt-4 font-medium italic">اتصال شما به درگاه بانکی به صورت امن و کدگذاری شده برقرار خواهد شد.</p>
              </div>
            </form>
          </div>
        </div>

        {/* فاکتور کناری (سمت چپ) */}
        <div className="lg:col-span-1">
          <div className="sticky top-10 space-y-6">
            <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="bg-gray-50 dark:bg-gray-800/50 p-6 border-b border-gray-100 dark:border-gray-700">
                <h3 className="font-black text-gray-800 dark:text-white flex items-center gap-2">
                  <ShoppingBag size={20} className="text-indigo-600" />
                  خلاصه خرید
                </h3>
              </div>
              
              <div className="p-8 space-y-5">
                <div className="flex justify-between items-center text-gray-500 dark:text-gray-400 font-bold text-sm">
                  <span>تعداد محصولات:</span>
                  <span className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full text-indigo-600">{cartItems.length} کالا</span>
                </div>
                
                <div className="flex justify-between items-center text-gray-500 dark:text-gray-400 font-bold text-sm">
                  <span>هزینه ارسال:</span>
                  <span className="text-green-600 flex items-center gap-1 font-black">رایگان <Truck size={14}/></span>
                </div>

                <div className="pt-6 border-t border-dashed border-gray-200 dark:border-gray-700 flex justify-between items-end">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-gray-400 block">مبلغ قابل پرداخت</span>
                    <span className="text-2xl font-black text-indigo-600 tracking-tight">{formatToToman(cartTotal)}</span>
                  </div>
                </div>

                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-5 rounded-[1.5rem] mt-4 border border-indigo-100 dark:border-indigo-800">
                  <div className="flex gap-3">
                    <ShieldCheck className="text-indigo-600 shrink-0" size={22} />
                    <p className="text-[11px] text-indigo-900 dark:text-indigo-300 leading-relaxed font-bold">
                      با خرید از مصی‌شاپ، سفارش شما شامل ضمانت بازگشت وجه و سلامت فیزیکی کالا می‌باشد.
                    </p>
                  </div>
                </div>
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
    <Suspense fallback={null}>
      <CheckoutContent />
    </Suspense>
  );
}