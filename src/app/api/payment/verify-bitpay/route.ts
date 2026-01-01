// app/api/payment/verify-bitpay/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    const { trans_id, id_get, factorId } = await request.json(); // دریافت factorId هم اینجا

    // لاگ برای دیباگ: مقادیر دریافتی از callback
    console.log('Verify API: Received params from callback:', { trans_id, id_get, factorId });

    if (!trans_id || !id_get || !factorId) { // factorId را به بررسی اضافه کنید
      console.error('Verify API Error: Missing trans_id, id_get, or factorId in request body.');
      return NextResponse.json({ message: 'trans_id, id_get, and factorId are required for verification.' }, { status: 400 });
    }

    const BITPAY_API_KEY = process.env.BITPAY_API_KEY!; // مطمئن شوید این متغیر محیطی تنظیم شده است
    if (!BITPAY_API_KEY) {
      console.error('Verify API Error: BITPAY_API_KEY is not defined.');
      return NextResponse.json({ message: 'BitPay API Key is not configured on the server.' }, { status: 500 });
    }

    const bitpayVerifyUrl = 'https://bitpay.ir/payment/gateway-result-second';

    const formData = new URLSearchParams();
    formData.append('api', BITPAY_API_KEY);
    formData.append('trans_id', trans_id.toString());
    formData.append('id_get', id_get.toString());
    formData.append('json', '1'); // درخواست خروجی JSON

    // لاگ برای دیباگ: اطلاعات ارسالی به BitPay
    console.log('Verify API: Sending to BitPay:', formData.toString());

    const response = await fetch(bitpayVerifyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    const responseText = await response.text(); // ابتدا به عنوان متن دریافت کنید
    let verificationResult;
    try {
        verificationResult = JSON.parse(responseText); // سپس سعی کنید به JSON تبدیل کنید
    } catch (parseError) {
        console.error('Verify API Error: Failed to parse BitPay response as JSON:', responseText, parseError);
        return NextResponse.json({ message: 'خطا در خواندن پاسخ از درگاه پرداخت.', bitpayRawResponse: responseText }, { status: 500 });
    }

    // لاگ برای دیباگ: پاسخ کامل از BitPay
    console.log('Verify API: Full response from BitPay:', verificationResult);

    const paymentStatus = verificationResult.status;
    // factorId را از پاسخ BitPay هم می گیریم، اما از factorId که از URL آمده استفاده می کنیم
    // چون ممکن است BitPay آن را برنگرداند یا تغییر دهد.
    // const bitpayFactorId = verificationResult.factorId;

    let orderUpdateStatus = 'failed';
    let message = 'پرداخت ناموفق بود یا خطایی رخ داد.';

    if (paymentStatus === 1) {
      orderUpdateStatus = 'completed';
      message = 'پرداخت با موفقیت انجام شد و سفارش شما ثبت گردید.';
    } else if (paymentStatus === 11) {
      orderUpdateStatus = 'completed'; // قبلاً تأیید شده
      message = 'این تراکنش قبلاً تأیید شده است.';
    } else {
      message = verificationResult.description || `خطای پرداخت: کد ${paymentStatus}`;
      console.error(`Verify API Error: BitPay status code ${paymentStatus}. Message: ${message}`);
    }

    // Update order status in Supabase
    // از factorId که از URL دریافت کردیم استفاده می کنیم
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: orderUpdateStatus,
        bitpay_trans_id: trans_id,
        bitpay_id_get: id_get,
        bitpay_amount: verificationResult.amount ? parseInt(verificationResult.amount, 10) / 10 : null, // تبدیل از ریال به تومان
        bitpay_card_num: verificationResult.cardNum || null,
      })
      .eq('id', factorId); // از factorId دریافتی از URL استفاده می کنیم

    if (updateError) {
      console.error('Verify API Error: Error updating order status in Supabase:', updateError);
      message = 'پرداخت انجام شد، اما در به‌روزرسانی وضعیت سفارش در دیتابیس خطایی رخ داد.';
      // اگر پرداخت موفق بوده ولی آپدیت دیتابیس مشکل دارد، همچنان به کاربر پیام موفقیت بدهید
      // و این خطا را برای بررسی دستی ثبت کنید.
      if (orderUpdateStatus === 'completed') {
        return NextResponse.json({ success: true, message, bitpayStatus: paymentStatus });
      }
    } else {
      console.log('Verify API: Order status updated successfully in Supabase for order ID:', factorId);
    }

    return NextResponse.json({ success: paymentStatus === 1 || paymentStatus === 11, message, bitpayStatus: paymentStatus });

  } catch (error: any) {
    console.error('Verify API Error: Exception during payment verification process:', error);
    return NextResponse.json({ message: 'Internal server error during payment verification.', error: error.message }, { status: 500 });
  }
}