import { NextResponse } from 'next/server';
import { supabaseServerClient } from '@/lib/supabase/server'; 

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { trans_id, id_get } = body;

    if (!trans_id || !id_get) {
      return NextResponse.json({ message: 'Missing transaction details' }, { status: 400 });
    }

    const BITPAY_API_KEY = process.env.BITPAY_API_KEY;
    if (!BITPAY_API_KEY) return NextResponse.json({ message: 'API Key missing' }, { status: 500 });

    // آدرس تایید تراکنش بیت‌پی
    const verifyUrl = 'https://bitpay.ir/payment/gateway-result-second';
    
    const formData = new URLSearchParams();
    formData.append('api', BITPAY_API_KEY);
    formData.append('id_get', id_get);
    formData.append('trans_id', trans_id);

    // ارسال درخواست به بیت‌پی
    const response = await fetch(verifyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
    });

    const result = await response.json();
    console.log('Verify API Result:', result);

    // بررسی وضعیت موفقیت از طرف بیت‌پی
    if (result.status === 1) {
      // دریافت آیدی سفارش (بیت‌پی گاهی order_id میفرستد گاهی factorId)
      const orderId = result.order_id || result.factorId;

      if (orderId) {
        const supabase = supabaseServerClient();
        
        // --- آپدیت وضعیت در دیتابیس ---
        const { error: updateError } = await supabase
          .from('orders')
          .update({ 
            status: 'successful',        // تغییر وضعیت به موفقیت آمیز
            trans_id: trans_id.toString() // ذخیره کد رهگیری
          })
          .eq('id', orderId);
        // -------------------------------

        if (updateError) {
          console.error('Supabase Update Error:', updateError);
          // اگر آپدیت دیتابیس خطا داد، کل فرآیند را ناموفق حساب میکنیم تا پول برگردد یا کاربر متوجه شود
          return NextResponse.json({ success: false, message: 'Database update failed', error: updateError.message }, { status: 500 });
        }

        // اگر همه چیز اوکی بود
        return NextResponse.json({ success: true, orderId });
      } else {
        return NextResponse.json({ success: false, message: 'Order ID not found in response.' }, { status: 400 });
      }
    } else {
      // اگر بیت‌پی خودش استاتوس ۱ نداد یعنی پرداخت واقعا ناموفق بوده
      console.error('BitPay Verification Failed:', result);
      return NextResponse.json({ success: false, message: 'Payment verification failed.', result });
    }

  } catch (error: any) {
    console.error('Verify API Internal Error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}