import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const { amount, factorId, redirectUrl, cartItems, userId, addressId } = await request.json();

    // ۱. چک کردن متغیرهای محیطی
    const BITPAY_API_KEY = process.env.BITPAY_API_KEY;
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! // حتما این کلید رو توی ورسل ست کن
    );

    // ۲. ثبت اولیه سفارش در دیتابیس (این همون بخشیه که نداشتی)
    // اگه از قبل سفارش رو ثبت کردی، این بخش رو رد کن، ولی اگه نه، اینجا باید ثبت شه
    const { error: dbError } = await supabaseAdmin
      .from('orders')
      .insert([{
        id: factorId, // همون UUID که از کلاینت میاد
        user_id: userId,
        total_price: amount,
        status: 'pending',
        payment_status: 'pending'
      }]);

    if (dbError) {
      console.error('Database Insert Error:', dbError.message);
      // اگر ارور "duplicate" داد یعنی سفارش قبلا ثبت شده، پس ادامه بده
    }

    // ۳. ارسال درخواست به بیت‌پی
    const formData = new URLSearchParams();
    formData.append('api', BITPAY_API_KEY!);
    formData.append('amount', (amount * 10).toString()); // تبدیل به ریال
    formData.append('redirect', redirectUrl);
    formData.append('factorId', factorId); // ارسال UUID به درگاه

    const response = await fetch('https://bitpay.ir/payment/gateway-send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
    });

    const responseText = await response.text();
    const idGet = parseInt(responseText, 10);

    if (isNaN(idGet) || idGet <= 0) {
      return NextResponse.json({ message: 'خطا در درگاه: ' + responseText }, { status: 500 });
    }

    const bitpayRedirectUrl = `https://bitpay.ir/payment/gateway-${idGet}-get`;
    return NextResponse.json({ success: true, bitpayRedirectUrl });

  } catch (error: any) {
    return NextResponse.json({ message: 'Internal Error', error: error.message }, { status: 500 });
  }
}