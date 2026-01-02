import { NextResponse } from 'next/server';
import { supabaseServerClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const { trans_id, id_get } = await request.json();
    const BITPAY_API_KEY = process.env.BITPAY_API_KEY;

    // ۱. استعلام مجدد از درگاه برای اطمینان ۱۰۰٪
    const verifyUrl = 'https://bitpay.ir/payment/gateway-result-second';
    const response = await fetch(verifyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ api: BITPAY_API_KEY!, id_get, trans_id }).toString(),
    });

    const result = await response.json();
    console.log('BitPay Final Result:', result);

    // ۲. اگر وضعیت ۱ بود یعنی پول واقعاً پرداخت شده
    if (Number(result.status) === 1) {
      const orderId = result.factorId || result.order_id;
      const supabase = supabaseServerClient();

      // ۳. آپدیت دیتابیس با مقادیر انگلیسی طبق درخواست شما
      const { error: dbError } = await supabase
        .from('orders')
        .update({ 
          status: 'paid',             // وضعیت سفارش
          payment_status: 'success',  // وضعیت پرداخت
          trans_id: trans_id.toString() 
        })
        .eq('id', orderId);

      if (dbError) {
        console.error('Database Update Error:', dbError);
        return NextResponse.json({ success: false, message: 'DB Error' });
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, message: 'Payment not verified by BitPay' });

  } catch (error) {
    console.error('Verify Crash:', error);
    return NextResponse.json({ success: false, message: 'Server crash' });
  }
}