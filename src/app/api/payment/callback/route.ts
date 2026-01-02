import { NextResponse } from 'next/server';
import { supabaseServerClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const trans_id = searchParams.get('trans_id');
  const id_get = searchParams.get('id_get');

  // ۱. بررسی وجود پارامترهای بازگشتی از درگاه
  if (!trans_id || !id_get) {
    return NextResponse.redirect(new URL('/checkout?status=failed', request.url));
  }

  try {
    const BITPAY_API_KEY = process.env.BITPAY_API_KEY;
    
    // ۲. استعلام مستقیم از درگاه بیت‌پی (حذف واسطه verify-bitpay)
    const verifyUrl = 'https://bitpay.ir/payment/gateway-result-second';
    const formData = new URLSearchParams();
    formData.append('api', BITPAY_API_KEY || '');
    formData.append('id_get', id_get);
    formData.append('trans_id', trans_id);

    const response = await fetch(verifyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
    });

    const result = await response.json();

    // ۳. اگر وضعیت ۱ باشد یعنی پرداخت در درگاه موفق بوده است
    if (Number(result.status) === 1) {
      const orderId = result.factorId || result.order_id;
      const supabase = supabaseServerClient();

      // ۴. آپدیت دیتابیس با مقادیر انگلیسی طبق خواسته شما
      const { error: updateError } = await supabase
        .from('orders')
        .update({ 
          status: 'paid',               // وضعیت کلی سفارش به انگلیسی [cite: 71]
          payment_status: 'success',    // وضعیت پرداخت به انگلیسی [cite: 71]
          trans_id: trans_id.toString() 
        })
        .eq('id', orderId);

      if (updateError) {
        console.error('Database Update Error:', updateError);
        // حتی اگر دیتابیس آپدیت نشد، چون پول پرداخت شده کاربر را به صفحه موفقیت می‌بریم
      }

      return NextResponse.redirect(new URL('/checkout?status=success', request.url));
    } else {
      // پرداخت در درگاه ناموفق بوده است
      return NextResponse.redirect(new URL('/checkout?status=failed', request.url));
    }

  } catch (error) {
    console.error('Callback Critical Error:', error);
    return NextResponse.redirect(new URL('/checkout?status=failed', request.url));
  }
}