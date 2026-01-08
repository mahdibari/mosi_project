'use client';

import { useState, useEffect, Suspense } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { MapPin, Phone, User, ChevronDown, Truck, RefreshCcw, CheckCircle, X, XCircle, RefreshCw as RetryIcon, AlertTriangle } from 'lucide-react';
import { formatToToman } from '@/utils/formatPrice';
import Image from 'next/image';

function CheckoutContent() {
  const { cartItems, cartTotal, clearCart, isLoading } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const status = searchParams.get('status');
  const isSuccess = status === 'success';
  const isFailed = status === 'failed';

  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    if (isSuccess) {
      clearCart();
      setShowNotification(true);
      const timer = setTimeout(() => setShowNotification(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, clearCart]);

  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    address: '',
    postal_code: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [activeInfoBox, setActiveInfoBox] = useState<number | null>(0);

  const infoBoxes = [
    {
      icon: <AlertTriangle className="w-5 h-5" />,
      title: 'نحوه ثبت سفارش',
      content: 'پس از تکمیل اطلاعات، روی دکمه ثبت سفارش کلیک کنید.',
    },
    {
      icon: <Truck className="w-5 h-5" />,
      title: 'زمان ارسال',
      content: 'سفارش‌ها پس از پرداخت موفق ثبت و ارسال می‌شوند.',
    },
    {
      icon: <RefreshCcw className="w-5 h-5" />,
      title: ' فیلتر شکن',
      content: 'فیلتر شکن خود را برای ثبت خرید خاموش کنید',
    },
  ];

  if (!isLoading && cartItems.length === 0 && !isSuccess && !isFailed) {
    router.push('/cart');
    return null;
  }

  if (isSuccess) {
    return (
      <main className="container mx-auto px-4 py-16 min-h-[60vh] flex items-center justify-center relative">
        {showNotification && (
          <div className="fixed bottom-5 left-1/2 transform -translate-x-1/2 md:left-auto md:right-5 md:translate-x-0 z-50 bg-green-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce">
            <CheckCircle className="w-6 h-6" />
            <div>
              <p className="font-bold text-sm">پرداخت موفقیت‌آمیز</p>
              <p className="text-xs text-green-100">سفارش شما با موفقیت ثبت شد</p>
            </div>
            <button onClick={() => setShowNotification(false)} className="text-green-100 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-10 max-w-lg w-full text-center border border-green-100 dark:border-green-900">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">خریدتون موفقیت آمیز بود</h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed mb-6">
            بزودی توسط ادمین های ما بررسی میگردد و مرسوله شما ارسال میشود.
          </p>
          
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-8 text-sm text-green-800 dark:text-green-200">
            وضعیت پرداخت در سیستم: <span className="font-bold">successful</span>
          </div>

          <div className="flex flex-col gap-3">
            <button 
              onClick={() => router.push('/orders')}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors"
            >
              مشاهده سفارشات
            </button>
            <button 
              onClick={() => router.push('/')}
              className="w-full py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-colors"
            >
              بازگشت به فروشگاه
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (isFailed) {
    return (
      <main className="container mx-auto px-4 py-16 min-h-[60vh] flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-10 max-w-lg w-full text-center border border-red-100 dark:border-red-900">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">پرداخت ناموفق بود</h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed mb-8">
            متاسفانه تراکنش شما با مشکل مواجه شد یا توسط شما لغو شده است.
          </p>
          
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => router.push('/cart')}
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
            >
              <RetryIcon className="w-4 h-4" />
              تلاش مجدد
            </button>
            <button 
              onClick={() => router.push('/')}
              className="w-full py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-colors"
            >
              بازگشت به فروشگاه
            </button>
          </div>
        </div>
      </main>
    );
  }
 const toEnglishDigits = (str: string) => {
    const map: Record<string, string> = {
      '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4',
      '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9',
      '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
      '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9'
    };
    return str.replace(/[۰-۹٠-٩]/g, (m) => map[m]);
  };

 const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let finalValue = value;

    // اگر فیلد تلفن یا کد پستی است، اعداد را به انگلیسی تبدیل کن
    if (name === 'phone' || name === 'postal_code') {
      finalValue = toEnglishDigits(value);
    }

    setFormData(prev => ({ ...prev, [name]: finalValue }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    const phoneRegex = /^09[0-9]{9}$/;
    if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = 'شماره موبایل نامعتبر است.';
    }
    const postalCodeRegex = /^\d{10}$/;
    if (!postalCodeRegex.test(formData.postal_code)) {
      newErrors.postal_code = 'کد پستی ۱۰ رقمی است.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

     const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // 1. دریافت وضعیت کاربر
      const { data, error: userError } = await supabase.auth.getUser();
      let user = data.user;
      
      // 2. اگر کاربر لاگین نیست، ثبت نام ناشناس انجام می‌شود
      if (!user || userError) {
        await supabase.auth.signOut(); // پاکسازی سشن قبلی
        const { data: anonData, error: anonError } = await supabase.auth.signInAnonymously();
        
        if (anonError) {
          console.error("خطای اصلی ساپابیس:", anonError);
          throw new Error(`خطای سیستم: ${anonError.message}`);
        }
        user = anonData.user;
      }

      // 3. اطمینان از وجود کاربر
      if (!user) {
        throw new Error("خطا در شناسایی کاربر. لطفاً صفحه را رفرش کنید.");
      }

      // --- بسیار مهم: ساخت کاربر در جدول public.users ---
      // چون ترایگر را حذف کردیم، باید خودمان مطمئن شویم کاربر در public.users وجود دارد
      // تا foreign key های addresses و orders بتوانند به آن اشاره کنند
      const { error: publicUserError } = await supabase
        .from('users') // توجه: نام جدول شما users است نه profiles
        .upsert({ 
            id: user.id, 
            email: user.email || 'guest@example.com' 
        }, { onConflict: 'id' });

      if (publicUserError) {
        console.error("خطا در ساخت پروفایل در public.users:", publicUserError);
        // اگر اینجا ارور داد، یعنی اجازه درج در جدول users را به anon نداده‌اید
        // اما فرمول ادامه پیدا می‌کند تا اگر قبلاً رکورد بوده خطا ندهد
      }
      // -------------------------------------------------

      // 4. ثبت آدرس
      const { data: newAddress, error: addressError } = await supabase
        .from('addresses')
        .insert([{ 
          ...formData, 
          user_id: user.id 
        }])
        .select()
        .single();

      if (addressError) throw addressError;

      // 5. ثبت سفارش
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

      if (orderError) throw orderError;

      // 6. ثبت آیتم‌های سفارش
      const orderItemsToInsert = cartItems.map(item => ({
        order_id: newOrder.id,
        product_id: item.product.id,
        quantity: item.quantity,
        price: item.product.discount_percentage 
          ? item.product.price * (1 - item.product.discount_percentage / 100)
          : item.product.price,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemsToInsert);

      if (itemsError) throw itemsError;

      // 7. درخواست پرداخت
      const callbackUrl = `${window.location.origin}/api/payment/callback`;
      const firstProductName = cartItems[0]?.product.name || 'محصولات منتخب';
      
      const paymentData = {
        amount: cartTotal,
        name: formData.full_name,
        email: user.email || 'guest@example.com', 
        phone: formData.phone,
        description: `خرید: ${firstProductName}`,
        factorId: newOrder.id,
        redirectUrl: callbackUrl,
      };

      const bitpayResponse = await fetch('/api/payment/initiate-bitpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData),
      });

      const bitpayData = await bitpayResponse.json();

      if (!bitpayResponse.ok || !bitpayData.success) {
        throw new Error(bitpayData.message || 'خطا در اتصال به درگاه پرداخت');
      }

      window.location.href = bitpayData.bitpayRedirectUrl;
    
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'خطایی رخ داد');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="p-10 text-center">در حال بارگذاری...</div>;

  return (
    <main className="container mx-auto px-4 py-8 min-h-[60vh]">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">تکمیل اطلاعات سفارش</h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1">
           <div className="sticky top-24 space-y-4">
               {infoBoxes.map((box, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
                  <button onClick={() => setActiveInfoBox(activeInfoBox === index ? null : index)} className="w-full flex items-center justify-between p-4 text-right hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <div className="flex items-center gap-3"><span className="text-indigo-600 dark:text-indigo-400">{box.icon}</span><span className="font-semibold text-gray-800 dark:text-gray-100">{box.title}</span></div>
                    <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${activeInfoBox === index ? 'rotate-180' : ''}`} />
                  </button>
                  {activeInfoBox === index && <div className="px-4 pb-4 text-sm text-gray-600 dark:text-gray-400">{box.content}</div>}
                </div>
              ))}
           </div>
        </aside>

        <section className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 space-y-6">
             <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">نام و نام خانوادگی</label>
              <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">شماره تماس</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">آدرس دقیق</label>
              <textarea name="address" value={formData.address} onChange={handleChange} required rows={3} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">کد پستی</label>
              <input type="text" name="postal_code" value={formData.postal_code} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
              {errors.postal_code && <p className="text-red-500 text-xs mt-1">{errors.postal_code}</p>}
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-all">
              {isSubmitting ? 'در حال انتقال به درگاه...' : 'پرداخت و ثبت سفارش'}
            </button>
          </form>
        </section>

        <aside className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden sticky top-24">
            <div className="p-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
              <h2 className="text-xl font-semibold">خلاصه سفارش</h2>
            </div>
            <div className="p-6 max-h-96 overflow-y-auto">
               {cartItems.map(item => (
                 <div key={item.id} className="flex gap-3 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                    <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden">
                        {item.product.image_url ? <Image src={item.product.image_url} alt={item.product.name} fill className="object-cover" /> : <div className="w-full h-full bg-gray-200 dark:bg-gray-700"></div>}
                    </div>
                    <div className="flex-grow">
                        <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100">{item.product.name}</h4>
                        <p className="text-xs text-gray-500">تعداد: {item.quantity}</p>
                        <p className="text-sm font-bold text-indigo-600">{formatToToman((item.product.discount_percentage ? item.product.price * (1 - item.product.discount_percentage / 100) : item.product.price) * item.quantity)}</p>
                    </div>
                 </div>
               ))}
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between text-xl font-bold text-gray-800 dark:text-gray-100">
                    <span>مبلغ نهایی:</span>
                    <span>{formatToToman(cartTotal)}</span>
                </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-20 text-center">در حال بارگذاری صفحه پرداخت...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}