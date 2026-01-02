import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const { amount, factorId, redirectUrl, userId } = await request.json();

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // ۱. ارسال به بیت‌پی (تبدیل تومان به ریال)
    const formData = new URLSearchParams();
    formData.append('api', process.env.BITPAY_API_KEY!);
    formData.append('amount', (Number(amount) * 10).toString()); 
    formData.append('redirect', redirectUrl);
    formData.append('factorId', factorId); // اینجا UUID سفارش رو می‌فرستیم

    const response = await fetch('https://bitpay.ir/payment/gateway-send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
    });

    const responseText = await response.text();
    const idGet = parseInt(responseText, 10);

    if (isNaN(idGet) || idGet <= 0) {
       return NextResponse.json({ message: 'خطا در اتصال به درگاه', code: responseText }, { status: 500 });
    }

    // ۲. ثبت یا آپدیت سفارش در دیتابیس با id_get (برای اینکه موقع برگشت پیداش کنیم)
    await supabaseAdmin
      .from('orders')
      .update({
         id_get: idGet.toString(),
        status: 'pending'
        
         })
      .eq('id', factorId);

    const bitpayRedirectUrl = `https://bitpay.ir/payment/gateway-${idGet}-get`;
    return NextResponse.json({ success: true, bitpayRedirectUrl });

  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}