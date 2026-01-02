'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  Search, Package, Truck, CheckCircle2, Clock, 
  AlertCircle, MapPin, Calendar, CreditCard, ShieldCheck, Loader2
} from 'lucide-react';
import Link from 'next/link';

export default function TrackOrder() {
  const router = useRouter();
  const [trackingId, setTrackingId] = useState('');
  const [order, setOrder] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [error, setError] = useState('');

  // بررسی وضعیت ورود کاربر
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // اگر کاربر لاگین نکرده بود، بعد از ۲ ثانیه به صفحه لاگین برود
        setError('برای پیگیری سفارش باید ابتدا وارد حساب کاربری خود شوید.');
        setTimeout(() => {
          router.push('/auth/login');
        }, 2000);
      } else {
        setAuthLoading(false);
      }
    };
    checkUser();
  }, [router]);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingId) return;
    setLoading(true);
    setError('');

    // جستجو بر اساس trans_id یا id_get
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .or(`trans_id.eq.${trackingId.trim()},id_get.eq.${trackingId.trim()}`)
      .single();

    if (orderError || !orderData) {
      setError('سفارشی یافت نشد. لطفاً شماره تراکنش معتبر وارد کنید.');
      setOrder(null);
      setLoading(false);
      return;
    }

    const { data: historyData } = await supabase
      .from('order_status_history')
      .select('*')
      .eq('order_id', orderData.id)
      .order('created_at', { ascending: false });

    setOrder(orderData);
    setHistory(historyData || []);
    setLoading(false);
  };

  const getCurrentStep = () => {
    if (order.delivery_done) return 4;
    if (order.shipping_done) return 3;
    if (order.preparing_done) return 2;
    if (order.status === 'SUCCESS' || order.payment_status === 'SUCCESS') return 1;
    return 0;
  };

  // حالت در حال بارگذاری اولیه (بررسی Auth)
  if (authLoading && !error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
        <p className="text-gray-500 font-medium">در حال بررسی دسترسی...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] py-12 px-4 font-[vazir]">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-gray-800 mb-2">رهگیری هوشمند سفارش</h1>
          <p className="text-gray-500">مشاهده آخرین وضعیت پردازش و ارسال مرسوله</p>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-100 text-red-600 p-6 rounded-2xl flex items-center gap-3 animate-pulse max-w-xl mx-auto shadow-sm">
            <AlertCircle /> 
            <span className="font-bold">{error}</span>
          </div>
        ) : (
          <>
            <form onSubmit={handleTrack} className="flex gap-2 max-w-xl mx-auto mb-12">
              <input
                type="text"
                placeholder="شماره تراکنش (مثلاً 33897539)"
                className="flex-1 p-4 rounded-2xl border-2 border-white shadow-lg outline-none focus:border-indigo-500 text-center font-bold text-xl"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
              />
              <button className="bg-indigo-600 text-white px-8 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg">
                {loading ? '...' : 'رهگیری'}
              </button>
            </form>

            {order && (
              <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
                {/* بخش نمایش قیمت اصلاح شده */}
                <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                  <div>
                    <CreditCard className="mx-auto text-indigo-500 mb-2" size={20} />
                    <p className="text-gray-400 text-xs">مبلغ کل</p>
                    <p className="font-bold text-indigo-600">
                      {Number(order.total_amount || 0).toLocaleString()} تومان
                    </p>
                  </div>
                  <div className="border-x border-gray-100">
                    <Calendar className="mx-auto text-indigo-500 mb-2" size={20} />
                    <p className="text-gray-400 text-xs">تاریخ ثبت</p>
                    <p className="font-bold">{new Date(order.created_at).toLocaleDateString('fa-IR')}</p>
                  </div>
                  <div>
                    <MapPin className="mx-auto text-indigo-500 mb-2" size={20} />
                    <p className="text-gray-400 text-xs">کد رهگیری پستی</p>
                    <p className="font-bold text-sm text-gray-700">{order.tracking_code || 'در انتظار ثبت'}</p>
                  </div>
                </div>

                {/* استپر وضعیت بر اساس ستون های جدید دیتابیس */}
                <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-gray-100">
                  <div className="relative flex justify-between mb-16 px-4">
                    <div className="absolute top-6 left-0 w-full h-1 bg-gray-100 -z-0"></div>
                    <div 
                      className="absolute top-6 left-0 h-1 bg-green-500 transition-all duration-1000 z-0 shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                      style={{ width: `${((getCurrentStep() - 1) / 3) * 100}%` }}
                    ></div>

                    {[
                      { id: 1, icon: Clock, label: 'تایید پرداخت' },
                      { id: 2, icon: Package, label: 'آماده‌سازی' },
                      { id: 3, icon: Truck, label: 'تحویل پست' },
                      { id: 4, icon: CheckCircle2, label: 'تکمیل شده' }
                    ].map((s) => (
                      <div key={s.id} className="relative z-10 flex flex-col items-center">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-4 transition-all duration-500 ${
                          getCurrentStep() >= s.id ? 'bg-green-500 border-green-50 text-white shadow-lg scale-110' : 'bg-white border-gray-50 text-gray-300'
                        }`}>
                          <s.icon size={22} />
                        </div>
                        <span className={`text-xs mt-4 font-bold ${getCurrentStep() >= s.id ? 'text-gray-800' : 'text-gray-300'}`}>{s.label}</span>
                      </div>
                    ))}
                  </div>

                  {/* تاریخچه تفصیلی وضعیت ها */}
                  <div className="space-y-6 pt-6 border-t border-gray-50">
                    <h3 className="font-black text-gray-800 flex items-center gap-2">
                      <div className="w-2 h-6 bg-indigo-600 rounded-full shadow-lg shadow-indigo-200"></div>
                      جزئیات پردازش سفارش
                    </h3>
                    {history.length > 0 ? history.map((h, index) => (
                      <div key={h.id} className="flex gap-4 group">
                        <div className="flex flex-col items-center">
                          <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-indigo-600 animate-ping' : 'bg-gray-200'}`}></div>
                          {index !== history.length - 1 && <div className="w-0.5 flex-1 bg-gray-100 my-1"></div>}
                        </div>
                        <div className="pb-6">
                          <p className="font-bold text-gray-800 text-sm">{h.status_title}</p>
                          <p className="text-[10px] text-gray-400 mb-2">{new Date(h.created_at).toLocaleString('fa-IR')}</p>
                          <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-xl border border-gray-100 leading-relaxed italic">{h.description}</p>
                        </div>
                      </div>
                    )) : (
                      <p className="text-center text-gray-400 text-sm italic py-4">در حال حاضر جزئیات بیشتری ثبت نشده است.</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}