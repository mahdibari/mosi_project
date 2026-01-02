import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const trans_id = searchParams.get('trans_id');
  const id_get = searchParams.get('id_get');

  // اگر پارامترها نبود
  if (!trans_id || !id_get) {
    return NextResponse.redirect(new URL('/?error=missing_params', request.url));
  }

  try {
    // ساختن آدرس دقیق API تایید داخل سرور
    // استفاده از header برای ساخت آدرس دقیق (http یا https)
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const host = request.headers.get('host');
    const verifyUrl = `${protocol}://${host}/api/payment/verify-bitpay`;

    // ارسال درخواست داخلی به تابع verify
    const verifyResponse = await fetch(verifyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trans_id, id_get }),
    });

    const verifyData = await verifyResponse.json();

    // بررسی نتیجه تایید
    if (verifyData.success) {
      // هدایت به صفحه موفقیت
      return NextResponse.redirect(new URL('/checkout?status=success', request.url));
    } else {
      // هدایت به صفحه شکست (به همراه دلیل خطا برای دیباگ)
      const errorMessage = encodeURIComponent(verifyData.message || 'Unknown error');
      console.error('Callback redirecting to failed:', verifyData);
      return NextResponse.redirect(new URL(`/checkout?status=failed&reason=${errorMessage}`, request.url));
    }

  } catch (error) {
    console.error('Callback Exception:', error);
    return NextResponse.redirect(new URL('/checkout?status=error', request.url));
  }
}