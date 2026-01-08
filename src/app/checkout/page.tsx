'use client';

import { useState, useEffect, Suspense } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  MapPin, Phone, User as UserIcon, CreditCard, 
  Truck, ShieldCheck, X, AlertCircle 
} from 'lucide-react';
import { formatToToman } from '@/utils/formatPrice';
import Image from 'next/image';

const toEnglishDigits = (str: string) => {
  return str.replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString())
            .replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());
};

function CheckoutContent() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    address: '',
    postal_code: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // بازیابی اطلاعات فرم از LocalStorage هنگام بازگشت از صفحه لاگین
  useEffect(() => {
    const savedData = localStorage.getItem('pending_checkout_data');
    if (savedData) {
      setFormData(JSON.parse(savedData));
      localStorage.removeItem('pending_checkout_data');
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAuthRedirect = (path: string) => {
    // ذخیره اطلاعات فرم قبل از انتقال به صفحه لاگین/ثبت‌نام
    localStorage.setItem('pending_checkout_data', JSON.stringify(formData));
    router.push(`${path}?returnUrl=/checkout`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // بررسی وضعیت لاگین
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const englishPhone = toEnglishDigits(formData.phone);
      
      // ۱. به‌روزرسانی یا ثبت اطلاعات کاربر در جدول پروفایل
      await supabase.from('users').upsert({
        id: user.id,
        phone: englishPhone,
        email: user.email || `${englishPhone}@guest.com`,
        first_name: formData.full_name.split(' ')[0],
        last_name: formData.full_name.split(' ').slice(1).join(' '),
      });

      // ۲. ثبت آدرس جدید
      const { data: addr, error: addrErr } = await supabase
        .from('addresses')
        .insert([{ ...formData, phone: englishPhone, user_id: user.id }])
        .select().single();
      if (addrErr) throw addrErr;

      // ۳. ثبت سفارش اصلی
      const { data: order, error: orderErr } = await supabase
        .from('orders')
        .insert([{
          user_id: user.id,
          address_id: addr.id,
          total_amount: cartTotal,
          status: 'pending'
        }])
        .select().single();
      if (orderErr) throw orderErr;

      // ۴. ثبت آیتم‌های سبد خرید
      const items = cartItems.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.product.price
      }));
      await supabase.from('order_items').insert(items);

      // ۵. ارسال به درگاه پرداخت
      const res = await fetch('/api/payment/initiate-bitpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount: cartTotal, 
          factorId: order.id, 
          redirectUrl: `${window.location.origin}/checkout?status=success` 
        })
      });
      
      const resData = await res.json();
      if (resData.success) {
        window.location.href = resData.bitpayRedirectUrl;
      } else {
        throw new Error(resData.message);
      }

    } catch (error: any) {
      alert(error.message || "خطا در ثبت سفارش");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 relative">
      <h1 className="text-3xl font-black mb-10 text-gray-800">تکمیل خرید</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* بخش فرم اطلاعات */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-indigo-600">
              <MapPin size={24} /> اطلاعات ارسال سفارش
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-600 mr-2">نام و نام خانوادگی</label>
                <input name="full_name" value={formData.full_name} onChange={handleInputChange} required className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all" placeholder="مثلا: علی محمدی" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-600 mr-2">شماره تماس</label>
                <input name="phone" value={formData.phone} onChange={handleInputChange} required className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-left" placeholder="09123456789" />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-bold text-gray-600 mr-2">آدرس کامل پستی</label>
                <textarea name="address" value={formData.address} onChange={handleInputChange} required className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all h-32" placeholder="استان، شهر، خیابان..." />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-600 mr-2">کد پستی</label>
                <input name="postal_code" value={formData.postal_code} onChange={handleInputChange} required className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-left" placeholder="1234567890" />
              </div>
            </div>
          </div>
        </div>

        {/* بخش خلاصه سبد و پرداخت */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 sticky top-10 overflow-hidden">
            <div className="p-6 bg-gray-50 border-b border-gray-100 font-bold flex items-center gap-2">
              <Truck size={20} className="text-indigo-600" /> خلاصه سفارش
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between text-gray-600">
                <span>تعداد کالاها:</span>
                <span>{cartItems.length} عدد</span>
              </div>
              <div className="pt-4 border-t border-dashed flex justify-between items-center">
                <span className="font-bold">مبلغ قابل پرداخت:</span>
                <span className="text-2xl font-black text-indigo-600">{formatToToman(cartTotal)}</span>
              </div>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all disabled:bg-gray-300"
              >
                {isSubmitting ? 'در حال اتصال به درگاه...' : 'تایید و پرداخت نهایی'}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Auth Modal - مدال ورود/ثبت‌نام */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="bg-white rounded-[40px] p-10 max-w-md w-full shadow-2xl relative animate-in fade-in zoom-in duration-300">
            <button onClick={() => setShowAuthModal(false)} className="absolute top-6 left-6 text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
            <div className="text-center">
              <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <UserIcon size={40} />
              </div>
              <h3 className="text-2xl font-black mb-3">ابتدا وارد شوید</h3>
              <p className="text-gray-500 mb-8 leading-relaxed">
                برای ثبت سفارش و امنیت خرید شما، نیاز است ابتدا وارد حساب کاربری خود شوید یا سریع ثبت‌نام کنید.
              </p>
              <div className="space-y-4">
                <button onClick={() => handleAuthRedirect('/auth/signup')} className="w-full py-4 bg-green-600 text-white rounded-2xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-100">
                  ثبت‌نام سریع و ساده
                </button>
                <button onClick={() => handleAuthRedirect('/auth/login')} className="w-full py-4 border-2 border-gray-200 text-gray-700 rounded-2xl font-bold hover:bg-gray-50 transition-all">
                  ورود به حساب
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center font-bold">در حال بارگذاری...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}