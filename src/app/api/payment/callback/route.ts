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
    // استفاده از Service Role برای دور زدن RLS و مشکل "کاربر یافت نشد"
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! 
    );

    const BITPAY_API_KEY = process.env.BITPAY_API_KEY;
    
    // تاییدیه از درگاه بیت‌پی
    const verifyResponse = await fetch('https://bitpay.ir/payment/gateway-result-second', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ api: BITPAY_API_KEY!, id_get, trans_id }).toString(),
    });

    const result = await verifyResponse.json();
    
    // در اسکیما شما ID از نوع UUID است
    const orderId = result.factorId || result.order_id;

    if (Number(result.status) === 1 && orderId) {
      // آپدیت دیتابیس - وضعیت‌ها به انگلیسی ذخیره می‌شوند
      const { error } = await supabaseAdmin
        .from('orders')
        .update({ 
          status: 'paid',               // موفق به انگلیسی
          payment_status: 'success',    // موفق به انگلیسی
          trans_id: trans_id 
        })
        .eq('id', orderId); // مقایسه UUID با آیدی برگشتی

      if (error) {
        console.error("Database Error:", error.message);
        // اگر باز هم آپدیت نشد، احتمالا بخاطر UUID است
        return NextResponse.redirect(new URL(`/checkout?status=failed&db_error=${error.message}`, request.url));
      }

      return NextResponse.redirect(new URL('/checkout?status=success', request.url));
    }

    return NextResponse.redirect(new URL('/checkout?status=failed', request.url));

  } catch (error) {
    return NextResponse.redirect(new URL('/checkout?status=failed', request.url));
  }
}