'use client';

import { useState, useEffect, Suspense } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  MapPin, Phone, User, ShoppingBag, CreditCard, 
  Loader2, CheckCircle, Truck, ShieldCheck 
} from 'lucide-react';
import { formatToToman } from '@/utils/formatPrice';
import Image from 'next/image';
import Link from 'next/link';

function CheckoutContent() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    address: '',
    postal_code: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      alert('سبد خرید شما خالی است');
      return;
    }
    
    setIsSubmitting(true);

    try {
      // ۱. بررسی لاگین بودن کاربر
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('لطفاً ابتدا وارد حساب کاربری خود شوید.');
        router.push('/login');
        return;
      }

      // ۲. ثبت آدرس در دیتابیس
      const { data: addrData, error: addrError } = await supabase
        .from('addresses')
        .insert({
          user_id: session.user.id,
          full_name: formData.full_name,
          phone: formData.phone,
          address: formData.address,
          postal_code: formData.postal_code
        })
        .select()
        .single();

      if (addrError) throw new Error('خطا در ثبت آدرس: ' + addrError.message);

      // ۳. ثبت سفارش اولیه در جدول orders
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: session.user.id,
          address_id: addrData.id,
          total_amount: cartTotal,
          status: 'pending',
          payment_status: 'unpaid'
        })
        .select()
        .single();

      if (orderError) throw new Error('خطا در ثبت سفارش: ' + orderError.message);

      // ۴. ثبت آیتم‌های سفارش
      const orderItemsData = cartItems.map(item => ({
        order_id: orderData.id,
        product_id: item.product.id,
        quantity: item.quantity,
        price: item.product.discount_percentage 
          ? item.product.price * (1 - item.product.discount_percentage / 100) 
          : item.product.price
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItemsData);
      if (itemsError) throw new Error('خطا در ثبت جزئیات سفارش: ' + itemsError.message);

      // ۵. فراخوانی API درگاه پرداخت بیت‌پی (BitPay)
      const payRes = await fetch('/api/payment/initiate-bitpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: cartTotal,
          factorId: orderData.id, // آیدی سفارش برای پیگیری
          userId: session.user.id,
          redirectUrl: `${window.location.origin}/api/payment/callback`
        }),
      });

      const payData = await payRes.json();

      if (payRes.ok && payData.paymentUrl) {
        // انتقال مستقیم کاربر به صفحه پرداخت بانک
        window.location.href = payData.paymentUrl;
      } else {
        throw new Error(payData.message || 'خطا در اتصال به درگاه پرداخت');
      }

    } catch (error: any) {
      console.error('Checkout Error:', error);
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-10 font-sans" dir="rtl">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* فرم مشخصات (سمت راست) */}
        <div className="lg:col-span-7 space-y-8">
          <section className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-sm">
            <h2 className="text-2xl font-black text-gray-800 dark:text-white mb-8 flex items-center gap-3">
              <MapPin className="text-indigo-600" /> اطلاعات گیرنده و آدرس
            </h2>
            
            <form id="checkout-form" onSubmit={handleCheckout} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-600 dark:text-gray-400 mr-2">نام و نام خانوادگی</label>
                <div className="relative">
                  <User className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5" />
                  <input 
                    required 
                    name="full_name" 
                    value={formData.full_name} 
                    onChange={handleInputChange} 
                    className="w-full pr-12 pl-4 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all text-gray-800 dark:text-white" 
                    placeholder="نام گیرنده..." 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-600 dark:text-gray-400 mr-2">شماره تماس (جهت هماهنگی)</label>
                <div className="relative">
                  <Phone className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5" />
                  <input 
                    required 
                    name="phone" 
                    value={formData.phone} 
                    onChange={handleInputChange} 
                    className="w-full pr-12 pl-4 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all text-left font-mono" 
                    placeholder="09123456789" 
                  />
                </div>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-bold text-gray-600 dark:text-gray-400 mr-2">آدرس دقیق پستی</label>
                <textarea 
                  required 
                  name="address" 
                  value={formData.address} 
                  onChange={handleInputChange} 
                  rows={3} 
                  className="w-full p-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all text-gray-800 dark:text-white" 
                  placeholder="استان، شهر، خیابان، پلاک، واحد..." 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-600 dark:text-gray-400 mr-2">کد پستی</label>
                <input 
                  required 
                  name="postal_code" 
                  value={formData.postal_code} 
                  onChange={handleInputChange} 
                  className="w-full px-4 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all text-left font-mono" 
                  placeholder="1234567890" 
                />
              </div>
            </form>
          </section>

          <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-3xl flex items-start gap-4 border border-indigo-100 dark:border-indigo-800/30">
            <ShieldCheck className="text-indigo-600 mt-1 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-indigo-900 dark:text-indigo-200">پرداخت امن و تضمین شده</p>
              <p className="text-xs text-indigo-700/70 dark:text-indigo-300/60 mt-1">تمامی تراکنش‌ها از درگاه رسمی بانکی و با پروتکل امن SSL انجام می‌شود.</p>
            </div>
          </div>
        </div>

        {/* خلاصه سبد خرید (سایدبار سمت چپ) */}
        <aside className="lg:col-span-5">
          <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white sticky top-10 shadow-2xl">
            <h3 className="text-xl font-black mb-6 flex items-center gap-2">
              <ShoppingBag className="text-indigo-400" /> اقلام سفارش
            </h3>
            
            <div className="space-y-4 max-h-[350px] overflow-y-auto mb-8 pr-2 custom-scrollbar border-b border-white/10 pb-6">
              {cartItems.map((item) => (
                <div key={item.product.id} className="flex items-center gap-4 bg-white/5 p-3 rounded-2xl border border-white/5 transition-hover hover:bg-white/10">
                  <div className="w-16 h-16 relative rounded-xl overflow-hidden bg-white/10">
                    {item.product.image_url ? (
                      <Image src={item.product.image_url} alt="" fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-700 flex items-center justify-center text-[10px]">بدون عکس</div>
                    )}
                  </div>
                  <div className="flex-grow">
                    <p className="text-sm font-bold line-clamp-1">{item.product.name}</p>
                    <p className="text-xs text-gray-400">{item.quantity} عدد</p>
                  </div>
                  <p className="text-sm font-black text-indigo-300">
                    {formatToToman((item.product.discount_percentage ? item.product.price * (1 - item.product.discount_percentage / 100) : item.product.price) * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-2 space-y-4">
              <div className="flex justify-between text-gray-400 text-sm">
                <span>هزینه ارسال:</span>
                <span className="text-green-400 flex items-center gap-1"><Truck size={14}/> رایگان (ویژه امروز)</span>
              </div>
              <div className="flex justify-between text-2xl font-black">
                <span>مبلغ نهایی:</span>
                <span className="text-indigo-400">{formatToToman(cartTotal)}</span>
              </div>
            </div>

            <button 
              type="submit" 
              form="checkout-form"
              disabled={isSubmitting || cartItems.length === 0}
              className="w-full mt-8 bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-700 text-white py-5 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-500/20 active:scale-95"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  <CreditCard /> پرداخت و ثبت نهایی
                </>
              )}
            </button>
            <p className="text-[10px] text-center text-gray-500 mt-4 italic">پس از کلیک، به درگاه بانکی منتقل خواهید شد.</p>
          </div>
        </aside>
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-600" size={40} /></div>}>
      <CheckoutContent />
    </Suspense>
  );
}