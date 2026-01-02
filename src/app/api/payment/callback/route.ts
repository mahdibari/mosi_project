import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// جلوگیری از کش شدن نتیجه در نکست
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const trans_id = searchParams.get('trans_id');
  const id_get = searchParams.get('id_get');

  // ۱. اگر پارامترها نبود، بفرست به صفحه خطا
  if (!trans_id || !id_get) {
    return NextResponse.redirect(new URL('/payment-result?status=failed&msg=no_params', request.url));
  }

  try {
    // ۲. اتصال قدرتمند به دیتابیس (Service Role)
    // این کلید تمام قوانین RLS را نادیده می‌گیرد تا مطمئن شویم آپدیت انجام می‌شود
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!, 
      { auth: { persistSession: false } }
    );

    // ۳. استعلام نهایی از بیت‌پی
    const bitpayResponse = await fetch('https://bitpay.ir/payment/gateway-result-second', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        api: process.env.BITPAY_API_KEY!,
        id_get,
        trans_id,
      }).toString(),
    });

    const result = await bitpayResponse.json();
    console.log('BitPay Result:', result);

    // ۴. تحلیل نتیجه
    if (result.status == 1) {
      const orderUUID = result.factorId || result.order_id;

      // ۵. آپدیت دیتابیس (مهمترین بخش)
      const { error } = await supabaseAdmin
        .from('orders')
        .update({
          status: 'paid',             // وضعیت انگلیسی
          payment_status: 'success',  // وضعیت انگلیسی
          trans_id: trans_id.toString()
        })
        .eq('id', orderUUID); // تطابق با UUID

      if (error) {
        console.error('DB Update Error:', error);
        // حتی اگر دیتابیس ارور داد ولی پول کم شده بود، به کاربر "موفق" نشان بده ولی لاگ بگیر
      }

      // ۶. هدایت به صفحه جدید با پیام موفقیت
      return NextResponse.redirect(new URL(`/payment-result?status=success&ref=${trans_id}`, request.url));
    } else {
      // پرداخت ناموفق بوده
      return NextResponse.redirect(new URL('/payment-result?status=failed&msg=gateway_rejected', request.url));
    }

  } catch (error) {
    console.error('System Error:', error);
    return NextResponse.redirect(new URL('/payment-result?status=failed&msg=server_error', request.url));
  }
}