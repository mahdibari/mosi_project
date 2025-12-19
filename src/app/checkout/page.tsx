// File: app/checkout/page.tsx

'use client';

import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

import { MapPin, Phone, User, CreditCard, ChevronDown, Truck, RefreshCcw, HelpCircle } from 'lucide-react';
import { formatToToman } from '@/utils/formatPrice';
import Image from 'next/image';

export default function CheckoutPage() {
  const { cartItems, cartTotal, clearCart, isLoading } = useCart();
  const router = useRouter();

  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    address: '',
    postal_code: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [activeInfoBox, setActiveInfoBox] = useState<number | null>(0); // باکس اول به صورت پیشفرض باز است

  // اطلاعات باکس‌های راهنما
  const infoBoxes = [
    {
      icon: <HelpCircle className="w-5 h-5" />,
      title: 'نحوه ثبت سفارش',
      content: 'پس از تکمیل اطلاعات، روی دکمه "ثبت سفارش نهایی" کلیک کنید. سفارش شما ثبت شده و به زودی توسط تیم ما بررسی و پردازش خواهد شد.',
    },
    {
      icon: <Truck className="w-5 h-5" />,
      title: 'زمان ارسال',
      content: 'سفارش‌های شهر تهران طی ۲ تا ۳ روز کاری و سایر شهرها طی ۳ تا ۵ روز کاری از طریق پست پیشتاز ارسال می‌شوند. در روز ارسال، یک کد رهگیری برای شما پیامک می‌گردد.',
    },
    {
      icon: <RefreshCcw className="w-5 h-5" />,
      title: 'شرایط مرجوعی',
      content: 'اگر از خرید خود راضی نبودید، می‌توانید تا ۷ روز پس از دریافت محصول، درخواست مرجوعی خود را ثبت کنید. محصول باید استفاده نشده و بسته‌بندی اصلی سالم باشد.',
    },
  ];

  // اگر سبد خرید خالی بود، کاربر را به صفحه سبد خرید هدایت کن
  if (!isLoading && cartItems.length === 0) {
    router.push('/cart');
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // پاک کردن خطا در صورت تایپ مجدد کاربر
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // اعتبارسنجی شماره موبایل (ایران)
    const phoneRegex = /^09[0-9]{9}$/;
    if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = 'شماره موبایل باید با 09 شروع شده و 11 رقم باشد.';
    }

    // اعتبارسنجی کد پستی (10 رقم)
    const postalCodeRegex = /^\d{10}$/;
    if (!postalCodeRegex.test(formData.postal_code)) {
      newErrors.postal_code = 'کد پستی باید دقیقاً ۱۰ رقم عددی باشد.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return; // اگر فرم معتبر نبود، از ادامه جلوگیری کن
    }

    setIsSubmitting(true);

    try {
      // 1. دریافت کاربر فعلی
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('کاربر یافت نشد. لطفاً وارد شوید.');

      // 2. ایجاد آدرس جدید
      const { data: newAddress, error: addressError } = await supabase
        .from('addresses')
        .insert([{ 
          ...formData, 
          user_id: user.id 
        }])
        .select()
        .single();

      if (addressError) throw addressError;

      // 3. ایجاد سفارش جدید
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

      // 4. ایجاد آیتم‌های سفارش
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

      // 5. خالی کردن سبد خرید
      await clearCart();

      // 6. هدایت به صفحه موفقیت
      router.push('/order-success');

    
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div>در حال بارگذاری...</div>;
  }

  return (
    <main className="container mx-auto px-4 py-8 min-h-[60vh]">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">تکمیل اطلاعات سفارش</h1>
        <p className="text-gray-600 dark:text-gray-400">لطفاً اطلاعات ارسال را وارد کنید</p>
      </header>

      {/* تغییر لی‌اوت اصلی به 4 ستون */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* باکس‌های اطلاعات راهنما در سمت چپ */}
        <aside className="lg:col-span-1">
          <div className="sticky top-24 space-y-4">
            {infoBoxes.map((box, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
                <button
                  onClick={() => setActiveInfoBox(activeInfoBox === index ? null : index)}
                  className="w-full flex items-center justify-between p-4 text-right hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-indigo-600 dark:text-indigo-400">{box.icon}</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-100">{box.title}</span>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${activeInfoBox === index ? 'rotate-180' : ''}`} />
                </button>
                {activeInfoBox === index && (
                  <div className="px-4 pb-4 text-sm text-gray-600 dark:text-gray-400">
                    {box.content}
                  </div>
                )}
              </div>
            ))}
          </div>
        </aside>

        {/* فرم اطلاعات در وسط */}
        <section className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 space-y-6">
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <User className="inline w-4 h-4 ml-2" />
                نام و نام خانوادگی
              </label>
              <input
                type="text"
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Phone className="inline w-4 h-4 ml-2" />
                شماره تماس
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                onBlur={validateForm} // اعتبارسنجی هنگام خروج از فیلد
                pattern="^09[0-9]{9}$"
                title="شماره موبایل باید با 09 شروع شده و 11 رقم باشد."
                required
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white ${errors.phone ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
              />
              {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <MapPin className="inline w-4 h-4 ml-2" />
                آدرس دقیق
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                کد پستی
              </label>
              <input
                type="text"
                id="postal_code"
                name="postal_code"
                value={formData.postal_code}
                onChange={handleChange}
                onBlur={validateForm} // اعتبارسنجی هنگام خروج از فیلد
                pattern="^\d{10}$"
                title="کد پستی باید دقیقاً ۱۰ رقم عددی باشد."
                required
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white ${errors.postal_code ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
              />
              {errors.postal_code && <p className="mt-1 text-xs text-red-500">{errors.postal_code}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'در حال ثبت سفارش...' : 'ثبت سفارش نهایی'}
              <CreditCard className="w-5 h-5" />
            </button>
          </form>
        </section>

        {/* خلاصه سفارش در سمت راست */}
        <aside className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden sticky top-24">
            <div className="p-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
              <h2 className="text-xl font-semibold mb-2">خلاصه سفارش</h2>
              <p className="text-indigo-100 text-sm">{cartItems.length} محصول</p>
            </div>
            
            <div className="p-6 max-h-96 overflow-y-auto">
              {cartItems.map(item => (
                <div key={item.id} className="flex gap-3 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                  <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden">
                    {item.product.image_url ? (
                      <Image src={item.product.image_url} alt={item.product.name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-200 dark:bg-gray-700"></div>
                    )}
                  </div>
                  <div className="flex-grow">
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100">{item.product.name}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">تعداد: {item.quantity}</p>
                    <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                      {formatToToman(
                        (item.product.discount_percentage 
                          ? item.product.price * (1 - item.product.discount_percentage / 100)
                          : item.product.price) * item.quantity
                      )}
                    </p>
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