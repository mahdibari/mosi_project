import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const trans_id = searchParams.get('trans_id');
  const id_get = searchParams.get('id_get');

  if (!trans_id || !id_get) {
    return NextResponse.redirect(new URL('/checkout?status=failed', request.url));
  }

  try {
    // ایجاد کلاینت ادمین برای دور زدن محدودیت‌های لاگین
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! 
    );

    const BITPAY_API_KEY = process.env.BITPAY_API_KEY;
    
    // تاییدیه گرفتن از بیت‌پی
    const verifyResponse = await fetch('https://bitpay.ir/payment/gateway-result-second', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ api: BITPAY_API_KEY!, id_get, trans_id }).toString(),
    });

    const result = await verifyResponse.json();
    const orderId = result.factorId || result.order_id;

    // اگر پرداخت موفق بود (status == 1)
    if (Number(result.status) === 1 && orderId) {
      const { error } = await supabaseAdmin
        .from('orders')
        .update({ 
          status: 'paid',               // ذخیره وضعیت به انگلیسی
          payment_status: 'success',    // ذخیره وضعیت پرداخت به انگلیسی
          trans_id: trans_id 
        })
        .eq('id', orderId); // مطابقت با UUID

      if (error) {
        console.error("DB Update Error:", error.message);
        return NextResponse.redirect(new URL('/checkout?status=failed&reason=db_error', request.url));
      }

      return NextResponse.redirect(new URL('/checkout?status=success', request.url));
    }

    return NextResponse.redirect(new URL('/checkout?status=failed', request.url));

  } catch (error) {
    return NextResponse.redirect(new URL('/checkout?status=failed', request.url));
  }
}