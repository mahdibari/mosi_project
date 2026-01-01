// app/api/payment/callback/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server'; // مطمئن شوید مسیر کلاینت Supabase شما صحیح است

// این تابع درخواست‌های GET به آدرس /api/payment/callback را مدیریت می‌کند
export async function GET(request: NextRequest) {
  // این لاگ‌ها برای دیباگ در کنسول Vercel بسیار مهم هستند
  console.log('--- PAYMENT CALLBACK ROUTE HIT ---');
  
  const { searchParams } = new URL(request.url);
  const authority = searchParams.get('id_get'); // شناسه تراکنش که شما به درگاه فرستادید
  const trans_id = searchParams.get('trans_id'); // شناسه تراکنش از سمت درگاه

  console.log(`Callback Data: authority=${authority}, trans_id=${trans_id}`);

  // اگر شناسه ارسال نشده باشد، کاربر را به صفحه خطا هدایت کن
  if (!authority) {
    console.error('Callback Error: Authority (id_get) is missing.');
    return NextResponse.redirect(new URL('/payment/success?status=error', request.url));
  }

  // --- مرحله ۱: تایید پرداخت از طریق درگاه ---
  // !!! توجه: این تابع فرضی است. شما باید منطق واقعی درگاه خود را در آن پیاده‌سازی کنید !!!
  const verificationResult = await verifyPaymentWithGateway(authority);

  if (verificationResult.success) {
    console.log('Payment Verification: SUCCESS');
    // --- مرحله ۲: آپدیت وضعیت سفارش در دیتابیس ---
    const supabase = createClient();
    
    // فرض می‌کنیم جدول orders شما ستونی به نام authority دارد
    const { error } = await supabase
      .from('orders')
      .update({ 
        status: 'paid', 
        transaction_id: verificationResult.ref_id // ذخیره شناسه تراکنش موفق
      })
      .eq('authority', authority);

    if (error) {
      console.error('Supabase Error: Failed to update order status.', error);
      // حتی اگر دیتابیس آپدیت نشد، چون پول کم شده، کاربر را به صفحه موفقیت بفرست
    }

    // --- مرحله ۳: هدایت کاربر به صفحه موفقیت‌آمیز ---
    const successUrl = new URL('/payment/success', request.url);
    successUrl.searchParams.set('status', 'success');
    return NextResponse.redirect(successUrl);

  } else {
    console.error('Payment Verification: FAILED', verificationResult.error);
    // --- اگر پرداخت ناموفق بود، کاربر را به صفحه شکست هدایت کن ---
    const failureUrl = new URL('/payment/success', request.url);
    failureUrl.searchParams.set('status', 'failed');
    return NextResponse.redirect(failureUrl);
  }
}

// --- تابع نمونه برای تایید پرداخت ---
// شما باید این تابع را با کدی که در مستندات درگاه پرداخت خودتان وجود دارد، جایگزین کنید

async function verifyPaymentWithGateway(authority: string): Promise<{ success: boolean; ref_id?: string; error?: string }> {
  console.log(`Verifying payment for authority: ${authority}`);

  /*
  // === مثال برای درگاه زرین‌پال ===
  try {
    const response = await fetch('https://api.zarinpal.com/pg/v4/payment/verify.json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        merchant_id: 'YOUR-MERCHANT-ID', // کلید مرچنت خود را اینجا قرار دهید
        amount: 50000, // !!! مبلغ دقیقی که برای این authority ارسال کرده بودید (به ریال) !!!
        authority: authority,
      }),
    });
    const data = await response.json();
    
    if (data.data.code === 100) {
      return { success: true, ref_id: data.data.ref_id };
    } else {
      return { success: false, error: `Verification failed with code: ${data.data.code}` };
    }
  } catch (error) {
    console.error('Network error during verification:', error);
    return { success: false, error: 'Could not connect to verification gateway' };
  }
  */

  // === برای تست، فرض می‌کنیم پرداخت همیشه موفق است ===
  // !!! حتما این بخش را با منطق واقعی درگاه خود جایگزین کنید !!!
  console.warn('WARNING: Using mock verification. Replace with real gateway logic.');
  return { success: true, ref_id: 'mock-ref-id-' + authority };
}
