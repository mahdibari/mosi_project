// app/api/payment/verify/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const trans_id = searchParams.get('trans_id'); // [cite: 57]
  const id_get = searchParams.get('id_get'); // [cite: 57]

  if (!trans_id || !id_get) {
    return NextResponse.redirect(new URL('/checkout/result?status=failed', req.url));
  }

  try {
    // 1. استعلام وضعیت تراکنش از BitPay [cite: 59, 61]
    const verifyRes = await fetch("https://bitpay.ir/payment/gateway-result-second", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        api: process.env.BITPAY_API_KEY!,
        trans_id: trans_id,
        id_get: id_get,
        json: "1" // دریافت خروجی به صورت JSON [cite: 61]
      })
    });

    const result = await verifyRes.json();

    // 2. اگر پرداخت موفق بود (status: 1) [cite: 63]
    if (result.status === 1) {
      const orderId = result.factorId; // شماره فاکتور برگشتی [cite: 63]

      // 3. آپدیت وضعیت سفارش در دیتابیس Supabase 
      const { error: updateError } = await supabase
        .from('orders')
        .update({ 
          status: 'paid' // تغییر وضعیت سفارش در جدول orders
        })
        .eq('id', orderId);

      if (updateError) throw updateError;

      // هدایت کاربر به صفحه موفقیت آمیز در فرانت‌اند
      return NextResponse.redirect(new URL(`/checkout/result?status=success&orderId=${orderId}`, req.url));
    } else {
      // پرداخت ناموفق (Status غیر از 1) [cite: 63]
      return NextResponse.redirect(new URL('/checkout/result?status=failed', req.url));
    }
  } catch (error) {
    console.error("Payment Verification Error:", error);
    return NextResponse.redirect(new URL('/checkout/result?status=error', req.url));
  }
}