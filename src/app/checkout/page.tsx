'use client';

import { useState, useEffect, Suspense } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { MapPin, Phone, User, ChevronDown, Truck, RefreshCcw, HelpCircle, CheckCircle } from 'lucide-react';
import { formatToToman } from '@/utils/formatPrice';
import Image from 'next/image';

// کامپوننت جداگانه برای محتوای اصلی که از useSearchParams استفاده می‌کند
function CheckoutContent() {
  const { cartItems, cartTotal, clearCart, isLoading } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const isSuccess = searchParams.get('status') === 'success';

  // خالی کردن سبد خرید بعد از بازگشت موفق
  useEffect(() => {
    if (isSuccess) {
      clearCart();
    }
  }, [isSuccess]);

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
      icon: <HelpCircle className="w-5 h-5" />,
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
      title: 'شرایط مرجوعی',
      content: 'تا ۷ روز امکان مرجوعی وجود دارد.',
    },
  ];

  // اگر کاربر از درگاه برنگشته و سبد خالی است -> برود به سبد خرید
  if (!isLoading && cartItems.length === 0 && !isSuccess) {
    router.push('/cart');
    return null;
  }

  // --- نمایش پیام موفقیت ---
  if (isSuccess) {
    return (
      <main className="container mx-auto px-4 py-16 min-h-[60vh] flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-10 max-w-lg w-full text-center border border-gray-100 dark:border-gray-700">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">خریدتون موفقیت آمیز بود</h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed mb-8">
            بزودی توسط ادمین های ما بررسی میگردد و مرسوله شما ارسال میشود.
          </p>
          <button 
            onClick={() => router.push('/')}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors"
          >
            بازگشت به فروشگاه
          </button>
        </div>
      </main>
    );
  }
  // -------------------------

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('کاربر یافت نشد. لطفا وارد شوید.');

      const { data: newAddress, error: addressError } = await supabase
        .from('addresses')
        .insert([{ ...formData, user_id: user.id }])
        .select()
        .single();

      if (addressError) throw addressError;

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

      const callbackUrl = `${window.location.origin}/api/payment/callback`;
      const firstProductName = cartItems[0]?.product.name || 'محصولات منتخب';
      
      const paymentData = {
        amount: cartTotal,
        name: formData.full_name,
        email: user.email || '',
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

      // انتقال به درگاه
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

            <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50">
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

// کامپوننت اصلی که در Suspense پیچیده شده است
export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-20 text-center">در حال بارگذاری صفحه پرداخت...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}