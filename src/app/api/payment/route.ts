// File: app/api/payment/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// ایجاد کلاینت سوپابیس با استفاده از Service Role Key (اگر دارید) یا کلاینت عادی
// توجه: در اینجا برای سادگی از کلاینت معمولی استفاده می‌کنیم، اما در پروداکشن بهتر است از Service Role برای آپدیت بدون محدودیت RLS استفاده کنید.
import { supabaseServerClient } from '@/lib/supabase/server'; 

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, orderId, amount, trans_id, id_get } = body;

    const apiKey = process.env.BITPAY_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'API Key missing' }, { status: 500 });
    }

    // --- حالت اول: درخواست شروع پرداخت ---
    if (action === 'request') {
      // آدرس بازگشت (Callback) باید کاملاً مشخص باشد
      const redirectUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/payment/result`;
      
      // فرمت دیتای ارسالی به بیت‌پی
      const params = new URLSearchParams();
      params.append('api', apiKey);
      params.append('amount', amount.toString()); // مبلغ به ریال (اگر دیتابیس تومان است *10 کنید)
      params.append('redirect', redirectUrl);
      params.append('factorId', orderId.toString()); // شناسه سفارش شما

      const response = await fetch('https://bitpay.ir/payment/gateway', {
        method: 'POST',
        body: params,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const data = await response.text(); // بیت‌پی معمولاً متن ساده برمی‌گرداند یا ID

      if (!response.ok) {
        console.error('Bitpay Error:', data);
        return NextResponse.json({ error: 'خطا در ارتباط با درگاه پرداخت' }, { status: 500 });
      }

      // اگر همه چیز اوکی بود، بیت‌پی یک id_get برمی‌گرداند
      // لینک انتقال کاربر
      const paymentUrl = `https://bitpay.ir/payment/gateway-${data}-get`;

      return NextResponse.json({ id_get: data, url: paymentUrl });
    }

    // --- حالت دوم: تایید پرداخت (Verify) ---
    if (action === 'verify') {
      const params = new URLSearchParams();
      params.append('api', apiKey);
      params.append('id_get', id_get);
      params.append('trans_id', trans_id);

      const response = await fetch('https://bitpay.ir/payment/gateway-result-second', {
        method: 'POST',
        body: params,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const result = await response.json();

      if (result.status === 1) {
        // پرداخت موفق بود
        // 1. آپدیت وضعیت سفارش در دیتابیس
        const supabase = supabaseServerClient();
        
        const { error: updateError } = await supabase
          .from('orders')
          .update({ status: 'paid' }) // یا هر وضعیتی که برای موفقیت در نظر دارید
          .eq('id', orderId);

        if (updateError) {
          console.error('Error updating order:', updateError);
          return NextResponse.json({ error: 'پرداخت موفق بود اما خطا در ثبت دیتابیس' }, { status: 500 });
        }

        return NextResponse.json({ success: true, data: result });
      } else {
        // پرداخت ناموفق
        return NextResponse.json({ success: false, error: 'تراکنش ناموفق بود' }, { status: 400 });
      }
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Payment API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}