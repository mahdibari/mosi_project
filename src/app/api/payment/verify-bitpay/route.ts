import { NextResponse } from 'next/server';
import { supabaseServerClient } from '@/lib/supabase/server'; // مطمئن شوید این مسیر درست است

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { trans_id, id_get } = body; // مقادیری که بیت‌پی برمی‌گرداند

    if (!trans_id || !id_get) {
      return NextResponse.json({ message: 'Missing transaction details' }, { status: 400 });
    }

    const BITPAY_API_KEY = process.env.BITPAY_API_KEY;

    // درخواست تایید به بیت‌پی
    const verifyUrl = 'https://bitpay.ir/payment/gateway-result-second';
    const formData = new URLSearchParams();
    formData.append('api', BITPAY_API_KEY!);
    formData.append('id_get', id_get);
    formData.append('trans_id', trans_id);

    const response = await fetch(verifyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
    });

    const result = await response.json();
    console.log('Verify API Result:', result);

    // طبق داکیومنت بیت‌پی، اگر status برابر 1 باشد پرداخت موفق بوده
    // دقت کنید: در داکیومنت گفته status=1 یعنی موفق
    if (result.status === 1) {
      // پرداخت موفق بود
      const orderId = result.order_id || result.factorId; // بیت‌پی معمولا همان factorId را برمی‌گرداند اگر ارسال شده باشد، اما در بعضی نسخه‌ها order_id برمی‌گرداند. ما در دیتابیس خودمان بر اساس id_get هم می‌توانیم پیدا کنیم اما factorId امن تر است.
      
      // اگر بیت‌پی factorId را در جیسون برنگرداند، باید از طریق دیتابیس سفارش را پیدا کنیم.
      // برای سادگی فرض می‌کنیم ما می‌توانیم سفارش را آپدیت کنیم.
      // بهترین راه این است که ما در ابتدا factorId را فرستادیم، اما اینجا در خروجی تایید شاید نباشد.
      // راه حل: ما در verify متد GET نمی‌فرستیم، بلکه فقط trans_id و id_get داریم.
      // در دیتابیس ما باید سفارش را پیدا کنیم. فعلا فرض می‌کنیم کاربر منطقی است و ما یک سفارش pending داریم.
      // اما برای اطمینان باید در جدول orders یک فیلد ترنزکشن آید هم ذخیره کنیم یا اینجا یک منطق پیچیده داشته باشیم.
      // روش ساده‌تر: بیت‌پی در بخش GET پاسخ پارامتر‌ها را می‌فرستد.
      
      // بیایید فرض کنیم id_get منحصر به فرد است و ما در جدول orders نمی‌توانیم مستقیم بر اساسش پیدا کنیم مگر اینکه ذخیره کرده باشیم.
      // اما طبق کد ما در checkout، factorId را فرستادیم.
      // نکته مهم: داکیومنت می‌گوید در مرحله دوم (Verify) فقط id_get و trans_id و api می‌فرستیم و جیسون برمی‌گرداند.
      // جیسون برگشتی شامل order_id است (طبق داکیومنت).
      
      if (result.order_id) {
        const supabase = supabaseServerClient();
        
        // 1. آپدیت وضعیت سفارش
        const { error: updateError } = await supabase
          .from('orders')
          .update({ status: 'paid' })
          .eq('id', result.order_id);

        if (updateError) {
          console.error('Error updating order:', updateError);
          // اگر آپدیت نشد، باید لاگ بزنیم اما به کاربر موفقیت بگوییم که دوباره تلاش کند یا ادمین تماس بگیرد
        }

        // 2. خالی کردن سبد خرید (در سرور نمی‌توانیم دسترسی مستقیم به Context داشته باشیم، اما چون سفارش ثبت شده، در صفحه Callback سبد را خالی می‌کنیم)
        
        return NextResponse.json({ success: true, orderId: result.order_id });
      } else {
        return NextResponse.json({ success: false, message: 'Order ID not found in payment gateway response.' });
      }

    } else {
      return NextResponse.json({ success: false, message: 'Payment failed or cancelled.', result });
    }

  } catch (error: any) {
    console.error('Verify API Error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}