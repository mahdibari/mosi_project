// app/api/payment/initiate-bitpay/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { amount, factorId, redirectUrl, description } = await request.json();

    // لاگ برای دیباگ: مقادیر دریافتی از صفحه checkout
    console.log('Initiate API: Received params from checkout:', { amount, factorId, redirectUrl, description });

    if (!amount || !factorId || !redirectUrl) {
      console.error('Initiate API Error: Missing amount, factorId, or redirectUrl in request body.');
      return NextResponse.json({ message: 'Amount, factorId, and redirectUrl are required.' }, { status: 400 });
    }

    const BITPAY_API_KEY = process.env.BITPAY_API_KEY!;
    if (!BITPAY_API_KEY) {
      console.error('Initiate API Error: BITPAY_API_KEY is not defined.');
      return NextResponse.json({ message: 'BitPay API Key is not configured on the server.' }, { status: 500 });
    }

    const bitpaySendUrl = 'https://bitpay.ir/payment/gateway-send';

    const encodedRedirectUrl = encodeURIComponent(redirectUrl);

    const formData = new URLSearchParams();
    formData.append('api', BITPAY_API_KEY);
    formData.append('amount', (amount * 10).toString()); // تبدیل مبلغ از تومان به ریال
    formData.append('redirect', encodedRedirectUrl);
    formData.append('factorId', factorId.toString());
    if (description) {
      formData.append('description', description);
    }

    // لاگ برای دیباگ: اطلاعات ارسالی به BitPay
    console.log('Initiate API: Sending to BitPay:', formData.toString());

    const response = await fetch(bitpaySendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    const responseText = await response.text();
    // لاگ برای دیباگ: پاسخ خام از BitPay
    console.log('Initiate API: Raw response from BitPay:', responseText);

    const idGet = parseInt(responseText, 10);

    if (isNaN(idGet) || idGet <= 0) {
      let errorMessage = 'خطا در دریافت شناسه پرداخت از BitPay.';
      if (idGet === -1) errorMessage = 'API کلید نامعتبر است.';
      if (idGet === -2) errorMessage = 'مبلغ نامعتبر است (کمتر از 1000 ریال).';
      if (idGet === -3) errorMessage = 'آدرس بازگشت (redirect) نامعتبر است.';
      if (idGet === -4) errorMessage = 'درگاه با اطلاعات ارسالی شما وجود ندارد یا در حالت انتظار است.';
      if (idGet === -10) errorMessage = 'خطا در اتصال به درگاه. لطفاً مجدداً تلاش کنید.';

      console.error('Initiate API Error: BitPay initiation failed. Response:', responseText);
      return NextResponse.json({ message: errorMessage, bitpayResponse: responseText }, { status: 500 });
    }

    const bitpayRedirectUrl = `https://bitpay.ir/payment/gateway-${idGet}-get`;
    console.log('Initiate API: Redirect URL generated:', bitpayRedirectUrl);

    return NextResponse.json({ success: true, bitpayRedirectUrl });

  } catch (error: any) {
    console.error('Initiate API Error: Exception during payment initiation process:', error);
    return NextResponse.json({ message: 'Internal server error.', error: error.message }, { status: 500 });
  }
}