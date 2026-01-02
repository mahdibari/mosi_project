import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const trans_id = searchParams.get('trans_id');
  const id_get = searchParams.get('id_get');

  if (!trans_id || !id_get) {
    return NextResponse.json({ error: 'اطلاعات از درگاه دریافت نشد' });
  }

  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // ۱. استعلام از بیت‌پی
    const verifyResponse = await fetch('https://bitpay.ir/payment/gateway-result-second', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        api: process.env.BITPAY_API_KEY!,
        id_get: id_get,
        trans_id: trans_id
      }).toString()
    });

    const responseText = await verifyResponse.text();
    let result;
    
    // هوشمندسازی برای خواندن پاسخ (چه عدد باشد چه JSON)
    try {
      result = JSON.parse(responseText);
    } catch {
      result = { status: responseText };
    }

    // ۲. بررسی موفقیت (Status 1 یعنی پرداخت اوکی بوده)
    if (result.status == "1" || result.status == 1) {
      
      // گرفتن ID سفارش از طریق factorId که بیت‌پی برمی‌گرداند
      const orderUUID = result.factorId || result.order_id;

      // ۳. عملیات اصلی: تغییر وضعیت در دیتابیس به SUCCESS
      const { data, error: dbError } = await supabaseAdmin
        .from('orders')
        .update({
          status: 'SUCCESS',        // تغییر به SUCCESS طبق درخواست شما
          payment_status: 'SUCCESS', // تغییر به SUCCESS طبق درخواست شما
          trans_id: trans_id
        })
        .eq('id', orderUUID)
        .select();

      if (dbError) {
        return NextResponse.json({ error: 'پرداخت موفق بود ولی دیتابیس آپدیت نشد', details: dbError.message });
      }

      // ۴. اگر ردیفی پیدا نشد که آپدیت شود
      if (!data || data.length === 0) {
        return NextResponse.json({ error: 'سفارشی با این آیدی در دیتابیس پیدا نشد', orderId: orderUUID });
      }

      // ۵. انتقال به صفحه موفقیت
      return NextResponse.redirect(new URL(`/payment-result?status=success&ref=${trans_id}`, request.url));

    } else {
      // اگر درگاه تایید نکرد، جزئیات را نشان بده تا بفهمیم مشکل از کجاست
      return NextResponse.json({ 
        error: 'درگاه پرداخت را تایید نکرد', 
        bitpay_status: result.status,
        full_response: result 
      });
    }

  } catch (error: any) {
    return NextResponse.json({ error: 'خطای سرور', message: error.message });
  }
}