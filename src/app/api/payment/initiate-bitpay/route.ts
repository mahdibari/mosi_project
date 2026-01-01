// app/api/payment/initiate-bitpay/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { amount, factorId, redirectUrl } = await request.json();

    console.log('Initiate API: Received params:', { amount, factorId, redirectUrl });

    if (!amount || !factorId || !redirectUrl) {
      return NextResponse.json({ message: 'Missing required fields.' }, { status: 400 });
    }

    const BITPAY_API_KEY = process.env.BITPAY_API_KEY;
    if (!BITPAY_API_KEY) {
      return NextResponse.json({ message: 'Server configuration error: API Key missing.' }, { status: 500 });
    }

    // آدرس ارسال به بیت‌پی
    const bitpaySendUrl = 'https://bitpay.ir/payment/gateway-send';

    const formData = new URLSearchParams();
    formData.append('api', BITPAY_API_KEY);
    // تبدیل تومان به ریال (چون معمولا دیتابیس تومان است و درگاه ریال میخواهد)
    formData.append('amount', (amount * 10).toString()); 
    formData.append('redirect', redirectUrl);
    formData.append('factorId', factorId.toString());
    // می‌توانید نام و ایمیل کاربر را هم اینجا اضافه کنید طبق مستندات

    const response = await fetch(bitpaySendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    const responseText = await response.text();
    console.log('Initiate API: Raw BitPay response:', responseText);

    const idGet = parseInt(responseText, 10);

    // بررسی خطاهای بیت‌پی
    if (isNaN(idGet) || idGet <= 0) {
      let errorMessage = 'خطا در برقراری ارتباط با درگاه پرداخت.';
      if (idGet === -1) errorMessage = 'API Key نامعتبر است.';
      if (idGet === -2) errorMessage = 'مبلغ نامعتبر است.';
      if (idGet === -3) errorMessage = 'آدرس بازگشت (Redirect) نامعتبر است.';
      if (idGet === -4) errorMessage = 'درگاه یافت نشد یا در حال انتظار است.';
      
      console.error('Initiate API Error:', errorMessage);
      return NextResponse.json({ message: errorMessage, bitpayResponse: responseText }, { status: 500 });
    }

    // ساخت لینک پرداخت
    const bitpayRedirectUrl = `https://bitpay.ir/payment/gateway-${idGet}-get`;
    
    return NextResponse.json({ success: true, bitpayRedirectUrl });

  } catch (error: any) {
    console.error('Initiate API Exception:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}