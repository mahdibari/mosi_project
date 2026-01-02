import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// جلوگیری از کش شدن در نکست
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const trans_id = searchParams.get('trans_id');
  const id_get = searchParams.get('id_get');

  // ۱. چک کردن پارامترهای اولیه
  if (!trans_id || !id_get) {
    return NextResponse.json({ error: 'پارامترهای trans_id یا id_get از سمت درگاه نیامد.' }, { status: 400 });
  }

  try {
    // ۲. اتصال با دسترسی کامل ادمین (Service Role)
    // اگر این کلید رو توی Env نذاری، کار نمی‌کنه!
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'کلید SUPABASE_SERVICE_ROLE_KEY در تنظیمات سرور یافت نشد.' }, { status: 500 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );

    // ۳. استعلام وضعیت از بیت‌پی
    const verifyResponse = await fetch('https://bitpay.ir/payment/gateway-result-second', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        api: process.env.BITPAY_API_KEY!,
        id_get,
        trans_id,
      }).toString(),
    });

    const result = await verifyResponse.json();

    // ۴. لاگ کردن نتیجه برای دیباگ (اگه خواستی بعدا پاک کن)
    console.log('BitPay Result:', result);

    // ۵. بررسی وضعیت پرداخت
    if (result.status == 1) {
      const orderId = result.factorId || result.order_id;

      if (!orderId) {
         return NextResponse.json({ error: 'درگاه پرداخت هیچ آیدی سفارشی (factorId) برنگرداند.' });
      }

      console.log(`تلاش برای آپدیت سفارش با آیدی: ${orderId}`);

      // ۶. آپدیت دیتابیس (بخش حیاتی)
      const { data, error } = await supabaseAdmin
        .from('orders')
        .update({
          status: 'paid',             // اینجا زدیم paid
          payment_status: 'success',  // اینجا زدیم success
          trans_id: trans_id.toString()
        })
        .eq('id', orderId)
        .select();

      // ۷. بررسی دقیق خطای دیتابیس
      if (error) {
        console.error('DB Error:', error);
        return NextResponse.json({ 
          status: 'Failed to Update DB', 
          db_error: error.message, 
          hint: 'فرمت ID اشتباه است یا دسترسی دیتابیس بسته است.' 
        });
      }

      // چک کنیم آیا اصلاً ردیفی پیدا شد که آپدیت بشه؟
      if (!data || data.length === 0) {
        return NextResponse.json({ 
          status: 'Row Not Found', 
          message: `سفارشی با آیدی ${orderId} در دیتابیس پیدا نشد.`,
          hint: 'آیا موقع ساخت لینک پرداخت، آیدی درست (UUID) را به factorId دادید؟'
        });
      }

      // ۸. موفقیت کامل! حالا برو به صفحه موفقیت
      return NextResponse.redirect(new URL('/payment-result?status=success&ref=' + trans_id, request.url));
      
    } else {
      return NextResponse.json({ error: 'پرداخت توسط درگاه تایید نشد.', bitpay_status: result.status });
    }

  } catch (err: any) {
    return NextResponse.json({ error: 'Server Crash', details: err.message }, { status: 500 });
  }
}