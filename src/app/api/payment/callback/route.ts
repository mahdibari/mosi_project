import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const trans_id = searchParams.get('trans_id');
  const id_get = searchParams.get('id_get');

  // اگر پارامترها نبود، کاربر را به صفحه خطا بفرست
  if (!trans_id || !id_get) {
    // هدایت به صفحه اصلی با پارامتر خطا (یا یک صفحه خطای سفارشی)
    return NextResponse.redirect(new URL('/?error=missing_payment_params', request.url));
  }

  try {
    // فراخوانی فایل verify-bitpay در داخل سرور برای تایید نهایی تراکنش
    // باید آدرس کامل سایت خود را داشته باشید. 
    // اگر در لوکال هستید http://localhost:3000 و اگر روی هاست است دامنه سایت.
    // روش بهتر: استفاده از هدر درخواست فعلی برای ساخت آدرس
    const baseUrl = request.headers.get('host') || '';
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const verifyUrl = `${protocol}://${baseUrl}/api/payment/verify-bitpay`;

    const verifyResponse = await fetch(verifyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trans_id, id_get }),
    });

    const verifyData = await verifyResponse.json();

    if (verifyData.success) {
      // اگر پرداخت موفق بود، کاربر را به صفحه "موفقیت" هدایت کن
      // می‌توانید orderId را هم به صفحه بفرستید
      return NextResponse.redirect(new URL('/checkout?status=success', request.url));
    } else {
      // اگر پرداخت ناموفق بود (یا تقلبی بوده)
      console.error('Payment verification failed:', verifyData.message);
      return NextResponse.redirect(new URL('/checkout?status=failed', request.url));
    }

  } catch (error) {
    console.error('Callback Error:', error);
    return NextResponse.redirect(new URL('/checkout?status=error', request.url));
  }
}