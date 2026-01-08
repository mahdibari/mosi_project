import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, factorId, redirectUrl } = body;

    // 1. بررسی وجود داده‌های ضروری
    if (!amount || !factorId) {
      return NextResponse.json({ 
        success: false, 
        message: 'اطلاعات ناقص است (amount یا factorId ارسال نشده)' 
      }, { status: 400 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    console.log(`[Payment] درخواست برای سفارش ${factorId} با مبلغ ${amount}`);

    // 2. ارسال به درگاه بیت‌پی
    const formData = new URLSearchParams();
    formData.append('api', process.env.BITPAY_API_KEY!);
    // تبدیل تومان به ریال
    formData.append('amount', (Number(amount) * 10).toString()); 
    formData.append('redirect', redirectUrl);
    formData.append('factorId', factorId);

    // تنظیم تایم‌اوت برای اتصال به بیت‌پی (خیلی مهم برای جلوگیری از هنگ کردن سرور)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 ثانیه

    console.log('[Payment] در حال اتصال به درگاه بیت‌پی...');
    
    const response = await fetch('https://bitpay.ir/payment/gateway-send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
      signal: controller.signal
    });

    clearTimeout(timeoutId); // اگر پاسخ سریع آمد، تایمر را پاک کن

    if (!response.ok) {
      console.error('[Payment] خطای اتصال به بیت‌پی:', response.status);
      return NextResponse.json({ 
        success: false, 
        message: 'خطا در ارتباط با درگاه پرداخت (Bitpay). وضعیت شبکه: ' + response.status 
      }, { status: 500 });
    }

    const responseText = await response.text();
    console.log('[Payment] پاسخ خام بیت‌پی:', responseText);

    const idGet = parseInt(responseText, 10);

    // بررسی اینکه آیا بیت‌پی یک ID معتبر داده یا ارور
    if (isNaN(idGet) || idGet <= 0) {
       console.error('[Payment] ID معتبر نیست:', responseText);
       return NextResponse.json({ 
         success: false, 
         message: `خطای درگاه پرداخت: کد خطا ${responseText}. لطفا پارامترهای مبلغ و کلید API را بررسی کنید.` 
       }, { status: 500 });
    }

    // 3. آپدیت سفارش در دیتابیس با id_get دریافتی
    console.log('[Payment] آپدیت سفارش با ID_GET:', idGet);
    
    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({ id_get: idGet.toString(), status: 'pending' })
      .eq('id', factorId);

    if (updateError) {
      console.error('[Payment] خطای دیتابیس:', updateError);
      // اگر دیتابیس آپدیت نشد، خرید را ادامه ندهید چون بعدا نمی‌توانیم وضعیت را چک کنیم
      return NextResponse.json({ 
        success: false, 
        message: 'خطا در ثبت اطلاعات در دیتابیس' 
      }, { status: 500 });
    }

    // 4. بازگرداندن آدرس ریدایرکت
    const bitpayRedirectUrl = `https://bitpay.ir/payment/gateway-${idGet}-get`;
    console.log('[Payment] موفقیت آمیز. آدرس:', bitpayRedirectUrl);

    return NextResponse.json({ success: true, bitpayRedirectUrl });

  } catch (error: any) {
    console.error('[Payment] خطای کریتیکال در سرور:', error);
    
    // اگر خطا مربوط به Abort باشد (تایم اوت)
    if (error.name === 'AbortError') {
        return NextResponse.json({ 
          success: false, 
          message: 'زمان اتصال به درگاه بانکی تمام شد (Timeout). دیتابیس بیت‌پی پاسخ نداد.' 
        }, { status: 504 });
    }

    return NextResponse.json({ 
      success: false, 
      message: 'خطای داخلی سرور: ' + (error.message || 'Unknown Error') 
    }, { status: 500 });
  }
}