// app/api/payment/initiate-bitpay/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseServerClient } from '@/lib/supabase/server'; // از کلاینت سرور استفاده کنید

export async function POST(request: NextRequest) {
  try {
    const supabase = supabaseServerClient();
    const body = await request.json();

    const { amount, name, email, phone, description, factorId, redirectUrl } = body;

    if (!amount || !name || !phone || !factorId || !redirectUrl) {
      return NextResponse.json({ success: false, message: 'پارامترهای ضروری ارسال نشده‌اند.' }, { status: 400 });
    }

    const API_KEY = 'YOUR-BITPAY-API-KEY'; // <<<< کلید API خود را اینجا قرار دهید

    // آماده کردن پارامترها برای Bitpay
    const params = new URLSearchParams();
    params.append('api', API_KEY);
    params.append('amount', amount.toString());
    params.append('redirect', redirectUrl);
    params.append('name', name);
    params.append('email', email);
    params.append('phone', phone);
    params.append('description', description);

    // ارسال درخواست به Bitpay
    const response = await fetch('https://bitpay.ir/payment/gateway-send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    const responseText = await response.text();

    if (responseText.startsWith('-1')) {
      const gatewayUrl = responseText.substring(3);
      const trans_id = gatewayUrl.split('trans_id=')[1];

      // ذخیره trans_id در دیتابیس برای استفاده در callback
      const { error: updateError } = await supabase
        .from('orders')
        .update({ authority: trans_id }) // فرض می‌کنیم ستونی به نام authority دارید
        .eq('id', factorId);

      if (updateError) {
        console.error('Error saving trans_id:', updateError);
        // حتی اگر ذخیره نشد، ادامه بده چون پرداخت شده
      }

      return NextResponse.json({ success: true, bitpayRedirectUrl: gatewayUrl });
    } else {
      return NextResponse.json({ success: false, message: `خطا از درگاه: ${responseText}` }, { status: 400 });
    }

  } catch (error: any) {
    console.error('Error in initiate-bitpay:', error);
    return NextResponse.json({ success: false, message: 'خطای سرور داخلی' }, { status: 500 });
  }
}